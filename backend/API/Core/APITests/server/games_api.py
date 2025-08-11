import pytest
from fastapi.testclient import TestClient
from backend.API.Core.APIRouter import router  # Adjust this import to your router location
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)

client = TestClient(app)

def test_get_server_specs_success():
    response = client.get("/server/specs")
    assert response.status_code == 200
    data = response.json()
    assert "cpu" in data and isinstance(data["cpu"], str) and data["cpu"]
    assert "ram" in data and isinstance(data["ram"], str) and "GB" in data["ram"]
    assert "storage" in data and isinstance(data["storage"], str) and "GB" in data["storage"]
    assert "os" in data and isinstance(data["os"], str) and data["os"]

def test_get_server_specs_error(monkeypatch):
    # Patch platform.processor to raise exception to simulate failure
    import backend.API.Core.APIRouter as core_router  # Adjust this import
    def raise_exception():
        raise Exception("Simulated failure")

    monkeypatch.setattr(core_router.platform, "processor", raise_exception)
    response = client.get("/server/specs")
    assert response.status_code == 500
    assert response.json() == {"error": "Failed to get server specs"}
