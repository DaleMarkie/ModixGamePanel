from flask import Flask, request, Response, jsonify, abort, send_file, send_from_directory
from flask_cors import CORS
import json
import os
from threading import Lock
import datetime
from myservers import myservers_bp


app = Flask(__name__)
CORS(app)

app.register_blueprint(myservers_bp)


# === CONFIG ===
WORKSHOP_DIR = "/Steam/steamapps/workshop/content/108600"
INI_PATH = "/Zomboid/Server/servertest.ini"
NOTES_FILE = "mod_notes.json"
notes_lock = Lock()

# === UTILITY ===
def get_folder_size_readable(path):
    total_size = 0
    for dirpath, _, filenames in os.walk(path):
        for f in filenames:
            try:
                total_size += os.path.getsize(os.path.join(dirpath, f))
            except Exception:
                continue
    for unit in ['B','KB','MB','GB']:
        if total_size < 1024.0:
            return f"{total_size:.1f}{unit}"
        total_size /= 1024.0
    return f"{total_size:.1f}TB"

def load_notes():
    if not os.path.exists(NOTES_FILE):
        return {}
    with open(NOTES_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_notes(notes_data):
    with open(NOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(notes_data, f, indent=2, ensure_ascii=False)

# === SETTINGS FILE ENDPOINT ===
@app.route('/api/settings/file', methods=['GET'])
def get_ini_file():
    try:
        with open(INI_PATH, 'r') as f:
            content = f.read()
        return Response(content, mimetype='text/plain')
    except Exception as e:
        return Response(f"Error reading file: {e}", status=500, mimetype='text/plain')

@app.route('/api/settings/file', methods=['POST'])
def save_ini_file():
    try:
        new_content = request.data.decode('utf-8')
        with open(INI_PATH, 'w') as f:
            f.write(new_content)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def get_enabled_workshop_ids():
    ids = []
    if not os.path.isfile(INI_PATH):
        return ids
    try:
        with open(INI_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("WorkshopItems="):
                    ids = [i.strip() for i in line.split("=", 1)[1].split(";") if i.strip()]
                    break
    except Exception as e:
        print(f"Error reading WorkshopItems from ini: {e}")
    return ids


@app.route("/api/mods")
def list_mods():
    mods = []
    active_mod_ids = get_active_mods()
    enabled_workshop_ids = get_enabled_workshop_ids()

    for mod_id in os.listdir(WORKSHOP_DIR):
        mod_path = os.path.join(WORKSHOP_DIR, mod_id)
        info_path = os.path.join(mod_path, "mod.info")
        poster_path = os.path.join(mod_path, "poster.png")

        if not os.path.isfile(info_path):
            continue

        try:
            with open(info_path, "r", encoding="utf-8") as f:
                lines = f.read().splitlines()
                mod_info = {}
                for line in lines:
                    if "=" in line:
                        k, v = line.split("=", 1)
                        mod_info[k.strip()] = v.strip()

            mod_name = mod_info.get("name", "Unknown Mod")
            mod_ids = mod_info.get("id", "").split(";")  # Some mods may list multiple mod ids

            mods.append({
                "steamId": mod_id,
                "title": mod_name,
                "description": mod_info.get("description", "No description"),
                "author": mod_info.get("id", "Unknown Author"),
                "version": mod_info.get("version", "N/A"),
                "image": f"/api/mods/{mod_id}/poster" if os.path.exists(poster_path) else None,
                "tags": mod_info.get("tags", "").split(";") if "tags" in mod_info else [],
                "fileSize": get_folder_size_readable(mod_path),
                "modIds": mod_ids,
                "enabled": mod_id in enabled_workshop_ids or any(mid in active_mod_ids for mid in mod_ids),
            })
        except Exception as e:
            print(f"Failed to read {mod_id}: {e}")
            continue

    return jsonify(mods)


# === MOD DETAILS ===
@app.route("/api/mods/<mod_id>")
def get_mod(mod_id):
    mod_path = os.path.join(WORKSHOP_DIR, mod_id)
    if not os.path.isdir(mod_path):
        return jsonify({"error": "Mod not found"}), 404

    active_mods = get_active_mods()

    meta_path = os.path.join(mod_path, "modinfo.json")
    info_path = os.path.join(mod_path, "mod.info")
    data = {
        "workshopId": mod_id,
        "title": f"Mod {mod_id}",
        "description": "",
        "image": f"/api/mods/{mod_id}/poster",
        "isActive": mod_id in active_mods,
    }

    if os.path.isfile(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
                data.update({
                    "title": meta.get("title", data["title"]),
                    "description": meta.get("description", ""),
                    "author": meta.get("author", "Unknown"),
                    "version": meta.get("version", ""),
                    "lastUpdated": meta.get("lastUpdated", ""),
                    "fileSize": meta.get("fileSize", get_folder_size_readable(mod_path)),
                    "tags": meta.get("tags", []),
                })
        except Exception as e:
            print(f"Error loading modinfo.json for {mod_id}: {e}")
    elif os.path.isfile(info_path):
        try:
            with open(info_path, "r", encoding="utf-8") as f:
                for line in f:
                    if "=" in line:
                        k, v = line.strip().split("=", 1)
                        data[k.strip()] = v.strip()
        except Exception as e:
            print(f"Error reading mod.info for {mod_id}: {e}")

    return jsonify(data)


# === POSTER ===
@app.route("/api/mods/<mod_id>/poster")
def get_mod_poster(mod_id):
    img_path = os.path.join(WORKSHOP_DIR, mod_id, "poster.png")
    if os.path.exists(img_path):
        return send_file(img_path, mimetype="image/png")
    return "", 404

# === MOD NOTES ===
@app.route("/api/mods/notes/<mod_id>", methods=["GET"])
def get_mod_notes(mod_id):
    with notes_lock:
        notes_data = load_notes()
    notes = notes_data.get(mod_id, "")
    return jsonify({"notes": notes})

@app.route("/api/mods/notes/<mod_id>", methods=["POST"])
def save_mod_notes(mod_id):
    if not request.is_json:
        abort(400, description="Request body must be JSON")
    data = request.get_json()
    notes = data.get("notes")
    if notes is None:
        abort(400, description="Missing 'notes' field")

    with notes_lock:
        notes_data = load_notes()
        notes_data[mod_id] = notes
        save_notes(notes_data)

    return jsonify({"status": "success", "mod_id": mod_id, "notes": notes})

def get_active_mods():
    active_mods = set()
    if not os.path.isfile(INI_PATH):
        return active_mods
    try:
        with open(INI_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("Mods="):
                    mods_line = line.strip().split("=", 1)[1]
                    mods = [mod.strip() for mod in mods_line.split(",") if mod.strip()]
                    active_mods.update(mods)
                    break
    except Exception as e:
        print(f"Error reading active mods from ini: {e}")
    return active_mods

# === FILE MANAGER API ===
FILE_BASE_DIR = "/Zomboid"  # Set your base file path

def safe_join(base, *paths):
    final_path = os.path.abspath(os.path.join(base, *paths))
    if not final_path.startswith(base):
        raise ValueError("Unsafe file path detected.")
    return final_path

@app.route("/api/files", methods=["GET"])
def list_files():
    rel_path = request.args.get("path", "")
    try:
        full_path = safe_join(FILE_BASE_DIR, rel_path)
        if not os.path.exists(full_path):
            return jsonify({"error": "Path does not exist"}), 404

        files = []
        for name in os.listdir(full_path):
            item_path = os.path.join(full_path, name)
            stat = os.stat(item_path)
            files.append({
                "name": name,
                "type": "folder" if os.path.isdir(item_path) else "file",
                "size": stat.st_size,
                "modified": datetime.datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
            })
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/file", methods=["GET", "POST"])
def handle_file():
    path = request.args.get("path")
    if not path:
        return jsonify({"error": "Missing 'path'"}), 400
    try:
        full_path = safe_join(FILE_BASE_DIR, path)

        if request.method == "GET":
            if not os.path.isfile(full_path):
                return jsonify({"error": "File not found"}), 404
            with open(full_path, "r", encoding="utf-8") as f:
                return f.read(), 200, {"Content-Type": "text/plain; charset=utf-8"}

        if request.method == "POST":
            data = request.get_json()
            if not data or "content" not in data:
                return jsonify({"error": "Missing 'content' in request body"}), 400
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(data["content"])
            return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@app.route("/api/server-mods", methods=["GET"])
def get_enabled_mods():
    ini_path = "/home/modix/Zomboid/Server/servertest.ini"
    enabled_workshop_ids = []
    enabled_mod_ids = []

    if os.path.exists(ini_path):
        with open(ini_path) as f:
            for line in f:
                if line.strip().startswith("WorkshopItems="):
                    enabled_workshop_ids = line.strip().split("=")[1].split(";")
                elif line.strip().startswith("Mods="):
                    enabled_mod_ids = line.strip().split("=")[1].split(";")
    
    return jsonify({
        "WorkshopItems": [wid.strip() for wid in enabled_workshop_ids if wid.strip()],
        "Mods": [mid.strip() for mid in enabled_mod_ids if mid.strip()],
    })

# === MAIN ===
if __name__ == '__main__':
    app.run(port=2010)
