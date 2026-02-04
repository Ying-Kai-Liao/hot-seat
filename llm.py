"""
LLM wrapper for OpenAI API.

This module handles all communication with the LLM.
Key concept: Every call can have a different system prompt -
this is how we "inject" skills to change behavior.
"""

from openai import OpenAI
import config


def get_client() -> OpenAI:
    """Create OpenAI client."""
    return OpenAI(api_key=config.OPENAI_API_KEY)


def chat(
    system_prompt: str,
    user_message: str,
) -> str:
    """
    Send a message to the LLM and get a response.

    Args:
        system_prompt: Instructions that shape LLM behavior (this is where skills get injected!)
        user_message: The actual user input or task

    Returns:
        The LLM's response text

    KEY INSIGHT: By changing system_prompt, we change how the LLM behaves.
    Same LLM, different personality based on what instructions we inject.
    """
    client = get_client()

    response = client.chat.completions.create(
        model=config.MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )

    return response.choices[0].message.content


def chat_json(
    system_prompt: str,
    user_message: str,
) -> str:
    """
    Same as chat(), but requests JSON output.

    Used for structured responses like skill selection.
    """
    client = get_client()

    response = client.chat.completions.create(
        model=config.MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        response_format={"type": "json_object"}
    )

    return response.choices[0].message.content
