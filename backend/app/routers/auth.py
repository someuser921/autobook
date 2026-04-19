from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_session
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, Token
from app.services.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, data: UserRegister, session: AsyncSession = Depends(get_session)):
    existing = await session.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, name=data.name, password_hash=hash_password(data.password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, data: UserLogin, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))
