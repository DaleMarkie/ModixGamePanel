from fastapi import APIRouter
from pydantic import BaseModel

from backend.state.active_game import set_active_game, get_active_game

router = APIRouter()


class ActiveGamePayload(BaseModel):
    game_id: str | None


@router.post("/games/active")
def set_game(payload: ActiveGamePayload):
    set_active_game(payload.game_id)
    return {
        "success": True,
        "active_game": payload.game_id
    }


@router.get("/games/active")
def get_game():
    return {
        "active_game": get_active_game()
    }