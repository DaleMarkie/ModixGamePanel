# backend/api_chatlogs.py
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio

chat_bp = APIRouter()

def parse_pz_logs(log_line: str):
    """
    Parse Project Zomboid log lines for basic events.
    """
    if "joined the game" in log_line:
        player = log_line.split("joined the game")[0].strip()
        return {"event": "join", "player": player}
    elif "left the game" in log_line:
        player = log_line.split("left the game")[0].strip()
        return {"event": "leave", "player": player}
    return None


@chat_bp.get("/chat-stream")
async def chat_stream():
    """
    SSE endpoint to stream chat/game events.
    """
    async def event_generator():
        # Replace this with a real tail of Project Zomboid logs
        while True:
            await asyncio.sleep(3)
            yield {
                "event": "message",
                "data": "Test chat log entry",
            }

    return EventSourceResponse(event_generator())
