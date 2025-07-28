import os
import json
import inspect

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODIX_CONFIG_PATH = os.path.join(BASE_DIR, 'modix_config', 'modix_config.json')


class DebugLogger:
    def __init__(self, enabled=None, config_path=MODIX_CONFIG_PATH, prefix="[DEBUG]", output_stream=None):
        self.prefix = prefix
        self.output_stream = output_stream or None  # None means default to print
        if enabled is not None:
            self.enabled = enabled
        else:
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
            log_message = f"{self.prefix}[{func_name}] {message}"
            if self.output_stream:
                print(log_message, file=self.output_stream)
            else:
                print(log_message)

    def set_enabled(self, enabled: bool):
        self.enabled = enabled

    def set_prefix(self, prefix: str):
        self.prefix = prefix

    def set_output_stream(self, stream):
        self.output_stream = stream

# Usage example:
# debug = DebugLogger()
# debug.log("This is a debug message.")
