from fastapi import APIRouter, Query
import requests

router = APIRouter()

# 🔑 Put your Steam API key here
STEAM_API_KEY = "YOUR_STEAM_API_KEY"

@router.get("/steam/search")
async def search_steam_user(
    steamid: str = Query(None),
    customurl: str = Query(None)
):
    """
    Search any Steam user by SteamID64 or vanity URL
    """
    if not steamid and not customurl:
        return {"success": False, "message": "Provide either steamid or customurl"}

    try:
        # Resolve vanity URL if needed
        if customurl:
            r = requests.get(
                "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/",
                params={"key": STEAM_API_KEY, "vanityurl": customurl}
            ).json()

            if r.get("response", {}).get("success") != 1:
                return {"success": False, "message": "User not found"}

            steamid = r["response"]["steamid"]

        # Get player summary by SteamID64
        r = requests.get(
            "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
            params={"key": STEAM_API_KEY, "steamids": steamid}
        ).json()

        players = r.get("response", {}).get("players", [])
        if not players:
            return {"success": False, "message": "User not found"}

        player = players[0]

        return {
            "success": True,
            "steamid": player.get("steamid"),
            "personaname": player.get("personaname"),
            "realname": player.get("realname"),
            "profileurl": player.get("profileurl"),
            "avatar": player.get("avatarfull") or player.get("avatar"),
            "loccountrycode": player.get("loccountrycode"),
        }

    except Exception as e:
        return {"success": False, "message": str(e)}
