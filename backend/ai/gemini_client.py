import json
import re
import asyncio
import google.generativeai as genai
from backend.utils.config import Settings
from backend.models.schemas import CopilotResponse

class GeminiClient:
    def __init__(self, api_key: str = ''):
        self.api_key = api_key
        self.available = False
        self.model = None
        self._setup()

    def _setup(self):
        current_settings = Settings()
        key = self.api_key or current_settings.gemini_api_key
        if key:
            try:
                genai.configure(api_key=key)
                # Try preferred model names in order of availability
                for model_name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']:
                    try:
                        self.model = genai.GenerativeModel(model_name)
                        self.available = True
                        self.api_key = key
                        break
                    except Exception:
                        continue
            except Exception as e:
                print(f"Gemini init warning: {e}")
                self.available = False

    def is_available(self) -> bool:
        if not self.available or not self.model:
            self._setup()
        return self.available

    async def generate_insight(self, prompt: str, context: dict) -> dict:
        if not self.is_available():
            return None
        try:
            system_prompt = '''You are an AI facility management expert for EcoNexus Intelligence. 
Analyze facility data and provide structured insights.
Always respond in this JSON format:
{"insight": "...", "cause": "...", "evidence": ["..."], "prediction": "...", "recommendation": "...", "expected_impact": "...", "confidence": 0.85, "assumptions": ["..."]}
Base your analysis on the actual data provided. Never fabricate specific numbers not in the data.
Label all outputs as AI Decision-Support Insights.'''
            
            full_prompt = f"{system_prompt}\n\nContext: {json.dumps(context)}\n\nQuestion: {prompt}"
            response = await asyncio.to_thread(self.model.generate_content, full_prompt)
            text = response.text
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {'insight': text, 'cause': '', 'evidence': [], 'prediction': '', 'recommendation': '', 'expected_impact': '', 'confidence': 0.7, 'assumptions': []}
        except Exception as e:
            print(f'Gemini API error: {e}')
            return None
    
    async def copilot_chat(self, question: str, facility_data: dict) -> CopilotResponse | None:
        if not self.is_available():
            return None
        res = await self.generate_insight(question, facility_data)
        if res:
            return CopilotResponse(
                answer=res.get('insight', ''),
                insight=res.get('insight', ''),
                cause=res.get('cause', ''),
                evidence=res.get('evidence', []),
                prediction=res.get('prediction', ''),
                recommendation=res.get('recommendation', ''),
                expected_impact=res.get('expected_impact', ''),
                confidence=res.get('confidence', 0.8),
                assumptions=res.get('assumptions', []),
                data_label='AI Decision-Support Insight'
            )
        return None

gemini_client = GeminiClient()
