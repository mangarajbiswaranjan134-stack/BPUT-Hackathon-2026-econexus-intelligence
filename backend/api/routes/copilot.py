from fastapi import APIRouter
from backend.services.ai_service import ai_service
from backend.models.schemas import CopilotQuery, CopilotResponse

router = APIRouter(prefix='/api/copilot', tags=['Copilot'])

@router.post('/ask', response_model=CopilotResponse)
@router.post('/chat', response_model=CopilotResponse)
async def ask_copilot(query: CopilotQuery):
    return await ai_service.copilot_ask(query.question)

