from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.schemas import LoginRequest, LoginResponse, UserCreate, UserPublic
from app.security import create_session, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_public_user(user: dict) -> UserPublic:
    return UserPublic(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        group=user.get("group", "general"),
        created_at=user["created_at"],
    )


@router.post("/register")
def register(payload: UserCreate, request: Request) -> dict:
    db = request.app.state.db
    normalized_email = payload.email.strip().lower()
    if db.users.find_one({"email": normalized_email}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    user = {
        "id": str(uuid4()),
        "name": payload.name.strip(),
        "email": normalized_email,
        "password_hash": hash_password(payload.password),
        "role": payload.role,
        "group": payload.group,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.users.insert_one(user)
    return {"user": _to_public_user(user).model_dump()}


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request) -> LoginResponse:
    db = request.app.state.db
    normalized_email = payload.email.strip().lower()
    user = db.users.find_one({"email": normalized_email}, {"_id": 0})
    if not user or not user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token, expires_at = create_session(db, user)
    return LoginResponse(
        access_token=token,
        expires_at=expires_at.isoformat(),
        user=_to_public_user(user),
    )


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)) -> dict:
    return {"user": _to_public_user(current_user).model_dump()}


@router.post("/logout")
def logout(request: Request, current_user: dict = Depends(get_current_user)) -> dict:
    authorization = request.headers.get("authorization")
    token = authorization.split(" ", 1)[1].strip()
    request.app.state.db.sessions.delete_one({"token": token, "user_id": current_user["id"]})
    return {"success": True}
