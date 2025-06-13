import os
import json
from pathlib import Path
import docker

SERVER_INSTANCES_DIR = '/home/rhyke/Modix/modix-panel/backend/server_files/server_instances'
MODIX_CONFIG_PATH = '/home/rhyke/Modix/modix-panel/backend/modix_config.json'
MODIX_CONTAINER_LABEL = "modix_managed"
managed_containers = []

def load_modix_config():
    if not os.path.exists(MODIX_CONFIG_PATH):
        print("Global modix_config.json does not exist.")
        return None
    with open(MODIX_CONFIG_PATH, 'r') as f:
        return json.load(f)

def get_server_folders():
    return [
        f for f in Path(SERVER_INSTANCES_DIR).iterdir()
        if f.is_dir()
    ]

def load_server_config(server_folder):
    for file in server_folder.iterdir():
        if file.name.endswith('.json'):
            with open(file, 'r') as f:
                return json.load(f)
    return None

def container_exists(client, container_name):
    try:
        client.containers.get(container_name)
        return True
    except docker.errors.NotFound:
        return False

def create_steamcmd_container(client, server_name, config):
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    steam_id = base.get("GAME_STEAM_ID")
    use_named_volume = base.get("USE_NAMED_VOLUME", True)
    volume_name = base.get("DOCKER_VOLUME_NAME", f"modix_{server_name.replace(' ', '_').lower()}_data")
    volume_path = base.get("DOCKER_VOLUME_PATH", "/home/steam/pzserver")
    bind_mount_path = base.get("BIND_MOUNT_PATH")
    container_name = f"modix_{server_name.replace(' ', '_').lower()}"

    ports = {}
    port = config["ServerSettings"].get("port")
    if port:
        ports[f"{port}/udp"] = port
    rcon_port = config["ServerSettings"].get("rcon_port")
    if rcon_port:
        ports[f"{rcon_port}/tcp"] = rcon_port

    # Volume configuration
    if use_named_volume:
        volumes = {volume_name: {"bind": volume_path, "mode": "rw"}}
    elif bind_mount_path:
        volumes = {bind_mount_path: {"bind": volume_path, "mode": "rw"}}
    else:
        volumes = {}

    # Only create if not already present
    if container_exists(client, container_name):
        print(f"Container '{container_name}' already exists. Skipping.")
        return container_name

    print(f"Creating container '{container_name}' with image '{image}' for Steam ID {steam_id}")
    try:
        container = client.containers.run(
            image,
            name=container_name,
            detach=True,
            command=f"+login anonymous +force_install_dir {volume_path} +app_update {steam_id} validate +quit",
            ports=ports if ports else None,
            volumes=volumes if volumes else None,
            labels={MODIX_CONTAINER_LABEL: "1"},
            restart_policy={"Name": "unless-stopped"}
        )
        print(f"Started container: {container.name}")
        return container.name
    except docker.errors.APIError as e:
        print(f"Failed to start container '{container_name}': {e}")
        return None

def main():
    client = docker.from_env()
    global managed_containers
    managed_containers = []

    modix_config = load_modix_config()
    print("Loaded global modix_config:", modix_config)

    # Check auto_deploy
    if not modix_config or not modix_config.get("auto_deploy", False):
        print("Auto deploy is disabled in modix_config.")
        return

    multi_servers = modix_config.get("multi_servers", False)
    max_servers = modix_config.get("MODIX_MAX_SERVERS")
    if isinstance(max_servers, str) and max_servers.isdigit():
        max_servers = int(max_servers)
    elif not isinstance(max_servers, int):
        max_servers = None

    deployed_count = 0
    for server_folder in get_server_folders():
        if not multi_servers and deployed_count >= 1:
            print("multi_servers is false, only deploying one server.")
            break
        if max_servers is not None and deployed_count >= max_servers:
            print(f"MODIX_MAX_SERVERS limit ({max_servers}) reached.")
            break

        config = load_server_config(server_folder)
        if not config:
            print(f"No config found in {server_folder}")
            continue
        server_name = config["ServerSettings"].get("name", server_folder.name)
        container_name = create_steamcmd_container(client, server_name, config)
        if container_name:
            managed_containers.append(container_name)
            deployed_count += 1

    print("Managed containers:", managed_containers)

if __name__ == '__main__':
    main()