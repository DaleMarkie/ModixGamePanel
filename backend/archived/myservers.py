import threading

SERVERS_FILE = "user_servers.json"
servers_lock = threading.Lock()

def load_servers():
    if not os.path.exists(SERVERS_FILE):
        return []
    with open(SERVERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_servers(servers):
    with open(SERVERS_FILE, "w", encoding="utf-8") as f:
        json.dump(servers, f, indent=2)

@app.route("/api/servers", methods=["GET"])
def get_servers():
    with servers_lock:
        servers = load_servers()
    return jsonify(servers)

@app.route("/api/servers", methods=["POST"])
def add_server():
    data = request.get_json()
    if not data or "gameId" not in data or "serverName" not in data:
        return jsonify({"error": "Missing fields"}), 400

    with servers_lock:
        servers = load_servers()
        new_server = {
            "id": len(servers) + 1,
            "gameId": data["gameId"],
            "serverName": data["serverName"],
            "description": data.get("description", ""),
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
        }
        servers.append(new_server)
        save_servers(servers)

    return jsonify(new_server), 201
