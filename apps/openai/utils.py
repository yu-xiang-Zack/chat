import os
from typing import Dict, Any, Union, AsyncIterable
from httpx import AsyncClient

async def stream_request(url: str, params: Union[str, Dict[str, Any]]) -> AsyncIterable[Dict[str, Any]]:
    async with AsyncClient() as client:
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + os.getenv("API_KEY"),
        }
        async with client.stream("POST", url, headers=headers, json=params, timeout=60) as response:
            async for chunk in response.aiter_lines():
                if chunk:
                    if chunk.startswith("data:"):
                         yield f"{chunk}\n\n"


async def request(url: str, params: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
    async with AsyncClient() as client:
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + os.getenv("API_KEY"),
        }
        response = await client.post(url=url, headers=headers, json=params)
        return response.json()
