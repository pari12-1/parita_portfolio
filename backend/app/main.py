from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .config import settings
from .routers import chatbot, portfolio, contact

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance AI/ML Portfolio and Autonomous Agent API"
)

# CORS configuration to allow local and remote clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chatbot.router)
app.include_router(portfolio.router)
app.include_router(contact.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "AI/ML Portfolio Backend",
        "version": settings.VERSION,
        "runtime": "FastAPI + AsyncIO"
    }

# Mount static frontend files if directory exists
frontend_path = Path(__file__).resolve().parent.parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
