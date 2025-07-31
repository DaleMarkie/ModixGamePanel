import os
import yaml

def remove_nav_item_permission(yaml_path):
    print(f"Processing file: {yaml_path}")
    with open(yaml_path, 'r') as f:
        data = yaml.safe_load(f)

    # Check for frontend > nav_items
    frontend = data.get('frontend')
    if frontend and 'nav_items' in frontend:
        for item in frontend['nav_items']:
            if isinstance(item, dict):
                if 'permission' in item:
                    print(f"  Removing 'permission' from nav_item: {item.get('label', item)}")
                    del item['permission']
                # Handle submenu if present
                if 'submenu' in item and isinstance(item['submenu'], list):
                    for subitem in item['submenu']:
                        if isinstance(subitem, dict) and 'permission' in subitem:
                            print(f"    Removing 'permission' from submenu item: {subitem.get('label', subitem)}")
                            del subitem['permission']

    with open(yaml_path, 'w') as f:
        yaml.dump(data, f, sort_keys=False, allow_unicode=True)

def find_and_process_yaml_files(root_dir):
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.yaml'):
                yaml_path = os.path.join(dirpath, filename)
                remove_nav_item_permission(yaml_path)

if __name__ == "__main__":
    find_and_process_yaml_files('.')