from typing import Dict, List, Any
from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from apps.openai.utils import stream_request

router = APIRouter(prefix="/openai")

class Chat(BaseModel):
    messages: List[Dict[str, Any]] = []

@router.post("/chat")
async def chat(request: Chat):
    try:
        message = request.dict()["messages"]
        url = ""
        params = {
            "stream": True,
            "messages": message,
            "temperature": 0.8,
            "max_tokens": 2048,
            "model": "gpt-3.5-turbo",
            "n": 1
        }
        return StreamingResponse(stream_request(url, params))
    except Exception as e:
        return {"status": "error", "message": e}