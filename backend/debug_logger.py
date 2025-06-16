import os
import json
import inspect

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODIX_CONFIG_PATH = os.path.join(BASE_DIR, 'modix_config', 'modix_config.json')

class DebugLogger:
    def __init__(self, config_path=MODIX_CONFIG_PATH):
        self.enabled = False
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.enabled = config.get('MODIX_DEBUG_LOG', False)
        except Exception:
            pass

    def log(self, message, func_name=None):
        if self.enabled:
            if func_name is None:
                func_name = inspect.stack()[1].function
            print(f"[DEBUG][{func_name}] {message}")

# Usage example:
# debug = DebugLogger()
# debug.log("This is a debug message.")
