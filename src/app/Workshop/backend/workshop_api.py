from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import httpx
from bs4 import BeautifulSoup
import re

app = FastAPI()

# CORS setup - adjust for your deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_mod_id(url: str):
    match = re.search(r"id=(\d+)", url)
    return match.group(1) if match else "unknown"

async def fetch_html(url: str) -> str:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        return response.text

def parse_mod_items(html: str, is_collection: bool = False) -> List[dict]:
    soup = BeautifulSoup(html, "lxml")
    items = soup.select(".collectionItem" if is_collection else ".workshopItem")

    if not items:
        raise ValueError("No mods found.")

    mods = []
    for item in items:
        link = item.select_one("a")["href"] if item.select_one("a") else "#"
        mod_id = parse_mod_id(link)

        title = item.select_one(".workshopItemTitle")
        image = item.select_one("img")
        description = item.select_one(".workshopItemDescription")
        author = item.select_one(".workshopItemAuthorName")
        subscribers = item.select_one(".numSubscribers")
        updated = item.select_one(".workshopItemUpdated")
        size = item.select_one(".workshopItemFileSize")

        mods.append({
            "modId": mod_id,
            "title": title.get_text(strip=True) if title else "Untitled",
            "image": image["src"] if image else "https://via.placeholder.com/260x140?text=No+Image",
            "link": link,
            "description": description.get_text(strip=True) if description else "No description provided.",
            "author": author.get_text(strip=True) if author else "Unknown",
            "subscribers": int("".join(filter(str.isdigit, subscribers.text))) if subscribers else 0,
            "lastUpdated": updated["title"] if updated else "Unknown date",
            "fileSize": size.get_text(strip=True) if size else "Unknown size"
        })

    return mods

@app.get("/api/mods")
async def get_mods(query: str = Query(..., min_length=1)):
    try:
        is_collection = query.strip().isdigit()
        if is_collection:
            url = f"https://steamcommunity.com/sharedfiles/filedetails/?id={query.strip()}"
        else:
            url = f"https://steamcommunity.com/workshop/browse/?appid=108600&searchtext={query.strip()}&browsesort=trend"

        html = await fetch_html(url)
        mods = parse_mod_items(html, is_collection=is_collection)
        return {"results": mods}

    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Steam request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")
