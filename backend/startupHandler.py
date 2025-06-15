# =========================
# Imports
# =========================
import os
import json
from pathlib import Path
import docker
import sys
import subprocess
import importlib.util

# =========================
# Path and Global Settings
# =========================
# Get the absolute path to the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_INSTANCES_DIR = os.path.join(BASE_DIR, 'server_files', 'server_instances')
MODIX_CONFIG_PATH = os.path.join(BASE_DIR, 'modix_config', 'modix_config.json')
MODIX_CONTAINER_LABEL = "modix_managed"
managed_containers = []

# =========================
# Dynamic PortAllocator Import
# =========================
# Dynamically import PortAllocator from port_allocator.py after BASE_DIR is defined
spec = importlib.util.spec_from_file_location("port_allocator", os.path.join(BASE_DIR, "port_allocator.py"))
port_allocator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(port_allocator)
PortAllocator = port_allocator.PortAllocator

# =========================
# Config Loading Functions
# =========================
# Loads the global Modix configuration from modix_config.json
# Exits if the config file does not exist
def load_modix_config():
    if not os.path.exists(MODIX_CONFIG_PATH):
        print("Global modix_config.json does not exist.")
        sys.exit("Error: modix_config.json not found. Exiting.")
    with open(MODIX_CONFIG_PATH, 'r') as f:
        return json.load(f)

# Returns a list of server instance folders found in SERVER_INSTANCES_DIR.
def get_server_folders():
    folders = [
        f for f in Path(SERVER_INSTANCES_DIR).iterdir()
        if f.is_dir()
    ]
    # BREAKPOINT: folders contains all found server instance directories
    return folders

# Loads the first .json config in a server folder
def load_server_config(server_folder):
    """
    Loads the first .json config in a server folder and returns it as a dict.
    """
    for file in server_folder.iterdir():
        if file.name.endswith('.json'):
            with open(file, 'r') as f:
                return json.load(f)
    return None

# =========================
# Docker Container Helpers
# =========================
# Helper to check if a Docker container exists by name
def container_exists(client, container_name):
    try:
        client.containers.get(container_name)
        return True
    except docker.errors.NotFound:
        return False

def build_ports_dict(resolved_ports):
    ports = {}
    if resolved_ports:
        for entry in resolved_ports:
            proto = entry.get("protocol", "udp")
            host_port = entry.get("host_port")
            container_port = entry.get("container_port")
            if host_port and container_port:
                if host_port == container_port:
                    ports[f"{container_port}/{proto}"] = host_port
                else:
                    ports[f"{container_port}/{proto}"] = [{"HostPort": str(host_port)}]
    return ports

def build_volumes_dict(use_named_volume, volume_name, volume_path, bind_mount_path):
    if use_named_volume:
        return {volume_name: {"bind": volume_path, "mode": "rw"}}
    elif bind_mount_path:
        return {bind_mount_path: {"bind": volume_path, "mode": "rw"}}
    else:
        return {}

def get_config_path(server_folder):
    for file in os.listdir(server_folder):
        if file.endswith('.json'):
            return os.path.join(server_folder, file)
    return None

def get_ports_from_config(config):
    base_settings = config.get('BaseSettings', {})
    return base_settings.get('protocal_ports', [])

def build_ports_dict_from_config(config):
    ports = {}
    for entry in get_ports_from_config(config):
        proto = entry.get("protocol", "udp")
        host_port = entry.get("assigned_host_port")
        container_port = entry.get("desired_container_port")
        if host_port and container_port:
            ports[f"{container_port}/{proto}"] = host_port
    return ports

def container_config_mismatch(container, config):
    # Compare image and port bindings
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    current_image = container.image.tags[0] if container.image.tags else container.image.short_id
    mismatch_details = []
    mismatch = False
    if current_image != image:
        mismatch = True
        mismatch_details.append(f"Image mismatch: running '{current_image}', config '{image}'")
    # Compare ports
    desired_ports = build_ports_dict_from_config(config)
    current_ports = container.attrs['HostConfig'].get('PortBindings', {})
    if set(current_ports.keys()) != set(desired_ports.keys()):
        mismatch = True
        mismatch_details.append(f"Port keys mismatch: running {list(current_ports.keys())}, config {list(desired_ports.keys())}")
    else:
        for key in desired_ports:
            running = current_ports.get(key)
            config_val = desired_ports[key]
            if running:
                running_host_ports = [int(b['HostPort']) for b in running if 'HostPort' in b]
                if config_val not in running_host_ports:
                    mismatch = True
                    mismatch_details.append(f"Port {key} host mismatch: running {running_host_ports}, config {config_val}")
            else:
                mismatch = True
                mismatch_details.append(f"Port {key} not bound in running container.")
    return mismatch, mismatch_details

def ensure_ports_assigned(config_path, container_id=None):
    # Call port_allocator.py as a subprocess to update config and get mapping
    result = subprocess.run([
        sys.executable, os.path.join(BASE_DIR, 'port_allocator.py'), config_path
    ], capture_output=True, text=True)
    if result.returncode != 0:
        print("Port allocation failed:", result.stderr)
        sys.exit(1)
    # Reload config after port assignment
    with open(config_path, 'r') as f:
        return json.load(f)

def write_container_info(server_folder, container, image, volumes, volume_path, bind_mount_path, ports):
    info = {
        "Container": {
            "id": container.id,
            "name": container.name,
            "image": image,
            "volumes": volumes,
            "volume_path": volume_path,
            "bind_mount_path": bind_mount_path,
            "created": container.attrs.get("Created"),
            "status": container.status,
            "ports": ports,
            "labels": container.labels
        }
    }
    config_path = os.path.join(server_folder, "PZ server.json")
    with open(config_path, 'r') as f:
        existing = json.load(f)
    existing.update(info)
    with open(config_path, 'w') as f:
        json.dump(existing, f, indent=2)

