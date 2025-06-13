import os
import sys
import json
from generate_config_files import main as generate_config_files_main

SERVER_FILES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../server_files")
MODIX_CONFIG_PATH = os.path.join(SERVER_FILES_DIR, "modix_config.json")

def is_first_start():
    return not os.path.exists(MODIX_CONFIG_PATH)

def overwrite_config_from_args(args):
    if not os.path.exists(MODIX_CONFIG_PATH):
        return
    with open(MODIX_CONFIG_PATH, "r") as f:
        config = json.load(f)
    updated = False
    for arg in args:
        if arg.startswith("--") and "=" in arg:
            key, value = arg[2:].split("=", 1)
            if key in config:
                # Try to cast value to correct type
                orig = config[key]
                if isinstance(orig, bool):
                    value = value.lower() in ("true", "1", "yes")
                elif isinstance(orig, int):
                    try:
                        value = int(value)
                    except ValueError:
                        continue
                elif value.lower() == "null":
                    value = None
                config[key] = value
                updated = True
    if updated:
        with open(MODIX_CONFIG_PATH, "w") as f:
            json.dump(config, f, indent=4)
        print("Config file updated from startup arguments.")

def handle_startup_commands(args):
    # Example: handle custom startup commands here
    if "--reset-config" in args:
        print("Resetting config files...")
        # Remove config files if they exist
        for fname in ["modix_config.json", "users.json", "docker_state.json"]:
            fpath = os.path.join(SERVER_FILES_DIR, fname)
            if os.path.exists(fpath):
                os.remove(fpath)
        generate_config_files_main()
        print("Config files reset.")
        return

    # Add more command handlers as needed

def startup_handler():
    args = sys.argv[1:]
    handle_startup_commands(args)
    if is_first_start():
        print("First server start detected. Generating config files...")
        generate_config_files_main()
    else:
        print("Config files found. Continuing startup.")
    overwrite_config_from_args(args)

if __name__ == "__main__":
    startup_handler()
