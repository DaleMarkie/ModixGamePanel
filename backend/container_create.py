import json
from pathlib import Path
import docker
import importlib.util
import os
from debug_logger import DebugLogger

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

def build_volumes_dict(use_named_volume, volume_name, volume_path, bind_mount_path):
    if use_named_volume:
        return {volume_name: {"bind": volume_path, "mode": "rw"}}
    elif bind_mount_path:
        return {bind_mount_path: {"bind": volume_path, "mode": "rw"}}
    else:
        return {}

def create_container_from_config(client, config, template_path=None):
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    steam_id = base.get("GAME_STEAM_ID")
    use_named_volume = base.get("DOCKER_VOLUME_NAME", f"modix_{base.get('name', 'server').replace(' ', '_').lower()}_data")
    volume_path = base.get("DOCKER_VOLUME_PATH", "/home/steam/pzserver")
    steamappdir = volume_path  # STEAMAPPDIR is always set to the volume path
    bind_mount_path = base.get("BIND_MOUNT_PATH")
    server_name = config["ServerSettings"].get("name", Path(template_path).stem if template_path else base.get('name', 'server'))
    # New naming scheme: modix + steamid (if present) + server name
    if steam_id:
        container_name = f"modix_{steam_id}_{server_name.replace(' ', '_').lower()}"
    else:
        container_name = f"modix_{server_name.replace(' ', '_').lower()}"
    deploy_id = Path(template_path).stem if template_path else server_name.replace(' ', '_').lower()

    debug.log(f"Preparing to create container: {container_name} (Deploy ID: {deploy_id})")

    # Use PortAllocator to get available host ports for each requested container port
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
    # Map container ports to assigned host ports
    ports = {}
    for container_port, host_port in assigned_ports.items():
        proto = proto_map.get(container_port, "udp")
        if host_port is not None:
            ports[f"{container_port}/{proto}"] = host_port
            debug.log(f"Mapping container port {container_port}/{proto} to host port {host_port}")
        else:
            debug.log(f"Warning: No available host port for container port {container_port}/{proto}")

    volume_name = base.get("DOCKER_VOLUME_NAME", f"modix_{base.get('name', 'server').replace(' ', '_').lower()}_data")
    volumes = build_volumes_dict(use_named_volume, volume_name, volume_path, bind_mount_path)
    if container_exists(client, container_name):
        debug.log(f"Container '{container_name}' already exists. Skipping creation.")
        return deploy_id, container_name
    debug.log(f"Creating container '{container_name}' with image '{image}' for Steam ID {steam_id}")
    try:
        # Set restart policy based on debug mode
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
        labels = {
            "modix_deploy_id": deploy_id
        }
        # Collect extra server args from config if present
        extra_args = base.get("SERVER_ARGS", "")
        if not isinstance(extra_args, str):
            extra_args = str(extra_args)
        environment = {
            "STEAMAPPID": steam_id,
            "STEAMAPPDIR": steamappdir,
            "STEAMAPP_BRANCH": base.get("STEAMAPP_BRANCH", "public"),
            "STEAMAPP_BRANCH_PASSWORD": base.get("STEAMAPP_BRANCH_PASSWORD", None),
            "MODIX_DEBUG": str(debug_mode).lower(),
            "SERVER_ARGS": extra_args,
            "AUTO_CONFIGURE": str(base.get("AUTO_CONFIGURE", True)).lower()
        }
        container = client.containers.run(
            image,
            name=container_name,
            detach=True,
            # Remove steamcmd_command, let entrypoint handle everything
            ports=ports if ports else None,
            volumes=volumes if volumes else None,
            labels=labels,
            environment=environment,
            restart_policy=restart_policy
        )
        debug.log(f"Started container: {container.name}")
        if template_path:
            config["ContainerID"] = container.id
            with open(template_path, 'w') as f:
                json.dump(config, f, indent=2)
        # Create server instance folder and placeholder file
        server_instances_dir = os.path.join(BASE_DIR, 'server_files', 'server_instances')
        instance_folder_name = f"{deploy_id}"
        instance_folder_path = os.path.join(server_instances_dir, instance_folder_name)
        os.makedirs(instance_folder_path, exist_ok=True)
        # Create a placeholder file
        placeholder_file = os.path.join(instance_folder_path, 'placeholder.txt')
        with open(placeholder_file, 'w') as f:
            f.write(f"This is a placeholder for {container_name} (Deploy ID: {deploy_id})\n")
        return deploy_id, container.name
    except docker.errors.APIError as e:
        debug.log(f"Failed to start container '{container_name}': {e}")
        return None, None
