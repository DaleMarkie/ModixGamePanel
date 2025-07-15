import os
import yaml
import argparse

MODULE_TEMPLATE = {
    "name": "",
    "version": "1.0.0",
    "description": "",
    "author": "Modix Team",
    "website": "https://modix.store",
    "enabled": True,
    "permissions": [],
    "frontend": {
        "routes": [],
        "nav_items": []
    },
    "backend": {
        "router": ""
    }
}

def create_module(base_dir, category, module_name):
    module_dir = os.path.join(base_dir, category, module_name)
    backend_dir = os.path.join(module_dir, "backend")
    frontend_dir = os.path.join(module_dir, "frontend")
    os.makedirs(backend_dir, exist_ok=True)
    os.makedirs(frontend_dir, exist_ok=True)
    manifest = MODULE_TEMPLATE.copy()
    manifest["name"] = module_name
    manifest["description"] = f"Description for {module_name}."
    manifest["backend"]["router"] = f"module_system.{category}.{module_name}.backend.routes:router"
    manifest_path = os.path.join(module_dir, "module.yaml")
    with open(manifest_path, "w") as f:
        yaml.dump(manifest, f, sort_keys=False)
    print(f"Module created at {module_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a new module.")
    parser.add_argument("category", help="Module category (e.g., Core, Optional, Game Modules/<Game>)")
    parser.add_argument("module_name", help="Name of the module")
    args = parser.parse_args()
    base_dir = os.path.dirname(__file__)
    create_module(base_dir, args.category, args.module_name)
