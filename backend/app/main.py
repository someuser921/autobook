from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.dependencies import get_current_user
from app.schemas.user import UserOut
from app.routers import auth, vehicles, maintenance, fuel, stats, search

app = FastAPI(title="AutoBook API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(maintenance.router, prefix="/api")
app.include_router(fuel.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(search.router, prefix="/api")


@app.get("/api/auth/me", response_model=UserOut, tags=["auth"])
async def me(user=Depends(get_current_user)):
    return user


@app.get("/health")
async def health():
    return {"status": "ok"}
