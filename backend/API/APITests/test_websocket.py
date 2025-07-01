import os
import websockets
import asyncio
import json

API_WS_URL = os.environ.get("API_WS_URL", "ws://localhost:2010/api/ws/terminal/292113b51c1c459680845e56038bc83894f7a3d247030265e05bbd5e11332cb0")
API_AUTH_TOKEN = os.environ.get("API_AUTH_TOKEN")

async def interactive_terminal():
    headers = {}
    if API_AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {API_AUTH_TOKEN}"
    async with websockets.connect(API_WS_URL, extra_headers=headers) as ws:
        print(f"[DEBUG] Connected to {API_WS_URL}")
        print("[DEBUG] Waiting for connection to backend container...")
        ready_to_type = False
        async def receive():
            nonlocal ready_to_type
            try:
                while True:
                    msg = await ws.recv()
                    try:
                        data = json.loads(msg)
                        if "output" in data:
                            if not ready_to_type:
                                print("[DEBUG] Connection established. You can now type commands.")
                                ready_to_type = True
                            print(data["output"], end="", flush=True)
                        else:
                            print(f"[SERVER] {data}")
                    except Exception:
                        print(f"[SERVER RAW] {msg}")
            except websockets.ConnectionClosed:
                print("[DEBUG] WebSocket closed by server.")
        async def send():
            try:
                while True:
                    if not ready_to_type:
                        await asyncio.sleep(0.1)
                        continue
                    user_input = await asyncio.get_event_loop().run_in_executor(None, input, "[term] $")
                    # Send as raw string, not JSON
                    await ws.send(user_input)
            except websockets.ConnectionClosed:
                pass
        await asyncio.gather(receive(), send())

if __name__ == "__main__":
    asyncio.run(interactive_terminal())
