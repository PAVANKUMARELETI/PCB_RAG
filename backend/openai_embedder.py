from openai import OpenAI


class OpenAIEmbedder:
    def __init__(self, api_key: str, model_name: str) -> None:
        self.api_key = api_key
        self.client: OpenAI | None = None
        self.model_name = model_name

    def _get_client(self) -> OpenAI:
        if self.client is None:
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY is not set")
            self.client = OpenAI(api_key=self.api_key)
        return self.client

    def embed_documents(self, texts: list[str], **kwargs) -> list[list[float]]:
        del kwargs
        sanitized = [text.replace("\n", " ") for text in texts]
        if not sanitized:
            return []

        response = self._get_client().embeddings.create(model=self.model_name, input=sanitized)
        return [item.embedding for item in response.data]

    def embed_query(self, text: str) -> list[float]:
        embeddings = self.embed_documents([text])
        return embeddings[0] if embeddings else []