# Creates and starts a SteamCMD container for a server
# BREAKPOINT: Before/after container creation for inspection
def create_or_update_container(client, server_name, config, server_folder, config_path):
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    steam_id = base.get("GAME_STEAM_ID")
    use_named_volume = base.get("USE_NAMED_VOLUME", True)
    volume_name = base.get("DOCKER_VOLUME_NAME", f"modix_{server_name.replace(' ', '_').lower()}_data")
    volume_path = base.get("DOCKER_VOLUME_PATH", "/home/steam/pzserver")
    bind_mount_path = base.get("BIND_MOUNT_PATH")
    container_name = f"modix_{server_name.replace(' ', '_').lower()}"
    ports = build_ports_dict_from_config(config)
    volumes = build_volumes_dict(use_named_volume, volume_name, volume_path, bind_mount_path)

    # Remove if exists
    if container_exists(client, container_name):
        container = client.containers.get(container_name)
        print(f"Stopping and removing container '{container_name}' to apply new configuration.")
        container.stop()
        container.remove()

    print(f"Creating container '{container_name}' with image '{image}' for Steam ID {steam_id}")
    try:
        # FIX: Place +force_install_dir before +login
        steamcmd_command = f"+force_install_dir {volume_path} +login anonymous +app_update {steam_id} validate +quit"
        container = client.containers.run(
            image,
            name=container_name,
            detach=True,
            command=steamcmd_command,
            ports=ports if ports else None,
            volumes=volumes if volumes else None,
            labels={MODIX_CONTAINER_LABEL: "1"},
            restart_policy={"Name": "unless-stopped"}
        )
        print(f"Started container: {container.name}")
        write_container_info(server_folder, container, image, volumes, volume_path, bind_mount_path, ports)
        return container.name
    except docker.errors.APIError as e:
        print(f"Failed to start container '{container_name}': {e}")
        return None

# Gets the set of ports assigned to a container by its name
def get_ports_for_container(client, container_name):
    try:
        container = client.containers.get(container_name)
        ports = set()
        port_bindings = container.attrs['NetworkSettings']['Ports']
        if port_bindings:
            for port_proto, bindings in port_bindings.items():
                if bindings:
                    for binding in bindings:
                        try:
                            ports.add(int(binding['HostPort']))
                        except (KeyError, ValueError, TypeError):
                            continue
        return ports
    except docker.errors.NotFound:
        return set()

# =========================
# Main Startup Logic
# =========================
def main():
    """
    Main entry point for starting up and managing game server containers.
    Loads configuration, allocates ports, and starts containers as needed.
    """
    client = docker.from_env()
    global managed_containers
    managed_containers = []

    modix_config = load_modix_config()
    #print("Loaded global modix_config:", modix_config)

    # Check auto_deploy
    if not modix_config.get("MODIX_AUTO_DEPLOY", False):
        print("Auto deploy is disabled in modix_config.")
        print("No containers will be started automatically.")
        return

    multi_servers = modix_config.get("MODIX_MULTI_SERVER", False)
    max_servers = modix_config.get("MODIX_MAX_SERVERS")
    if isinstance(max_servers, str) and max_servers.isdigit():
        max_servers = int(max_servers)
    elif not isinstance(max_servers, int):
        max_servers = None

    deployed_count = 0
    for server_folder in get_server_folders():
        if not multi_servers and deployed_count >= 1:
            print("multi_servers is false, only deploying one server.")
            print("make sure to set multi_servers to true in modix_config to deploy multiple servers.")
            break
        if max_servers is not None and deployed_count >= max_servers:
            print(f"MODIX_MAX_SERVERS limit ({max_servers}) reached.")
            print("make sure to increase MODIX_MAX_SERVERS in modix_config to deploy more servers.")
            break

        config_path = get_config_path(server_folder)
        if not config_path:
            print(f"No config found in {server_folder}")
            continue
        with open(config_path, 'r') as f:
            config = json.load(f)
        server_name = config["ServerSettings"].get("name", server_folder.name)
        container_name = f"modix_{server_name.replace(' ', '_').lower()}"
        # Check if container exists and matches config
        if container_exists(client, container_name):
            container = client.containers.get(container_name)
            mismatch, mismatch_details = container_config_mismatch(container, config)
            if not mismatch:
                print(f"Container '{container_name}' already exists and matches config. Skipping.")
                managed_containers.append(container_name)
                deployed_count += 1
                continue
            else:
                print(f"[ENFORCE CONFIG] Mismatch detected for '{container_name}':")
                for detail in mismatch_details:
                    print(" -", detail)
                if container.status == 'running':
                    print(f"[DEFERRED] Container '{container_name}' is running. Changes will be applied on next restart.")
                    managed_containers.append(container_name)
                    deployed_count += 1
                    continue
                else:
                    print(f"Stopping and removing container '{container_name}' to enforce config.")
                    container.stop()
                    container.remove()
        # Ensure ports are assigned and config is up to date
        config = ensure_ports_assigned(config_path, container_id=None)
        # Create or update container
        created_name = create_or_update_container(client, server_name, config, str(server_folder), config_path)
        if created_name:
            managed_containers.append(created_name)
            deployed_count += 1

    print("Managed containers:", managed_containers)

if __name__ == '__main__':
    # Entry point for running the startup handler script
    main()