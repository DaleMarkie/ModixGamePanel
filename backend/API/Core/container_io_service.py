import socket
import threading
import docker
import json
import select
import time
import asyncio
from starlette.websockets import WebSocketDisconnect

# Utility to send JSON over a socket connection
def send_json(conn, obj):
    try:
        conn.sendall((json.dumps(obj) + "\n").encode())
    except Exception as e:
        print(f"[DEBUG] Failed to send JSON: {e}")

# Legacy TCP handler for direct socket IO (not used by FastAPI, but kept for reference)
def handle_client(conn):
    try:
        print("[DEBUG] Client connected")
        send_json(conn, {"info": "IO stream session started. Send container_id as first line."})

        # Receive the container_id (first line)
        container_id = b""
        while not container_id.endswith(b"\n"):
            chunk = conn.recv(1)
            if not chunk:
                print("[DEBUG] Client disconnected before sending container_id")
                return
            container_id += chunk
        container_id = container_id.decode().strip()
        print(f"[DEBUG] Received container_id: {container_id}")

        client = docker.from_env()
        try:
            container = client.containers.get(container_id)
            print(f"[DEBUG] Found container: {container_id}, status: {container.status}")
        except Exception as e:
            print(f"[DEBUG] Container not found or error: {e}")
            send_json(conn, {"error": str(e)})
            return

        # Attach to container with stdin/stdout/stderr
        try:
            sock = container.attach_socket(params={
                'stdin': 1, 'stdout': 1, 'stderr': 1, 'stream': 1, 'logs': 0
            })
            sock._sock.setblocking(False)
        except Exception as e:
            print(f"[DEBUG] Error attaching to container socket: {e}")
            send_json(conn, {"error": f"Error attaching to container: {e}"})
            return

        # Send previous logs (tail 100 lines), each as JSON line
        try:
            prev_logs = container.logs(stdout=True, stderr=True, tail=100, stream=False)
            if isinstance(prev_logs, bytes):
                prev_lines = prev_logs.decode(errors='replace').splitlines()
            elif isinstance(prev_logs, str):
                prev_lines = prev_logs.splitlines()
            else:
                prev_lines = []
                print(f"[DEBUG] Unexpected type for previous logs: {type(prev_logs)}")
            for line in prev_lines:
                send_json(conn, {"output": line})
        except Exception as e:
            print(f"[DEBUG] Error sending previous logs: {e}")
            send_json(conn, {"error": f"Error sending previous logs: {e}"})
            return

        buffer = b""
        last_send = time.time()
        BATCH_INTERVAL = 0.1
        BATCH_SIZE = 4096

        while True:
            rlist, _, _ = select.select([conn, sock._sock], [], [], 0.1)
            # Handle client input
            if conn in rlist:
                try:
                    data = conn.recv(4096)
                    if not data:
                        print("[DEBUG] Client disconnected")
                        break
                    # Forward input to container stdin
                    try:
                        sock._sock.sendall(data)
                    except Exception as e:
                        print(f"[DEBUG] Error forwarding input: {e}")
                        send_json(conn, {"error": f"Error forwarding input: {e}"})
                        break
                except Exception as e:
                    print(f"[DEBUG] Error reading client input: {e}")
                    break
            # Handle container output
            if sock._sock in rlist:
                try:
                    out = sock._sock.recv(BATCH_SIZE)
                    if not out:
                        print("[DEBUG] Container stream closed")
                        break
                    buffer += out
                    while b"\n" in buffer:
                        line, buffer = buffer.split(b"\n", 1)
                        send_json(conn, {"output": line.decode(errors='replace')})
                    if buffer and (len(buffer) > BATCH_SIZE or time.time() - last_send > BATCH_INTERVAL):
                        send_json(conn, {"output": buffer.decode(errors='replace')})
                        buffer = b""
                        last_send = time.time()
                except Exception as e:
                    print(f"[DEBUG] Error reading container output: {e}")
                    send_json(conn, {"error": f"Error reading container output: {e}"})
                    break
            time.sleep(0.01)
        if buffer:
            send_json(conn, {"output": buffer.decode(errors='replace')})
    except Exception as e:
        print(f"[DEBUG] Exception in handle_client: {e}")
        try:
            send_json(conn, {"error": str(e)})
        except Exception:
            pass
    finally:
        print("[DEBUG] Closing client connection")
        try:
            conn.shutdown(socket.SHUT_RDWR)
        except Exception:
            pass
        conn.close()

# Async: Fetch the last N lines of logs from a Docker container
async def get_container_logs(container_id, tail=100):
    client = docker.from_env()
    container = client.containers.get(container_id)
    logs = container.logs(tail=tail, stdout=True, stderr=True)
    return logs.splitlines()

# Async: Attach to the main process of a Docker container and return the socket
async def attach_container_socket(container_id):
    client = docker.from_env()
    container = client.containers.get(container_id)
    sock = container.attach_socket(params={
        'stdin': 1, 'stdout': 1, 'stderr': 1, 'stream': 1, 'logs': 0
    })
    sock._sock.setblocking(True)
    return sock

# Async: Relay output from the container to the WebSocket
async def relay_container_output(sock, websocket):
    loop = asyncio.get_event_loop()
    buffer = b""
    while True:
        try:
            data = await loop.run_in_executor(None, sock._sock.recv, 4096)
            if not data:
                break
            buffer += data
            while b"\n" in buffer:
                line, buffer = buffer.split(b"\n", 1)
                line = line.strip()
                if not line:
                    continue
                await websocket.send_json({"output": line.decode(errors='replace')})
        except asyncio.CancelledError:
            # Suppress error and exit cleanly on shutdown
            break
        except Exception as e:
            # Suppress asyncio.CancelledError wrapped in Exception (Python 3.8+)
            if isinstance(e, asyncio.CancelledError):
                break
            print(f"[DEBUG] Exception in relay_container_output: {e}")
            break

# Async: Relay input from the WebSocket to the container
async def relay_container_input(sock, websocket):
    while True:
        try:
            msg = await websocket.receive_text()
            sock._sock.sendall((msg + "\n").encode())
        except (asyncio.CancelledError, WebSocketDisconnect):
            break
        except Exception as e:
            # Suppress debug output for WebSocket 1012 (service restart/internal error)
            if hasattr(e, 'code') and e.code == 1012:
                break
            # Suppress asyncio.CancelledError wrapped in Exception (Python 3.8+)
            if isinstance(e, asyncio.CancelledError):
                break
            print(f"[DEBUG] Exception in relay_container_input: {e}")
            break

# Legacy TCP server entrypoint (not used by FastAPI, but kept for reference)
def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('127.0.0.1', 9001))
    server.listen()
    print("Container IO service running on port 9001")
    try:
        while True:
            conn, _ = server.accept()
            threading.Thread(target=handle_client, args=(conn,), daemon=True).start()
    except KeyboardInterrupt:
        print("Container IO service shutting down.")
    finally:
        server.close()

if __name__ == '__main__':
    main()
