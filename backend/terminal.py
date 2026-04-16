from fastapi import APIRouter, WebSocket
from backend.services.server_manager import stream_output

router = APIRouter()

@router.websocket("/terminal/ws")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()
    await stream_output(websocket)