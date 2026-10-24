from fastapi import APIRouter
from ..services.knowledge_base import DEVELOPER_PROFILE

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

@router.get("/profile")
async def get_profile():
    return DEVELOPER_PROFILE

@router.get("/stats")
async def get_stats():
    return DEVELOPER_PROFILE["stats"]

@router.get("/projects")
async def get_projects():
    return DEVELOPER_PROFILE["projects"]

@router.get("/stack")
async def get_stack():
    return DEVELOPER_PROFILE["core_stack"]
