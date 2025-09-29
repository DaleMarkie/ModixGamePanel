# backend/api_chatlogs.py
from fastapi import APIRouter

chat_bp = APIRouter()

def parse_pz_logs(log_line: str):
    # Minimal example: extract player joins/leaves
    if "joined the game" in log_line:
        player = log_line.split("joined the game")[0].strip()
        return {"event": "join", "player": player}
    elif "left the game" in log_line:
        player = log_line.split("left the game")[0].strip()
        return {"event": "leave", "player": player}
    return None

@chat_bp.get("/chat-stream")
async def chat_stream():
    async def event_generator():
        # your SSE implementation
        yield "data: Hello\n\n"
    return EventSourceResponse(event_generator())
