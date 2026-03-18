"""
Defines dependencies used by the endpoints.
"""
from typing import Annotated, Generator

from bot.conversation.chat_history import ChatHistory
from bot.memory.vector_database.chroma import Chroma
from chat_history import chat_history
from fastapi import Depends
from llm_client import llm_client
from openai_client import OpenAIChatClient
from vector_database import index


def get_llm_client() -> Generator[OpenAIChatClient, None, None]:
    """
    Dependency to get the LLM client instance.
    """

    yield llm_client


def get_chat_history() -> Generator[ChatHistory, None, None]:
    """
    Dependency to get the chat history instance.
    """
    yield chat_history


def get_index() -> Generator[Chroma, None, None]:
    """
    Dependency to get the vector database index instance.
    """

    yield index


LamaCppClientDep = Annotated[OpenAIChatClient, Depends(get_llm_client)]
ChatHistoryDep = Annotated[ChatHistory, Depends(get_chat_history)]
VectorDatabaseDep = Annotated[Chroma, Depends(get_index)]
