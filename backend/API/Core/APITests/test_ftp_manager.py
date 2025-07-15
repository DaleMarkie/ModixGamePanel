import requests
import json
import os

def run_all_tests(headers):
    API_URL = "http://localhost:2010/api/ftp"
    CONTAINER_ID = "d5e469228143e59272bcd7b831ea8f009262aeb39b8954d97ec42c9276ffd8ac"
    MOUNT_NAME = "unturned_server_data"  # <-- Set this to your Docker volume name (e.g. 'unturned_server_data')
    TEST_FILE = "testfile.txt"

    def test_list_files():
        resp = requests.get(f"{API_URL}/{CONTAINER_ID}/{MOUNT_NAME}/", headers=headers)
        print("List Files:", resp.status_code, resp.json())

    def test_upload_testfile():
        # Create a test file if it doesn't exist
        if not os.path.exists(TEST_FILE):
            with open(TEST_FILE, "w") as f:
                f.write("This is a test file for Modix FTP API upload.\n")
        with open(TEST_FILE, "r") as f:
            file_content = f.read()
        resp = requests.post(
            f"{API_URL}/{CONTAINER_ID}/{MOUNT_NAME}/{TEST_FILE}",
            data=file_content,
            headers={**headers, "Content-Type": "text/plain"}
        )
        print(f"Upload {TEST_FILE}:", resp.status_code, resp.json() if resp.headers.get('content-type') == 'application/json' else resp.text)

    def test_overwrite_file():
        new_content = "hey! dont say that!"
        resp = requests.post(
            f"{API_URL}/{CONTAINER_ID}/{MOUNT_NAME}/{TEST_FILE}",
            data=new_content,
            headers={**headers, "Content-Type": "text/plain"}
        )
        print(f"Overwrite {TEST_FILE}:", resp.status_code, resp.json() if resp.headers.get('content-type') == 'application/json' else resp.text)

    def test_read_file():
        resp = requests.get(f"{API_URL}/{CONTAINER_ID}/{MOUNT_NAME}/{TEST_FILE}", headers=headers)
        print("Read File:", resp.status_code)
        if resp.status_code == 200:
            print("File Content:", resp.text)

    def test_delete_file():
        resp = requests.delete(f"{API_URL}/{CONTAINER_ID}/{MOUNT_NAME}/{TEST_FILE}", headers=headers)
        print("Delete File:", resp.status_code, resp.json())

    test_list_files()
    test_upload_testfile()
    test_overwrite_file()
    test_read_file()
    test_delete_file()

def get_headers():
    token = os.environ.get("API_AUTH_TOKEN")
    if not token:
        raise Exception("No API_AUTH_TOKEN in environment")
    return {"Authorization": f"Bearer {token}"}

if __name__ == "__main__":
    headers = get_headers()
    #run_all_tests(headers)
