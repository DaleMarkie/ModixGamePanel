import sys
import os
# Ensure project root is in sys.path for backend imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from modix_auto_deployment import main as modix_auto_deployment
import subprocess
import sys

# Load debug config
config_path = os.path.join(os.path.dirname(__file__), 'modix_config', 'modix_config.json')
with open(config_path) as f:
    config = json.load(f)

if __name__ == "__main__":
# Start the backend API server (api_main.py) in a subprocess
    api_main_path = os.path.join(os.path.dirname(__file__), 'api_main.py')
    api_proc = subprocess.Popen([sys.executable, api_main_path])
    try:
        # Run the auto deployment logic
        modix_auto_deployment()
    finally:
        # Optionally terminate the API process when done
        api_proc.terminate()
        api_proc.wait()
# This is the main entry point for the modix auto deployment script.

