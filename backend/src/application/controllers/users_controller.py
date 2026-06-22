from fastapi import APIRouter, Depends, Path
from src.domain import User
from src.infra import GoogleSheetsUserRepository, NotOwnUserError
from src.dependencies import (
    get_user_repo,
    get_current_user,
)
from src.application.dtos import UserDetailDTO

users_controller = APIRouter(
    prefix="/api",
    tags=["Users"],
)


@users_controller.get("/users/{user_id}", response_model=UserDetailDTO)
async def get_user(
    user_id: int = Path(..., gt=0, description="El ID del usuario debe ser mayor a 0"),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise NotOwnUserError()
    return user_repo.get_by_id(user_id)
