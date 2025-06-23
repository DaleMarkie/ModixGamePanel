import subprocess
import os
import requests

# Configuration
API_URL = "http://localhost:2010/api"
AUTH_URL = f"{API_URL}/login"
USERNAME = "root"  # Replace with a valid username
PASSWORD = "test"  # Replace with a valid password

# List of test scripts (filenames, not modules)
TEST_SCRIPTS = [
    "test_ftp_manager.py",
    "test_docker_manager.py",  # Added Docker API test manager
    # Add more test scripts here as needed
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Authenticate and get token
def get_auth_token():
    data = {"username": USERNAME, "password": PASSWORD}
    resp = requests.post(AUTH_URL, data=data)
    print(f"[DEBUG] Login response: {resp.status_code} {resp.text}")
    resp.raise_for_status()
    token = resp.json().get("access_token")
    if not token:
        raise Exception("Authentication failed: No access_token returned.")
    print(f"[DEBUG] Got token: {token}")
    return token

def run_tests():
    token = get_auth_token()
    env = os.environ.copy()
    env["API_AUTH_TOKEN"] = token
    print(f"[DEBUG] Environment for subprocess: API_AUTH_TOKEN={token}")
    for script in TEST_SCRIPTS:
        script_path = os.path.join(BASE_DIR, script)
        print(f"\n=== Running {script} ===")
        result = subprocess.run(["python3", script_path], env=env, capture_output=True, text=True)
        print(f"[DEBUG] {script} stdout:\n{result.stdout}")
        print(f"[DEBUG] {script} stderr:\n{result.stderr}")
        if result.returncode != 0:
            print(f"[ERROR] {script} failed with exit code {result.returncode}")

if __name__ == "__main__":
    run_tests()
