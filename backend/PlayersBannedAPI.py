from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
from typing import List, Optional
import os
import platform
import asyncio

router = APIRouter(prefix="/api/projectzomboid", tags=["PlayersBannedAPI"])

# --- WebSocket clients ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()

# --- Detect server path ---
def get_pz_server_path() -> str:
    user_home = os.path.expanduser("~")
    sys_os = platform.system().lower()
    if sys_os == "windows":
        path = os.path.join(
            os.environ.get("PROGRAMFILES(X86)", "C:\\Program Files (x86)"),
            "Steam", "steamapps", "common", "Project Zomboid", "Server"
        )
    elif sys_os == "linux":
        path = os.path.join(user_home, "ProjectZomboid", "Server")
    elif sys_os == "darwin":
        path = os.path.join(user_home, "Documents", "Zomboid", "Server")
    else:
        path = ""
    return path

def banned_file_path() -> str:
    return os.path.join(get_pz_server_path(), "banned.txt")

# --- Read/write ---
def read_banned_file() -> List[dict]:
    file_path = banned_file_path()
    if not os.path.exists(file_path):
        return []

    banned_players = []
    with open(file_path, "r") as f:
        for line in f.readlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split(":")
            player = parts[0]
            reason = parts[1] if len(parts) > 1 else "No reason provided"
            timestamp = parts[2] if len(parts) > 2 else datetime.utcnow().isoformat()
            banned_players.append({
                "player": player,
                "message": reason,
                "timestamp": timestamp
            })
    return banned_players

def write_banned_file(banned_list: List[dict]):
    file_path = banned_file_path()
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        for b in banned_list:
            f.write(f"{b['player']}:{b['message']}:{b['timestamp']}\n")

# --- API endpoints ---
@router.get("/banned")
async def get_banned_players():
    return {"banned": read_banned_file()}

@router.post("/ban")
async def ban_player(player: str, reason: Optional[str] = "No reason provided"):
    banned = read_banned_file()
    if any(p["player"].lower() == player.lower() for p in banned):
        return {"status": "already_banned", "player": player}

    new_ban = {
        "player": player,
        "message": reason,
        "timestamp": datetime.utcnow().isoformat()
    }
    banned.append(new_ban)
    write_banned_file(banned)
    await manager.broadcast({"event": "banned", "player": new_ban})
    return {"status": "banned", "player": player, "ban": new_ban}

@router.post("/unban")
async def unban_player(player: str):
    banned = read_banned_file()
    before_count = len(banned)
    banned = [p for p in banned if p["player"].lower() != player.lower()]
    if len(banned) == before_count:
        return {"status": "not_found", "player": player}
    write_banned_file(banned)
    await manager.broadcast({"event": "unbanned", "player": player})
    return {"status": "unbanned", "player": player}

# --- WebSocket ---
@router.websocket("/ws/banned")
async def websocket_banned(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1)
            # Optional: send full list every 5-10s
            await websocket.send_json({"event": "full_list", "banned": read_banned_file()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
