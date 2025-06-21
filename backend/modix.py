import sys
import os
# Ensure project root is in sys.path for backend imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from modix_auto_deployment import main as modix_auto_deployment

# Load debug config
config_path = os.path.join(os.path.dirname(__file__), 'modix_config', 'modix_config.json')
with open(config_path) as f:
    config = json.load(f)

if __name__ == "__main__":
    # Only run the auto deployment logic; backend server must be started separately
    modix_auto_deployment()
# This is the main entry point for the modix auto deployment script.

