import requests
import json

def run_all_tests(headers):
    API_URL = "http://localhost:2010/api/ftp"
    CONTAINER_ID = "9018a539b9155569a9c32e3e3ef97700639fa5b0aea33e2315d040459f92d388"

    def test_list_files():
        resp = requests.get(f"{API_URL}/{CONTAINER_ID}/list", params={"path": ""}, headers=headers)
        print("List Files:", resp.status_code, resp.json())

    def test_write_file():
        data = {"content": "Hello, Modix!"}
        resp = requests.post(f"{API_URL}/{CONTAINER_ID}/write", params={"path": "testfile.txt"}, json=data, headers=headers)
        print("Write File:", resp.status_code, resp.json())

    def test_read_file():
        resp = requests.get(f"{API_URL}/{CONTAINER_ID}/read", params={"path": "testfile.txt"}, headers=headers)
        print("Read File:", resp.status_code)
        if resp.status_code == 200:
            print("File Content:", resp.text)

    def test_delete_file():
        resp = requests.delete(f"{API_URL}/{CONTAINER_ID}/delete", params={"path": "testfile.txt"}, headers=headers)
        print("Delete File:", resp.status_code, resp.json())

    test_list_files()
    #test_write_file()
    #test_read_file()
    #test_delete_file()
