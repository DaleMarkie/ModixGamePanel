from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from datetime import date

app = FastAPI()

# Allow React frontend to fetch it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------

class ChangelogEntry(BaseModel):
    version: str
    date: date
    tags: List[str]
    details: List[str]
    unavailable: bool = False

class ChangelogResponse(BaseModel):
    current_version: str
    changelogs: List[ChangelogEntry]

# ---------- Static Changelog Data ----------

CHANGELOGS = [
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

CURRENT_VERSION = "v1.1.2"

# ---------- API Route ----------

@app.get("/api/updater", response_model=ChangelogResponse)
def get_changelog():
    return ChangelogResponse(
        current_version=CURRENT_VERSION,
        changelogs=CHANGELOGS,
    )
