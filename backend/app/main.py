from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.database import create_tables
from app.api import users, codeforces, contests, planner, analytics, notifications
from app.services.scheduler_service import start_scheduler, stop_scheduler

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    print("[INFO] Database tables created/verified")
    try:
        start_scheduler()
        print("[INFO] Contest reminders scheduler started successfully")
    except Exception as e:
        print(f"[WARNING] Could not start reminders scheduler: {e}")
    yield
    # Shutdown
    try:
        stop_scheduler()
        print("[INFO] Contest reminders scheduler stopped")
    except Exception as e:
        print(f"[WARNING] Error stopping reminders scheduler: {e}")
    print("[INFO] Shutting down CP OS API")


app = FastAPI(
    title="CP OS API",
    version="1.0.0",
    description="Competitive Programming OS — Backend API",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(codeforces.router, prefix="/api/codeforces", tags=["Codeforces"])
app.include_router(contests.router, prefix="/api/contests", tags=["Contests"])
app.include_router(planner.router, prefix="/api/planner", tags=["Planner"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/")
async def root():
    return {
        "name": "CP OS API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
