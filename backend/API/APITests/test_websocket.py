import os
import websockets
import asyncio
import json

API_WS_URL = os.environ.get("API_WS_URL", "ws://localhost:2010/api/ws/terminal/292113b51c1c459680845e56038bc83894f7a3d247030265e05bbd5e11332cb0")
API_AUTH_TOKEN = os.environ.get("API_AUTH_TOKEN")

async def websocket_test():
    headers = {}
    if API_AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {API_AUTH_TOKEN}"
    async with websockets.connect(API_WS_URL, extra_headers=headers) as ws:
        print(f"[DEBUG] Connected to {API_WS_URL}")
        # Example: send a ping or test message
        await ws.send(json.dumps({"type": "ping"}))
        print("[DEBUG] Sent ping message")
        response = await ws.recv()
        print(f"[DEBUG] Received: {response}")

if __name__ == "__main__":
    asyncio.run(websocket_test())
