
import os
import yaml
import json
import importlib
from fastapi import FastAPI
from jsonschema import validate, ValidationError

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "module_manifest.schema.json")
MODULE_ROOT = os.path.dirname(__file__)
MODIX_CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/modix_config/modix_config.json"))
def load_modix_config():
    try:
        with open(MODIX_CONFIG_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading modix_config.json: {e}")
        return None

def load_schema():
    try:
        with open(SCHEMA_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading schema file: {e}")
        return None

def discover_manifests():
    manifests = []
    for root, dirs, files in os.walk(MODULE_ROOT):
        # Skip any directory that contains 'Game_modules' in its path
        if 'Game_modules' in root.split(os.sep):
            continue
        for file in files:
            if file == "module.yaml":
                manifests.append(os.path.join(root, file))
    return manifests

def load_and_validate_manifest(manifest_path):
    with open(manifest_path, "r") as f:
        manifest = yaml.safe_load(f)
    schema = load_schema()
    if not schema:
        print(f"Cannot validate manifest {manifest_path}: schema could not be loaded.")
        return None
    try:
        validate(instance=manifest, schema=schema)
        return manifest
    except ValidationError as e:
        print(f"INVALID manifest: {manifest_path}\n{e.message}")
        return None

def dynamic_import(router_path):
    # router_path: "module system.Core.AuditLogger.backend.routes:router"
    module_path, router_name = router_path.split(":")
    module_path = module_path.replace(" ", "_").replace("/", ".")
    module_path = module_path.replace("module system.", "module_system.")
    try:
        mod = importlib.import_module(module_path)
        return getattr(mod, router_name)
    except Exception as e:
        print(f"Failed to import {router_path}: {e}")
        return None


def register_modules(app: FastAPI):
    config = load_modix_config()
    if not config:
        print("No modix_config.json found or failed to load. No modules will be loaded.")
        return
    core_modules = set(config.get("CORE_MODULES", []))
    optional_modules = set(config.get("OPTIONAL_MODULES", []))
    enabled_modules = core_modules | optional_modules

    manifests = discover_manifests()
    not_enabled_modules = []
    for manifest_path in manifests:
        manifest = load_and_validate_manifest(manifest_path)
        if not manifest:
            continue
        module_name = manifest.get("name")
        if module_name in enabled_modules:
            router_path = manifest["backend"]["router"]
            router = dynamic_import(router_path)
            if router:
                app.include_router(router)
                print(f"Registered router for module: {manifest['name']}")
        else:
            not_enabled_modules.append(module_name)
    if not_enabled_modules:
        print("The following modules are not enabled in config and were skipped:")
        for mod in not_enabled_modules:
            print(f"  - {mod}")

# Usage example:
# from fastapi import FastAPI
# app = FastAPI()
# register_modules(app)
