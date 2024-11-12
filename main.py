import os
import dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apps.openai import router as openai_router

app = FastAPI()
app.include_router(openai_router)

dotenv.load_dotenv(dotenv_path=dotenv.find_dotenv(), verbose=True)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.mount("/static", StaticFiles(directory="dist/static"), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse(os.path.join("dist", "index.html"))

@app.on_event("startup")
def get_env():
    app.state.api_key = os.getenv("API_KEY")


if __name__ == '__main__':
    import uvicorn

    uvicorn.run("main:app", reload=True, host="localhost", port=12000)
