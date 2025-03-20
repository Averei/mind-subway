from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .routes import outlet_routes, chat_routes

app = FastAPI(title="Mind Subway API")

# Update CORS settings for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mind-subway-frontend.onrender.com",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(outlet_routes.router, prefix="/api/outlets", tags=["outlets"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "Welcome to MindHive Subway Outlets API"}