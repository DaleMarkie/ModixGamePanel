import os
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

# Set this to your server INI folder
INI_FOLDER = r"C:\ProjectZomboid\Server\Configs"

# List all INI files
@app.route("/api/server_settings/list-inis", methods=["GET"])
def list_inis():
    try:
        files = [f for f in os.listdir(INI_FOLDER) if f.endswith(".ini")]
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get or Save INI settings
@app.route("/api/server_settings/projectzomboid", methods=["GET", "POST"])
def projectzomboid_settings():
    file_name = request.args.get("file")
    if not file_name:
        return jsonify({"error": "No INI file specified"}), 400

    file_path = os.path.join(INI_FOLDER, file_name)

    if request.method == "GET":
        # Load INI
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        data = {}
        section = None
        with open(file_path, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith(";") or line == "":
                    continue
                if line.startswith("[") and line.endswith("]"):
                    section = line[1:-1]
                    data[section] = {}
                elif "=" in line and section:
                    key, val = line.split("=", 1)
                    val = val.strip()
                    # Convert types
                    if val.lower() in ["true", "false"]:
                        val = val.lower() == "true"
                    elif val.isdigit():
                        val = int(val)
                    data[section][key.strip()] = val
        return jsonify(data)

    elif request.method == "POST":
        # Save INI
        try:
            settings = request.get_json()
            with open(file_path, "w") as f:
                for section, keys in settings.items():
                    f.write(f"[{section}]\n")
                    for key, val in keys.items():
                        if isinstance(val, bool):
                            val = str(val).lower()
                        f.write(f"{key}={val}\n")
                    f.write("\n")
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
