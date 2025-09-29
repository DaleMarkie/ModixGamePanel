from fastapi import APIRouter, Query
import httpx

router = APIRouter()
STEAM_API_KEY = "YOUR_STEAM_API_KEY"

@router.get("/steam/search")
async def search_steam_user(
    steamid: str = Query(None),
    customurl: str = Query(None),
    key: str = Query(None)  # frontend sends ?key=apiKey
):
    if not steamid and not customurl:
        return {"success": False, "message": "Provide either steamid or customurl"}

    if not key:
        return {"success": False, "message": "Missing Steam API Key"}

    try:
        async with httpx.AsyncClient() as client:
            # Resolve vanity URL
            if customurl:
                r = await client.get(
                    "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/",
                    params={"key": key, "vanityurl": customurl},
                )
                data = r.json()
                if data.get("response", {}).get("success") != 1:
                    return {"success": False, "message": "User not found"}
                steamid = data["response"]["steamid"]

            # Player summary
            r = await client.get(
                "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
                params={"key": key, "steamids": steamid},
            )
            player_data = r.json()
            players = player_data.get("response", {}).get("players", [])
            if not players:
                return {"success": False, "message": "User not found"}
            player = players[0]

            # Ban info
            r = await client.get(
                "https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/",
                params={"key": key, "steamids": steamid},
            )
            ban_data = r.json()
            bans = ban_data.get("players", [{}])[0]

        return {
            "success": True,
            "profile": {
                "steamid": player.get("steamid"),
                "personaname": player.get("personaname"),
                "realname": player.get("realname"),
                "profileurl": player.get("profileurl"),
                "avatar": player.get("avatarfull") or player.get("avatar"),
                "loccountrycode": player.get("loccountrycode"),
                "timecreated": player.get("timecreated"),
            },
            "bans": {
                "VACBanned": bans.get("VACBanned", False),
                "NumberOfGameBans": bans.get("NumberOfGameBans", 0),
                "CommunityBanned": bans.get("CommunityBanned", False),
                "DaysSinceLastBan": bans.get("DaysSinceLastBan", 0),
            },
        }

    except Exception as e:
        return {"success": False, "message": str(e)}
