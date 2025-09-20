from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
from typing import List, Dict
from datetime import datetime
import uuid

router = APIRouter()

# ---------------------------
# Support Tickets Storage
# ---------------------------
# In-memory storage for demo; replace with DB or VPS forwarding later
support_tickets: List[Dict] = []

# ---------------------------
# Support Tickets API
# ---------------------------

@router.get("/tickets")
async def list_tickets(userId: str = None):
    """
    Get all support tickets.
    Optional query param:
    - userId: filter tickets by specific user
    """
    if userId:
        filtered = [t for t in support_tickets if t.get("userId") == userId]
        return {"success": True, "tickets": filtered}
    return {"success": True, "tickets": support_tickets}


@router.post("/tickets")
async def create_ticket(payload: dict = Body(...)):
    """
    Create a new support ticket.
    JSON body:
    {
        "userId": str,
        "subject": str,
        "category": str,        # optional
        "priority": str,        # optional
        "page": str             # optional
    }
    """
    user_id = payload.get("userId")
    subject = payload.get("subject")
    if not user_id or not subject:
        return JSONResponse({"success": False, "message": "userId and subject are required"}, status_code=400)

    ticket = {
        "id": f"TCK-{uuid.uuid4().hex[:8].upper()}",
        "userId": user_id,
        "subject": subject,
        "status": "open",
        "category": payload.get("category", "general"),
        "priority": payload.get("priority", "medium"),
        "page": payload.get("page", "dashboard"),
        "created": datetime.now().isoformat(),
        "updated": datetime.now().isoformat(),
    }

    support_tickets.append(ticket)

    # TODO: forward to VPS if needed
    # await requests.post("http://<VPS_IP>:2010/api/support/tickets", json=ticket)

    return {"success": True, "ticket": ticket}


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """
    Get a single ticket by ID
    """
    ticket = next((t for t in support_tickets if t["id"] == ticket_id), None)
    if not ticket:
        return JSONResponse({"success": False, "message": "Ticket not found"}, status_code=404)
    return {"success": True, "ticket": ticket}


@router.post("/tickets/{ticket_id}/update")
async def update_ticket(ticket_id: str, payload: dict = Body(...)):
    """
    Update a ticket (status, priority, category, etc.)
    JSON body can include:
    - status
    - priority
    - category
    - page
    - subject
    """
    ticket = next((t for t in support_tickets if t["id"] == ticket_id), None)
    if not ticket:
        return JSONResponse({"success": False, "message": "Ticket not found"}, status_code=404)

    for key in ["status", "priority", "category", "page", "subject"]:
        if key in payload:
            ticket[key] = payload[key]
    ticket["updated"] = datetime.now().isoformat()

    return {"success": True, "ticket": ticket}


@router.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: str):
    """
    Delete a ticket by ID
    """
    global support_tickets
    support_tickets = [t for t in support_tickets if t["id"] != ticket_id]
    return {"success": True, "message": f"Ticket {ticket_id} deleted"}
