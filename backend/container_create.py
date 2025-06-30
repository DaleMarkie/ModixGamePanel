import json
from pathlib import Path
import docker
import importlib.util
import os
from backend.debug_logger import DebugLogger
from sqlalchemy.orm import sessionmaker
from backend.API.Core.models import Container, Base
from sqlalchemy.orm import Session
from backend.API.Core.database import SessionLocal

# Dynamically import PortAllocator from port_allocator.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
port_allocator_spec = importlib.util.spec_from_file_location("port_allocator", os.path.join(BASE_DIR, "port_allocator.py"))
port_allocator = importlib.util.module_from_spec(port_allocator_spec)
port_allocator_spec.loader.exec_module(port_allocator)
PortAllocator = port_allocator.PortAllocator

debug = DebugLogger()

def container_exists(client, container_name):
    try:
        client.containers.get(container_name)
        return True
    except docker.errors.NotFound:
        return False

def build_volumes_dict(client, use_named_volume, volume_name, volume_path, bind_mount_path, deploy_id=None):
    # If using a named volume, ensure it exists and is labeled
    if use_named_volume:
        # Check if volume exists
        try:
            client.volumes.get(volume_name)
            debug.log(f"[VOLUME] Volume '{volume_name}' already exists.")
        except Exception:
            # Create volume with label if it doesn't exist
            client.volumes.create(name=volume_name, labels={"modix_deploy_id": deploy_id} if deploy_id else None)
            debug.log(f"[VOLUME] Created new volume '{volume_name}' with label modix_deploy_id={deploy_id}.")
        return {volume_name: {"bind": volume_path, "mode": "rw"}}
    elif bind_mount_path:
        return {bind_mount_path: {"bind": volume_path, "mode": "rw"}}
    else:
        return {}

def add_container_to_db(container_name, docker_id, description=None):
    """
    Adds a new container record to the modix.db database if it does not already exist.
    Args:
        container_name (str): The name of the container (unique).
        docker_id (str): The Docker container ID (unique).
        description (str, optional): Description for the container.
    """
    db: Session = SessionLocal()
    if not db.query(Container).filter_by(name=container_name).first():
        db.add(Container(name=container_name, docker_id=docker_id, description=description or ""))
        db.commit()
    db.close()

def get_container_name_and_id(base, template_path):
    server_name = base.get("MODIX_SERVER_NAME", Path(template_path).stem if template_path else base.get('name', 'server'))
    steam_id = base.get("GAME_STEAM_ID")
    if steam_id:
        container_name = f"modix_{steam_id}_{server_name.replace(' ', '_').lower()}"
    else:
        container_name = f"modix_{server_name.replace(' ', '_').lower()}"
    deploy_id = Path(template_path).stem if template_path else server_name.replace(' ', '_').lower()
    return container_name, deploy_id, server_name

def get_ports_and_volumes(client, base, deploy_id=None):
    requested_ports = []
    proto_map = {}
    for entry in base.get('protocal_ports', []):
        proto = entry.get("protocol", "udp")
        container_port = entry.get("desired_container_port")
        if container_port:
            requested_ports.append(container_port)
            proto_map[container_port] = proto
    allocator = PortAllocator()
    assigned_ports = allocator.get_available_ports_from_list(requested_ports)
    ports = {}
    for container_port, host_port in assigned_ports.items():
        proto = proto_map.get(container_port, "udp")
        if host_port is not None:
            ports[f"{container_port}/{proto}"] = host_port
            debug.log(f"Mapping container port {container_port}/{proto} to host port {host_port}")
        else:
            debug.log(f"Warning: No available host port for container port {container_port}/{proto}")
    use_named_volume = base.get("DOCKER_VOLUME_NAME", f"modix_{base.get('name', 'server').replace(' ', '_').lower()}_data")
    volume_path = base.get("DOCKER_VOLUME_PATH", "/data")
    bind_mount_path = base.get("BIND_MOUNT_PATH")
    volume_name = base.get("DOCKER_VOLUME_NAME", f"modix_{base.get('name', 'server').replace(' ', '_').lower()}_data")
    volumes = build_volumes_dict(client, use_named_volume, volume_name, volume_path, bind_mount_path, deploy_id=deploy_id)
    return ports, volumes

def create_container(config: dict, dockerClient, template_path=None):
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    if image != "modix-steamcmd-game-server:latest":
        return create_generic_container_from_config(dockerClient, config, template_path)
    else:
        return create_container_from_config(dockerClient, config, template_path)

