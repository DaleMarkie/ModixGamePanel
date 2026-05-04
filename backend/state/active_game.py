from typing import Optional

_active_game: Optional[str] = None


def set_active_game(game_id: Optional[str]):
    global _active_game
    _active_game = game_id


def get_active_game() -> Optional[str]:
    return _active_game