import os
from pathlib import Path
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.dependencies import get_current_user
from app.schemas.user import UserOut
from app.routers import auth, vehicles, maintenance, fuel, stats, search, planned
from app.routers import photos as photos_router

limiter = Limiter(key_func=get_remote_address)

docs_url = None if os.getenv("ENVIRONMENT") == "production" else "/docs"
redoc_url = None if os.getenv("ENVIRONMENT") == "production" else "/redoc"

app = FastAPI(title="AutoBook API", version="1.0.0", docs_url=docs_url, redoc_url=redoc_url)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


app.include_router(auth.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(maintenance.router, prefix="/api")
app.include_router(fuel.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(planned.router, prefix="/api")
app.include_router(photos_router.router, prefix="/api")


@app.get("/api/auth/me", response_model=UserOut, tags=["auth"])
async def me(user=Depends(get_current_user)):
    return user


@app.get("/health")
async def health():
    return {"status": "ok"}
