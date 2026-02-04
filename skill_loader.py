"""
Skill Loader - Reads and indexes all skill files.

This is the foundation of the skill system. It:
1. Scans the skills/ directory for .md files
2. Parses YAML frontmatter (name, description)
3. Builds an index so the agent can search/select skills
4. Loads full skill content when needed

KEY CONCEPT: Skills are just text files. The "magic" is that we:
- Use descriptions to help the LLM choose relevant skills
- Inject the full content into the system prompt to guide behavior
"""

import os
import re
from dataclasses import dataclass
from pathlib import Path

import config


@dataclass
class Skill:
    """
    Represents a loaded skill.

    Attributes:
        name: Unique identifier (from frontmatter)
        description: What the skill does / when to use it (LLM reads this to decide)
        content: Full markdown content (gets injected into system prompt)
        path: Where the file lives (for debugging)
    """
    name: str
    description: str
    content: str
    path: str


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """
    Parse YAML frontmatter from markdown.

    Frontmatter looks like:
    ---
    name: my-skill
    description: Use when doing X...
    ---

    # Rest of content here

    Returns:
        (frontmatter_dict, body_content)
    """
    # Match content between --- markers at start of file
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(pattern, text, re.DOTALL)

    if not match:
        # No frontmatter found, return empty dict and full text
        return {}, text

    frontmatter_text = match.group(1)
    body = match.group(2)

    # Parse simple YAML (just key: value pairs)
    frontmatter = {}
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            frontmatter[key.strip()] = value.strip()

    return frontmatter, body


def load_skill(filepath: str) -> Skill | None:
    """
    Load a single skill from a markdown file.

    Returns None if the file doesn't have required frontmatter.
    """
    with open(filepath, 'r') as f:
        text = f.read()

    frontmatter, body = parse_frontmatter(text)

    # Require name and description
    if 'name' not in frontmatter or 'description' not in frontmatter:
        print(f"Warning: Skipping {filepath} - missing name or description in frontmatter")
        return None

    return Skill(
        name=frontmatter['name'],
        description=frontmatter['description'],
        content=body.strip(),
        path=filepath
    )


def load_all_skills() -> dict[str, Skill]:
    """
    Scan skills directory and load all valid skill files.

    Returns:
        Dictionary mapping skill name -> Skill object

    This runs at startup to build the skill index.
    """
    skills = {}
    skills_path = Path(config.SKILLS_DIR)

    if not skills_path.exists():
        print(f"Warning: Skills directory '{config.SKILLS_DIR}' not found")
        return skills

    # Recursively find all .md files
    for filepath in skills_path.rglob('*.md'):
        # Skip template files
        if filepath.name.startswith('_'):
            continue

        skill = load_skill(str(filepath))
        if skill:
            skills[skill.name] = skill
            print(f"Loaded skill: {skill.name}")

    return skills


def get_skill_descriptions(skills: dict[str, Skill]) -> str:
    """
    Format skill descriptions for the LLM to read during selection.

    This is what the skill selector sees when deciding which skills to load.
    """
    lines = []
    for name, skill in skills.items():
        lines.append(f"- {name}: {skill.description}")
    return '\n'.join(lines)
