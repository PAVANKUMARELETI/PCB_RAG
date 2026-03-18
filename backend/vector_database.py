from pathlib import Path

from bot.memory.vector_database.chroma import Chroma
from core.config import settings
from openai_embedder import OpenAIEmbedder


def init_index(vector_store_path: Path) -> Chroma:
    """
    Loads a Vector Database index based on the specified vector store path.

    Args:
        vector_store_path (Path): The path to the vector store.

    Returns:
        Chroma: An instance of the Vector Database.
    """
    embedding = OpenAIEmbedder(
        api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_EMBEDDING_MODEL or settings.EMBEDDING_MODEL,
    )
    index = Chroma(is_persistent=True, persist_directory=str(vector_store_path), embedding=embedding)

    return index


index = init_index(settings.VECTOR_STORE_PATH)
