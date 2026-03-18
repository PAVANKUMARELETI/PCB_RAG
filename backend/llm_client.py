from openai_client import OpenAIChatClient
from core.config import settings


def create_llm_client() -> OpenAIChatClient:
    return OpenAIChatClient(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
    )


llm_client = create_llm_client()
