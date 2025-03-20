from fastapi import APIRouter
from api.db import get_all_outlets  # Updated import path

router = APIRouter()

@router.get("/")
async def get_outlets():
    outlets = get_all_outlets()
    return outlets