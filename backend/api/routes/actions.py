from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.ai_service import ai_service
from backend.models.schemas import Action
from typing import Optional

router = APIRouter(prefix='/api/actions', tags=['Actions'])

# In-memory action store for demo
_actions_cache: list[Action] = []


def _ensure_actions():
    global _actions_cache
    if not _actions_cache:
        _actions_cache = ai_service.get_recommendations()


@router.get('/', response_model=list[Action])
def get_actions(status: Optional[str] = None, priority: Optional[str] = None):
    _ensure_actions()
    result = _actions_cache
    if status:
        result = [a for a in result if a.status == status]
    if priority:
        result = [a for a in result if a.priority == priority]
    return result


class StatusUpdate(BaseModel):
    status: str


@router.patch('/{action_id}', response_model=Action)
def update_action(action_id: str, update: StatusUpdate):
    _ensure_actions()
    for i, a in enumerate(_actions_cache):
        if a.id == action_id:
            _actions_cache[i].status = update.status
            return _actions_cache[i]
    raise HTTPException(status_code=404, detail="Action not found")


@router.post('/generate', response_model=list[Action])
def generate_actions():
    global _actions_cache
    _actions_cache = ai_service.get_recommendations()
    return _actions_cache
