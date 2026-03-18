from openai import OpenAI


class OpenAIEmbedder:
    MAX_EMBED_BATCH_ITEMS = 256
    MAX_EMBED_BATCH_CHARS = 500_000

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

        client = self._get_client()
        embeddings: list[list[float]] = []
        batch: list[str] = []
        batch_chars = 0

        def flush() -> None:
            nonlocal batch, batch_chars
            if not batch:
                return
            response = client.embeddings.create(model=self.model_name, input=batch)
            embeddings.extend(item.embedding for item in response.data)
            batch = []
            batch_chars = 0

        for text in sanitized:
            text_len = len(text)
            would_exceed_items = len(batch) >= self.MAX_EMBED_BATCH_ITEMS
            would_exceed_chars = batch_chars + text_len > self.MAX_EMBED_BATCH_CHARS
            if batch and (would_exceed_items or would_exceed_chars):
                flush()

            batch.append(text)
            batch_chars += text_len

        flush()
        return embeddings

    def embed_query(self, text: str) -> list[float]:
        embeddings = self.embed_documents([text])
        return embeddings[0] if embeddings else []
