
import sys
import os
import platform
import json
import subprocess

# Ensure project root is in sys.path for backend imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Platform handler imports
def get_platform_handler():
    system = platform.system().lower()
    if system == "windows":
        from backend.API.Windows_Deployment.modix_auto_deployment import main as windows_auto_deployment
        return windows_auto_deployment
    else:
        from backend.API.Linux_Deployment.modix_auto_deployment import main as linux_auto_deployment
        return linux_auto_deployment

# Load debug config
config_path = os.path.join(os.path.dirname(__file__), 'modix_config', 'modix_config.json')
with open(config_path) as f:
    config = json.load(f)

if __name__ == "__main__":
    # Start the backend API server (api_main.py) in a subprocess
    api_main_path = os.path.join(os.path.dirname(__file__), 'api_main.py')
    api_proc = subprocess.Popen([sys.executable, api_main_path])
    try:
        # Select and run the correct auto deployment logic for the platform
        platform_auto_deployment = get_platform_handler()
        platform_auto_deployment()
    finally:
        # Optionally terminate the API process when done
        api_proc.terminate()
        api_proc.wait()

