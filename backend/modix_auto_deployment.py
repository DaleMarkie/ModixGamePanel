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
import uuid
from debug_logger import DebugLogger

# =========================
# Path and Global Settings
# =========================
# Get the absolute path to the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_INSTANCES_DIR = os.path.join(BASE_DIR, 'server_files', 'server_instances')
DEPLOY_TEMPLATES_DIR = os.path.join(BASE_DIR, 'server_files', 'AutoDeployment')
MODIX_CONFIG_PATH = os.path.join(BASE_DIR, 'modix_config', 'modix_config.json')
MODIX_CONTAINER_LABEL = "modix_managed"
managed_containers = []
debug = DebugLogger()

# =========================
# Dynamic PortAllocator Import
# =========================
# Dynamically import PortAllocator from port_allocator.py after BASE_DIR is defined
spec = importlib.util.spec_from_file_location("port_allocator", os.path.join(BASE_DIR, "port_allocator.py"))
port_allocator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(port_allocator)
PortAllocator = port_allocator.PortAllocator

# Dynamically import container_create
container_create_spec = importlib.util.spec_from_file_location("container_create", os.path.join(BASE_DIR, "container_create.py"))
container_create = importlib.util.module_from_spec(container_create_spec)
container_create_spec.loader.exec_module(container_create)

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

def get_deploy_templates():
    return [
        f for f in Path(DEPLOY_TEMPLATES_DIR).iterdir()
        if f.is_file() and f.name.endswith('.json')
    ]

def load_template_config(template_path):
    with open(template_path, 'r') as f:
        return json.load(f)

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
    debug.log(f"Loaded global modix_config: {modix_config}")

    # Check auto_deploy
    if not modix_config.get("MODIX_AUTO_DEPLOY", False):
        debug.log("Auto deploy is disabled in modix_config. No containers will be started automatically.")
        print("Auto deploy is disabled in modix_config.")
        print("No containers will be started automatically.")
        return

    deployed_count = 0
    for template_path in get_deploy_templates():
        config = load_template_config(template_path)
        # Check if the container already exists before attempting to create
        base = config.get("BaseSettings", {})
        server_name = config["ServerSettings"].get("name", Path(template_path).stem if template_path else base.get('name', 'server'))
        steam_id = base.get("GAME_STEAM_ID")
        if steam_id:
            container_name = f"modix_{steam_id}_{server_name.replace(' ', '_').lower()}"
        else:
            container_name = f"modix_{server_name.replace(' ', '_').lower()}"
        client = docker.from_env()
        try:
            client.containers.get(container_name)
            debug.log(f"Container '{container_name}' already exists. Skipping creation.")
            managed_containers.append(container_name)
            continue
        except docker.errors.NotFound:
            pass
        deploy_id, created_container_name = container_create.create_container_from_config(client, config, str(template_path))
        if created_container_name:
            managed_containers.append(created_container_name)
            deployed_count += 1
            # Update the template file with deploy_id and container_name
            config['DeployID'] = deploy_id
            config['ContainerName'] = created_container_name
            with open(template_path, 'w') as f:
                json.dump(config, f, indent=2)
            debug.log(f"Deployed container: {created_container_name} (Deploy ID: {deploy_id})")
        else:
            debug.log(f"Failed to deploy container for template: {template_path}")

    debug.log(f"Managed containers: {managed_containers}")
    print("Managed containers:", managed_containers)

if __name__ == '__main__':
    # Entry point for running the startup handler script
    main()