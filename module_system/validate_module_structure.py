import os
import yaml
import json
from jsonschema import validate, ValidationError

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "module_manifest.schema.json")

def validate_manifest(manifest_path):
    try:
        with open(SCHEMA_PATH, "r") as f:
            schema = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"ERROR: Failed to load schema file '{SCHEMA_PATH}': {e}")
        return False

    with open(manifest_path, "r") as f:
        manifest = yaml.safe_load(f)
    try:
        validate(instance=manifest, schema=schema)
        print(f"VALID: {manifest_path}")
        return True
    except ValidationError as e:
        print(f"INVALID: {manifest_path}\n{e.message}")
        return False

def scan_modules(base_dir):
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file == "module.yaml":
                validate_manifest(os.path.join(root, file))

if __name__ == "__main__":
    scan_modules(os.path.dirname(__file__))
