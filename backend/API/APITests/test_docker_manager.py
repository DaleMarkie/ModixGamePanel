import requests
import os

API_URL = "http://localhost:2010/api/docker"
AUTH_TOKEN = os.environ.get("API_AUTH_TOKEN")
HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"} if AUTH_TOKEN else {}

# Use the specific container ID for all tests
CONTAINER_ID = "d5e469228143e59272bcd7b831ea8f009262aeb39b8954d97ec42c9276ffd8ac"

def test_docker_api(container_id):
    resp = requests.get(f"{API_URL}/{container_id}/processes", headers=HEADERS)
    print(f"GET /api/docker/{{container_id}}:", resp.status_code)
    print(resp.json() if resp.headers.get('content-type') == 'application/json' else resp.text)

def test_inspect_container(container_id):
    resp = requests.get(f"{API_URL}/{container_id}/inspect", headers=HEADERS)
    print(f"GET /api/docker/{{container_id}}/inspect:", resp.status_code)
    print(resp.json() if resp.headers.get('content-type', '').startswith('application/json') else resp.text)

def test_container_top(container_id):
    resp = requests.get(f"{API_URL}/{container_id}/top", headers=HEADERS)
    print(f"GET /api/docker/{{container_id}}/top:", resp.status_code)
    print(resp.json() if resp.headers.get('content-type', '').startswith('application/json') else resp.text)

def test_container_stats(container_id):
    resp = requests.get(f"{API_URL}/{container_id}/stats", headers=HEADERS)
    print(f"GET /api/docker/{{container_id}}/stats:", resp.status_code)
    print(resp.json() if resp.headers.get('content-type', '').startswith('application/json') else resp.text)

def run_all_tests():
    test_docker_api(CONTAINER_ID)
    #test_inspect_container(CONTAINER_ID)
    #test_container_top(CONTAINER_ID)
    #test_container_stats(CONTAINER_ID)

if __name__ == "__main__":
    if not AUTH_TOKEN:
        print("No API_AUTH_TOKEN found in environment. Please authenticate first.")
    else:
        run_all_tests()
