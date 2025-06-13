import os
import json

SERVER_FILES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../server_files")
os.makedirs(SERVER_FILES_DIR, exist_ok=True)

MODIX_CONFIG_PATH = os.path.join(SERVER_FILES_DIR, "modix_config.json")
USERS_FILE_PATH = os.path.join(SERVER_FILES_DIR, "users.json")
DOCKER_STATE_PATH = os.path.join(SERVER_FILES_DIR, "docker_state.json")

DEFAULT_CONFIG = {
    "MODIX_VERSION": "Latest",
    "MODIX_INSTANCE_ID": "modex",
    "MODIX_AUTO_DEPLOY": False,
    "MODIX_GAME_TEMPLATE": None,
    "GAME_IS_STEAM": True,
    "GAME_STEAM_ID": 108600,
    "GAME_PORT": None,
    "GAME_PATH": None,
    "MODIX_MODULES": None,
    "MODIX_CLUSTER": False,
    "MODIX_USERNAME": None,
    "MODIX_PASSWORD": None,
    "MODIX_REQUIRE_AUTH": None,
    "MODIX_SESSION_TIMEOUT": None,
    "MODIX_ALLOW_USER_CREATION": True,
    "MODIX_MULTI_SERVER": True,
    "MODIX_CREATE_CONTAINERS": False,
    "MODIX_LINK_CONTAINERS_NETWORK": None,
    "MODIX_WS_PORT": None,
    "MODIX_PORT_ALLOCATION": None,
    "MODIX_SANDBOX": None,
    "MODIX_DEBUG": None,
    "MODIX_BLACKLISTED_IMAGES": None,
    "MODIX_WHITELISTED_IMAGES": None
}

EXAMPLE_USER = {
    "id": 1,
    "username": "example_user",
    "password_hash": "<hashed_password>",
    "attributes": {
        "role": "admin"
    }
}

DOCKER_STATE_TEMPLATE = {
    "containers": [],
    "info": "Tracks docker containers owned by the main program. Each entry should include container id, name, image, status, ports, env, startup command, etc."
}

def generate_modix_config():
    if not os.path.exists(MODIX_CONFIG_PATH):
        with open(MODIX_CONFIG_PATH, "w") as f:
            json.dump(DEFAULT_CONFIG, f, indent=4)

def generate_users_file():
    if not os.path.exists(USERS_FILE_PATH):
        with open(USERS_FILE_PATH, "w") as f:
            json.dump([EXAMPLE_USER], f, indent=4)

def generate_docker_state_file():
    if not os.path.exists(DOCKER_STATE_PATH):
        with open(DOCKER_STATE_PATH, "w") as f:
            json.dump(DOCKER_STATE_TEMPLATE, f, indent=4)

def main():
    generate_modix_config()
    generate_users_file()
    generate_docker_state_file()
    print("Config files generated in ./server_files")

# The functions above can be imported and called from another script.
if __name__ == "__main__":
    main()
