import asyncio
from dataclasses import dataclass
from typing import Any, Iterator

from openai import OpenAI

from bot.client.prompt import (
    QA_PROMPT_TEMPLATE,
    REFINED_ANSWER_CONVERSATION_AWARENESS_PROMPT_TEMPLATE,
    REFINED_CTX_PROMPT_TEMPLATE,
    REFINED_QUESTION_CONVERSATION_AWARENESS_PROMPT_TEMPLATE,
    SYSTEM_TEMPLATE,
    CTX_PROMPT_TEMPLATE,
    generate_conversation_awareness_prompt,
    generate_ctx_prompt,
    generate_qa_prompt,
    generate_refined_ctx_prompt,
)


@dataclass
class RuntimeModelSettings:
    reasoning: bool = False
    reasoning_stop_tag: str = "</think>"


class OpenAIChatClient:
    def __init__(self, api_key: str, model: str) -> None:
        self.api_key = api_key
        self.client: OpenAI | None = None
        self.model = model
        self.model_settings = RuntimeModelSettings()

    def _get_client(self) -> OpenAI:
        if self.client is None:
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY is not set")
            self.client = OpenAI(api_key=self.api_key)
        return self.client

    def generate_answer(self, prompt: str, max_new_tokens: int = 512) -> str:
        output = self._get_client().chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_TEMPLATE},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_new_tokens,
            temperature=0.2,
        )
        return output.choices[0].message.content or ""

    async def async_generate_answer(self, prompt: str, max_new_tokens: int = 512) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.generate_answer, prompt, max_new_tokens)

    def start_answer_iterator_streamer(self, prompt: str, max_new_tokens: int = 512) -> Iterator[Any]:
        return self._get_client().chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_TEMPLATE},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_new_tokens,
            temperature=0.2,
            stream=True,
        )

    async def async_start_answer_iterator_streamer(self, prompt: str, max_new_tokens: int = 512):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.start_answer_iterator_streamer, prompt, max_new_tokens)

    @staticmethod
    def parse_token(token: Any) -> str:
        if isinstance(token, dict):
            return token.get("choices", [{}])[0].get("delta", {}).get("content", "")

        choices = getattr(token, "choices", None)
        if not choices:
            return ""

        delta = getattr(choices[0], "delta", None)
        if not delta:
            return ""

        content = getattr(delta, "content", None)
        return content or ""

    @staticmethod
    def generate_qa_prompt(question: str) -> str:
        return generate_qa_prompt(
            template=QA_PROMPT_TEMPLATE,
            question=question,
        )

    @staticmethod
    def generate_ctx_prompt(question: str, context: str) -> str:
        return generate_ctx_prompt(
            template=CTX_PROMPT_TEMPLATE,
            question=question,
            context=context,
        )

    @staticmethod
    def generate_refined_ctx_prompt(question: str, context: str, existing_answer: str) -> str:
        return generate_refined_ctx_prompt(
            template=REFINED_CTX_PROMPT_TEMPLATE,
            question=question,
            context=context,
            existing_answer=existing_answer,
        )

    @staticmethod
    def generate_refined_question_conversation_awareness_prompt(question: str, chat_history: str) -> str:
        return generate_conversation_awareness_prompt(
            template=REFINED_QUESTION_CONVERSATION_AWARENESS_PROMPT_TEMPLATE,
            question=question,
            chat_history=chat_history,
        )

    @staticmethod
    def generate_refined_answer_conversation_awareness_prompt(question: str, chat_history: str) -> str:
        return generate_conversation_awareness_prompt(
            template=REFINED_ANSWER_CONVERSATION_AWARENESS_PROMPT_TEMPLATE,
            question=question,
            chat_history=chat_history,
        )
