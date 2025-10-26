import os
import requests
from pydantic import BaseModel
from typing import List, Optional
from fastapi import APIRouter, Body, HTTPException

# ---------------------------
# Discord API Router
# ---------------------------
router = APIRouter()

DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")  # Default webhook, can be env-configured

# ---------------------------
# Pydantic Models
# ---------------------------
class EmbedField(BaseModel):
    name: str
    value: str
    inline: bool = False

class EmbedMessage(BaseModel):
    title: str
    description: str
    color: str = "#5865F2"
    fields: Optional[List[EmbedField]] = None
    thumbnail: Optional[str] = None
    image: Optional[str] = None
    footer: Optional[str] = None

    def to_dict(self):
        data = {
            "embeds": [
                {
                    "title": self.title,
                    "description": self.description,
                    "color": int(self.color.replace("#", ""), 16),
                    "fields": [f.dict() for f in self.fields] if self.fields else [],
                }
            ]
        }
        if self.thumbnail:
            data["embeds"][0]["thumbnail"] = {"url": self.thumbnail}
        if self.image:
            data["embeds"][0]["image"] = {"url": self.image}
        if self.footer:
            data["embeds"][0]["footer"] = {"text": self.footer}
        return data

# ---------------------------
# Helper Function
# ---------------------------
def send_embed(embed: EmbedMessage, webhook_url: Optional[str] = None):
    url = webhook_url or DISCORD_WEBHOOK_URL
    if not url:
        return {"success": False, "error": "No webhook URL set."}
    
    try:
        resp = requests.post(url, json=embed.to_dict(), timeout=10)
        resp.raise_for_status()
        return {"success": True, "status_code": resp.status_code}
    except requests.RequestException as e:
        return {"success": False, "error": str(e)}

# ---------------------------
# API Endpoint
# ---------------------------
@router.post("/api/embed/send")
async def send_discord_embed(embed: EmbedMessage = Body(...)):
    """Send a Discord embed via webhook"""
    result = send_embed(embed)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return {"success": True, "status": "Embed sent"}
