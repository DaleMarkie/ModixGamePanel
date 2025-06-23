import requests
import json

# Adjust these as needed for your test environment
API_URL = "http://localhost:8000/api/ftp"
CONTAINER_ID = 1  # Use a valid container ID for your test

def test_list_files():
    resp = requests.get(f"{API_URL}/{CONTAINER_ID}/list", params={"path": ""})
    print("List Files:", resp.status_code, resp.json())

def test_write_file():
    data = {"content": "Hello, Modix!"}
    resp = requests.post(f"{API_URL}/{CONTAINER_ID}/write", params={"path": "testfile.txt"}, json=data)
    print("Write File:", resp.status_code, resp.json())

def test_read_file():
    resp = requests.get(f"{API_URL}/{CONTAINER_ID}/read", params={"path": "testfile.txt"})
    print("Read File:", resp.status_code)
    if resp.status_code == 200:
        print("File Content:", resp.text)

def test_delete_file():
    resp = requests.delete(f"{API_URL}/{CONTAINER_ID}/delete", params={"path": "testfile.txt"})
    print("Delete File:", resp.status_code, resp.json())

if __name__ == "__main__":
    test_list_files()
    test_write_file()
    test_read_file()
    test_delete_file()
