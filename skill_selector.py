"""
Skill Selector - LLM decides which skills to load.

This is where the "agent chooses its own instructions" magic happens.

KEY CONCEPT: Instead of hardcoding which personas/tasks to use,
we ask the LLM to analyze the user's request and pick relevant skills.
The LLM reads skill descriptions and returns which ones to load.
"""

import json

import llm
import config
from skill_loader import Skill, get_skill_descriptions


SELECTOR_SYSTEM_PROMPT = """You are a skill selector for a product feedback agent.

Your job is to analyze the user's request and select the most relevant skills to load.

You will be given:
1. The user's product idea or request
2. A list of available skills with their descriptions

Select skills that will help accomplish the task:
- Pick 1 task skill (critique, brainstorm, or find-pmf)
- Pick 2-3 persona skills that are most relevant to this product domain
- If needed, suggest 1-2 dynamic personas to generate (not in the list)

Respond with JSON in this exact format:
{
    "task_skill": "skill-name",
    "persona_skills": ["persona1", "persona2"],
    "dynamic_personas": [
        {"name": "persona-name", "description": "who this persona is and why they're relevant"}
    ],
    "reasoning": "brief explanation of why you chose these"
}
"""


def select_skills(
    user_request: str,
    available_skills: dict[str, Skill]
) -> dict:
    """
    Ask the LLM to select relevant skills for the user's request.

    Args:
        user_request: What the user wants to do (e.g., "Critique my AI pet translator idea")
        available_skills: All loaded skills from skill_loader

    Returns:
        Dictionary with selected skill names and any dynamic personas to create

    KEY INSIGHT: This is an LLM call where the output determines what instructions
    the agent will follow. The agent is essentially programming itself.
    """
    # Format skill descriptions for the LLM to read
    skill_list = get_skill_descriptions(available_skills)

    user_message = f"""User request: {user_request}

Available skills:
{skill_list}

Select the most relevant skills for this request."""

    # Call LLM with JSON mode for structured response
    response = llm.chat_json(SELECTOR_SYSTEM_PROMPT, user_message)

    try:
        selection = json.loads(response)
        print(f"\n📋 Skill selection reasoning: {selection.get('reasoning', 'N/A')}")
        return selection
    except json.JSONDecodeError:
        print(f"Warning: Could not parse skill selection response: {response}")
        # Fallback to defaults
        return {
            "task_skill": "critique",
            "persona_skills": [],
            "dynamic_personas": []
        }


def generate_dynamic_persona(name: str, description: str, product_context: str) -> str:
    """
    Generate a full skill definition for a dynamic persona.

    When the skill selector decides we need a persona that doesn't exist,
    we generate one on-the-fly using the LLM.

    Args:
        name: What to call this persona
        description: Who they are and why they're relevant
        product_context: The product being evaluated (for context)

    Returns:
        Full persona skill content (markdown format, without frontmatter)
    """
    system_prompt = """You are creating a persona definition for a product feedback agent.

Generate a detailed persona that will evaluate product ideas from their unique perspective.

Output format (markdown):
# [Persona Name]

## Your Identity
[2-3 sentences about who this person is - background, experience, values]

## How You Think
[Bullet points about their evaluation criteria and biases]

## Response Style
[How they communicate - tone, focus areas, typical reactions]

## In Discussions
[How they interact with other personas - when they agree, disagree, defer]
"""

    user_message = f"""Create a persona for:
Name: {name}
Description: {description}
Product context: {product_context}

Make this persona feel real and distinct. They should have clear opinions and evaluation criteria."""

    return llm.chat(system_prompt, user_message)
