# /project/workspace/backend/API/Core/APITests/update_api.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ideally set this to your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChangelogEntry(BaseModel):
    version: str
    date: str
    tags: List[str]
    details: List[str]
    unavailable: bool = False

# Dummy changelogs (same as your React one)
changelogs = [
    ChangelogEntry(
        version="v1.1.2",
        date="2025-06-10",
        tags=["Updater", "Mods", "UI"],
        details=[
            "Improved automatic update process for better reliability.",
            "Fixed minor bugs in mod synchronization.",
            "Updated UI with clearer status messages.",
        ],
    ),
    ChangelogEntry(
        version="v1.1.1",
        date="2025-05-25",
        tags=["Updater"],
        details=["unstable", "not working", "Optimized download speed."],
        unavailable=True,
    ),
]

@app.get("/api/changelog", response_model=List[ChangelogEntry])
def get_changelog():
    return changelogs
