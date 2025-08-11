from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Simple in-memory store for mod order (replace with DB in production)
current_mod_order: List[str] = []

class ModOrderRequest(BaseModel):
    workshopIds: List[str]

@router.get("/mod-order", response_model=List[str])
async def get_mod_order():
    """
    Get the current saved mod load order (list of workshop IDs).
    """
    return current_mod_order

@router.post("/mod-order")
async def save_mod_order(order: ModOrderRequest):
    """
    Save the mod load order sent by the client.
    """
    global current_mod_order
    if not order.workshopIds:
        raise HTTPException(status_code=400, detail="Mod order list cannot be empty.")
    current_mod_order = order.workshopIds
    return {"message": "Mod order saved successfully.", "savedOrder": current_mod_order}