def create_generic_container_from_config(client, config, template_path=None):
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    container_name, deploy_id, server_name = get_container_name_and_id(base, template_path)
    ports, volumes = get_ports_and_volumes(client, base, deploy_id=deploy_id)
    if container_exists(client, container_name):
        debug.log(f"Container '{container_name}' already exists. Skipping creation.")
        return deploy_id, container_name
    debug.log(f"Creating generic container '{container_name}' with image '{image}'")
    try:
        environment = base.get("environment_variables", {})
        restart_policy = {"Name": "unless-stopped"}
        labels = {"modix_deploy_id": deploy_id}
        container = client.containers.run(
            image,
            name=container_name,
            detach=True,
            ports=ports if ports else None,
            volumes=volumes if volumes else None,
            labels=labels,
            environment=environment,
            restart_policy=restart_policy
        )
        debug.log(f"Started generic container: {container.name}")
        add_container_to_db(container.name, container.id, description=server_name)
        if template_path:
            config["ContainerID"] = container.id
            with open(template_path, 'w') as f:
                json.dump(config, f, indent=2)
        server_instances_dir = os.path.join(BASE_DIR, 'server_files', 'server_instances')
        instance_folder_name = f"{deploy_id}"
        instance_folder_path = os.path.join(server_instances_dir, instance_folder_name)
        os.makedirs(instance_folder_path, exist_ok=True)
        # Create terminal_logs directory for persistent terminal output
        terminal_logs_path = os.path.join(instance_folder_path, 'terminal_logs')
        os.makedirs(terminal_logs_path, exist_ok=True)
        placeholder_file = os.path.join(instance_folder_path, 'placeholder.txt')
        with open(placeholder_file, 'w') as f:
            f.write(f"This is a placeholder for {container_name} (Deploy ID: {deploy_id})\n")
        return deploy_id, container.name
    except docker.errors.APIError as e:
        debug.log(f"Failed to start generic container '{container_name}': {e}")
        return None, None

def create_container_from_config(client, config, template_path=None):
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    container_name, deploy_id, server_name = get_container_name_and_id(base, template_path)
    ports, volumes = get_ports_and_volumes(client, base, deploy_id=deploy_id)
    if container_exists(client, container_name):
        debug.log(f"Container '{container_name}' already exists. Skipping creation.")
        return deploy_id, container_name
    debug.log(f"Creating container '{container_name}' with image '{image}' for Steam ID {base.get('GAME_STEAM_ID')}")
    try:
        debug_mode = False
        try:
            with open(os.path.join(BASE_DIR, 'modix_config', 'modix_config.json'), 'r') as f:
                modix_config = json.load(f)
                debug_mode = modix_config.get('MODIX_DEBUG_LOG', False)
        except Exception:
            pass
        restart_policy = {"Name": "unless-stopped"}
        if debug_mode:
            restart_policy = {"Name": "no"}
        labels = {"modix_deploy_id": deploy_id}
        extra_args = base.get("SERVER_ARGS", "")
        if not isinstance(extra_args, str):
            extra_args = str(extra_args)
        environment = {
            "STEAMAPPID": base.get("GAME_STEAM_ID"),
            "STEAMAPPDIR": base.get("DOCKER_VOLUME_PATH", "/home/steam/pzserver"),
            "STEAMAPP_BRANCH": base.get("STEAMAPP_BRANCH", "public"),
            "STEAMAPP_BRANCH_PASSWORD": base.get("STEAMAPP_BRANCH_PASSWORD", None),
            "MODIX_DEBUG": str(debug_mode).lower(),
            "SERVER_ARGS": extra_args,
            "AUTO_CONFIGURE": str(base.get("AUTO_CONFIGURE", True)).lower(),
            "CUSTOM_START_SCRIPT": base.get("CUSTOM_START_SCRIPT", "")
        }
        container = client.containers.run(
            image,
            name=container_name,
            detach=True,
            ports=ports if ports else None,
            volumes=volumes if volumes else None,
            labels=labels,
            environment=environment,
            restart_policy=restart_policy
        )
        debug.log(f"Started container: {container.name}")
        add_container_to_db(container.name, container.id, description=server_name)
        if template_path:
            config["ContainerID"] = container.id
            with open(template_path, 'w') as f:
                json.dump(config, f, indent=2)
        server_instances_dir = os.path.join(BASE_DIR, 'server_files', 'server_instances')
        instance_folder_name = f"{deploy_id}"
        instance_folder_path = os.path.join(server_instances_dir, instance_folder_name)
        os.makedirs(instance_folder_path, exist_ok=True)
        # Create terminal_logs directory for persistent terminal output
        terminal_logs_path = os.path.join(instance_folder_path, 'terminal_logs')
        os.makedirs(terminal_logs_path, exist_ok=True)
        placeholder_file = os.path.join(instance_folder_path, 'placeholder.txt')
        with open(placeholder_file, 'w') as f:
            f.write(f"This is a placeholder for {container_name} (Deploy ID: {deploy_id})\n")
        return deploy_id, container.name
    except docker.errors.APIError as e:
        debug.log(f"Failed to start container '{container_name}': {e}")
        return None, None
