from modix_auto_deployment import main as modix_auto_deployment
import subprocess
import sys

if __name__ == "__main__":
    # Start the FastAPI backend using uvicorn in a subprocess
    backend_proc = subprocess.Popen([
        sys.executable, "-m", "uvicorn", "backend.api_main:app", "--host", "0.0.0.0", "--port", "8000"
    ])
    try:
        modix_auto_deployment()
    finally:
        # Optionally terminate the backend when done
        backend_proc.terminate()
# This is the main entry point for the modix auto deployment script and backend server.

