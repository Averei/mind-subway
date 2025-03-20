from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()

class ChatQuery(BaseModel):
    message: str

@router.post("/query")
async def process_query(query: ChatQuery):
    try:
        response = await chat_service.process_query(query.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))