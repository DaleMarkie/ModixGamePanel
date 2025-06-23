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
    "test_ftp_manager_auth.py",
    # Add more test scripts here as needed
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Authenticate and get token
def get_auth_token():
    data = {"username": USERNAME, "password": PASSWORD}
    resp = requests.post(AUTH_URL, data=data)
    resp.raise_for_status()
    token = resp.json().get("access_token")
    if not token:
        raise Exception("Authentication failed: No access_token returned.")
    return token

def run_tests():
    token = get_auth_token()
    env = os.environ.copy()
    env["API_AUTH_TOKEN"] = token
    for script in TEST_SCRIPTS:
        script_path = os.path.join(BASE_DIR, script)
        print(f"\n=== Running {script} ===")
        result = subprocess.run(["python3", script_path], env=env)
        if result.returncode != 0:
            print(f"[ERROR] {script} failed with exit code {result.returncode}")

if __name__ == "__main__":
    run_tests()
