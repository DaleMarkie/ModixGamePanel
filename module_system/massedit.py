import os
import yaml

def clean_module_manifests():
    current_dir = os.getcwd()
    for root, dirs, files in os.walk(current_dir):
        if "module.yaml" in files:
            file_path = os.path.join(root, "module.yaml")
            with open(file_path, "r") as f:
                try:
                    data = yaml.safe_load(f) or {}
                except yaml.YAMLError as e:
                    print(f"YAML error in {file_path}: {e}")
                    continue

            modified = False

            # Remove 'enabled' key
            if 'enabled' in data:
                del data['enabled']
                modified = True

            # Fix 'website' key
            if data.get('website') != "https://modix.store":
                data['website'] = "https://modix.store"
                modified = True

            # Fix 'backend.router' string prefix
            if 'backend' in data and isinstance(data['backend'], dict):
                router = data['backend'].get('router')
                if isinstance(router, str) and router.startswith("module system."):
                    updated_router = router.replace("module system.", "module_system.", 1)
                    data['backend']['router'] = updated_router
                    modified = True

            # Write changes
            if modified:
                with open(file_path, "w") as f:
                    yaml.dump(data, f, sort_keys=False)
                print(f"Updated: {file_path}")

if __name__ == "__main__":
    clean_module_manifests()
