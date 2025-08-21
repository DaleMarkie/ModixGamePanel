import re
import os
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

# =========================
# Config
# =========================
USE_MOCK_STEAM = True  # 🔴 change to False to use real Steam API
STEAM_API_KEY = os.getenv("STEAM_API_KEY")  # put your real API key here when ready

# =========================
# Mock Player Data (for testing now)
# =========================
MOCK_PLAYER = {
    "profile": {
        "steamid": "76561198347530219",
        "steamid2": "STEAM_0:1:193632245",
        "steamid3": "[U:1:387264491]",
        "steamid64_hex": "110000117152feb",
        "customURL": "https://steamcommunity.com/id/dalemarkie",
        "profileurl": "https://steamcommunity.com/profiles/76561198347530219",
        "personaname": "OV3RLORD",
        "realname": "DaleMarkie",
        "loccountrycode": "GB",
        "avatar": "https://avatars.steamstatic.com/3a98c3ff1dfd3a3c6c534f0b46c40c8c01f3f2b2_medium.jpg",
        "profilestate": "Public",
        "timecreated": 1480204800,  # November 27th, 2016
    },
    "bans": {
        "SteamId": "76561198347530219",
        "CommunityBanned": False,
        "VACBanned": False,
        "NumberOfVACBans": 0,
        "DaysSinceLastBan": 0,
        "NumberOfGameBans": 0,
        "EconomyBan": "none",
    }
}


# =========================
# Helper Functions
# =========================
def convert_ids(steamid64: str):
    """Convert SteamID64 into Steam2, Steam3, and hex forms."""
    steamid64_int = int(steamid64)
    account_id = steamid64_int - 76561197960265728
    steamid2 = f"STEAM_0:{account_id % 2}:{account_id // 2}"
    steamid3 = f"[U:1:{account_id}]"
    steamid64_hex = hex(steamid64_int)
    return steamid2, steamid3, steamid64_hex


async def fetch_from_steam_api(steamid64: str):
    """Fetch real profile + bans from Steam Web API."""
    if not STEAM_API_KEY:
        raise HTTPException(status_code=500, detail="Steam API key missing")

    async with httpx.AsyncClient() as client:
        # Player profile
        resp_profile = await client.get(
            "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
            params={"key": STEAM_API_KEY, "steamids": steamid64},
        )
        resp_bans = await client.get(
            "https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/",
            params={"key": STEAM_API_KEY, "steamids": steamid64},
        )

    if resp_profile.status_code != 200 or resp_bans.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch from Steam API")

    player = resp_profile.json()["response"]["players"][0]
    bans = resp_bans.json()["players"][0]

    steamid2, steamid3, steamid64_hex = convert_ids(steamid64)

    return {
        "profile": {
            "steamid": steamid64,
            "steamid2": steamid2,
            "steamid3": steamid3,
            "steamid64_hex": steamid64_hex,
            "customURL": f"https://steamcommunity.com/id/{player.get('personaname')}",
            "profileurl": player["profileurl"],
            "personaname": player["personaname"],
            "realname": player.get("realname"),
            "loccountrycode": player.get("loccountrycode"),
            "avatar": player["avatarfull"],
            "profilestate": "Public" if player.get("communityvisibilitystate") == 3 else "Private",
            "timecreated": player.get("timecreated"),
        },
        "bans": bans,
    }


# =========================
# API Route
# =========================
@router.get("/steam/player/{steam_input}")
async def get_steam_player(steam_input: str):
    """
    Search for a Steam player by SteamID64 or vanity URL.
    Returns mock data if USE_MOCK_STEAM=True.
    """
    # -------------------
    # MOCK MODE (for now)
    # -------------------
    if USE_MOCK_STEAM:
        return MOCK_PLAYER

    # -------------------
    # REAL MODE
    # -------------------
    steamid64 = None

    # If input is vanity URL
    vanity_match = re.match(r"^https?://steamcommunity\.com/id/([^/]+)/?", steam_input)
    if vanity_match:
        vanity_name = vanity_match.group(1)
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/",
                params={"key": STEAM_API_KEY, "vanityurl": vanity_name},
            )
        if resp.status_code != 200 or "response" not in resp.json():
            raise HTTPException(status_code=502, detail="Failed to resolve vanity URL")
        steamid64 = resp.json()["response"].get("steamid")
        if not steamid64:
            raise HTTPException(status_code=404, detail="Vanity URL not found")

    # If input is plain SteamID64
    elif steam_input.isdigit():
        steamid64 = steam_input

    else:
        raise HTTPException(status_code=400, detail="Invalid Steam ID or vanity URL")

    return await fetch_from_steam_api(steamid64)
