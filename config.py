"""
Configuration for the skill-based agent.

This file holds settings that control the agent's behavior.
"""

import os

# OpenAI API settings
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
MODEL = "gpt-5-mini"  # The model to use for all LLM calls

# Agent settings
SKILLS_DIR = "skills"  # Where skill files live
MAX_SILENT_ROUNDS = 3  # Auto-stop if no questions for founder after this many rounds
MAX_TOTAL_ROUNDS = 10  # Safety limit to prevent infinite loops
NUM_PERSONAS = 4  # How many personas to use (mix of core + dynamic)
