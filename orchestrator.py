"""
Orchestrator - Runs the multi-persona discussion.

This is the main agent loop that:
1. Loads selected skills
2. Runs discussion rounds where each persona speaks
3. Lets personas respond to each other
4. Summarizes insights

KEY CONCEPT: Each persona call is a separate LLM call with that persona's
skill content injected into the system prompt. Same model, different behavior.
"""

import json
from datetime import datetime
from pathlib import Path

import config
import llm
from skill_loader import Skill, load_all_skills
from skill_selector import select_skills, generate_dynamic_persona


class Orchestrator:
    """
    Manages the skill-based discussion agent.

    The orchestrator:
    - Loads all skills at startup
    - Selects relevant skills for each task
    - Injects skills into LLM calls to shape behavior
    - Manages the discussion flow
    - Saves chat history
    """

    def __init__(self, interactive: bool = False):
        """
        Load all skills at initialization.

        Args:
            interactive: If True, allow user to interject between rounds
        """
        print("🔧 Loading skills...")
        self.all_skills = load_all_skills()
        self.interactive = interactive
        self.last_chat = None  # Stores the last discussion for saving
        print(f"✅ Loaded {len(self.all_skills)} skills\n")

    def run(self, product_idea: str, task_type: str = "critique"):
        """
        Run a full discussion about a product idea.

        Args:
            product_idea: The product concept to evaluate
            task_type: What to do - "critique", "brainstorm", or "find-pmf"
        """
        print(f"\n{'='*60}")
        print(f"🎯 Task: {task_type}")
        print(f"💡 Product: {product_idea}")
        print(f"{'='*60}\n")

        # Step 1: Select relevant skills
        print("🔍 Selecting relevant skills...")
        user_request = f"{task_type}: {product_idea}"
        selection = select_skills(user_request, self.all_skills)

        # Step 2: Gather selected skills
        active_skills = self._gather_skills(selection, product_idea)

        # Step 3: Get task skill (how to approach the task)
        task_skill = self._get_task_skill(selection, task_type)

        # Step 4: Run discussion rounds (dynamic - agent decides when to stop)
        discussion = self._run_discussion(
            product_idea=product_idea,
            task_skill=task_skill,
            persona_skills=active_skills
        )

        # Step 5: Summarize
        summary = self._summarize(product_idea, task_type, discussion)

        # Store full chat for saving
        self.last_chat = {
            "timestamp": datetime.now().isoformat(),
            "product_idea": product_idea,
            "task_type": task_type,
            "personas": [s.name for s in active_skills],
            "selection_reasoning": selection.get("reasoning", ""),
            "discussion": discussion,
            "summary": summary
        }

        return summary

    def _gather_skills(self, selection: dict, product_idea: str) -> list[Skill]:
        """
        Gather all persona skills - both pre-defined and dynamically generated.

        This shows how skills can be:
        1. Loaded from files (pre-defined)
        2. Generated on-the-fly (dynamic)
        """
        active_skills = []

        # Load pre-defined persona skills
        for skill_name in selection.get("persona_skills", []):
            if skill_name in self.all_skills:
                active_skills.append(self.all_skills[skill_name])
                print(f"  ✅ Loaded persona: {skill_name}")
            else:
                print(f"  ⚠️  Persona not found: {skill_name}")

        # Generate dynamic personas
        for dynamic in selection.get("dynamic_personas", []):
            print(f"  🔨 Generating dynamic persona: {dynamic['name']}")
            content = generate_dynamic_persona(
                name=dynamic["name"],
                description=dynamic["description"],
                product_context=product_idea
            )
            # Create a Skill object for the dynamic persona
            skill = Skill(
                name=dynamic["name"],
                description=dynamic["description"],
                content=content,
                path="<dynamic>"
            )
            active_skills.append(skill)

        return active_skills

    def _get_task_skill(self, selection: dict, fallback: str) -> Skill | None:
        """Get the task skill (critique, brainstorm, or find-pmf)."""
        task_name = selection.get("task_skill", fallback)
        if task_name in self.all_skills:
            print(f"  ✅ Using task skill: {task_name}")
            return self.all_skills[task_name]
        return None

    def _run_discussion(
        self,
        product_idea: str,
        task_skill: Skill | None,
        persona_skills: list[Skill],
    ) -> list[dict]:
        """
        Run the round-table discussion with dynamic stopping.

        The discussion continues until:
        - Agent decides no more founder input needed for 3 consecutive rounds
        - User manually stops (types 'stop')
        - Max rounds reached (safety limit)

        KEY INSIGHT: The agent has agency to decide when to engage the founder.
        This makes conversations more natural and focused.
        """
        discussion = []  # List of {persona, round, message}
        silent_rounds = 0  # Rounds without asking founder
        round_num = 0

        while round_num < config.MAX_TOTAL_ROUNDS:
            round_num += 1

            print(f"\n{'─'*40}")
            print(f"📢 ROUND {round_num}")
            print(f"{'─'*40}")

            # Each persona speaks
            for persona_skill in persona_skills:
                system_prompt = self._build_persona_prompt(
                    persona_skill=persona_skill,
                    task_skill=task_skill,
                    round_num=round_num
                )

                user_message = self._build_discussion_context(
                    product_idea=product_idea,
                    discussion=discussion,
                    current_persona=persona_skill.name,
                    round_num=round_num
                )

                print(f"\n🎭 {persona_skill.name}:")
                response = llm.chat(system_prompt, user_message)
                print(f"   {response}\n")

                discussion.append({
                    "persona": persona_skill.name,
                    "round": round_num,
                    "message": response
                })

            # Agent decides: should we ask the founder?
            decision = self._should_ask_founder(product_idea, discussion, round_num)

            if decision["should_ask"]:
                silent_rounds = 0  # Reset counter
                print(f"\n{'─'*40}")
                print(f"❓ PERSONAS WANT TO ASK YOU:")
                print(f"   {decision['question']}")
                print(f'\n   (Type \'stop\' to end, or answer. Use \"\"\" for multi-line)')

                user_input = self._get_founder_input()

                if user_input is None:  # User typed 'stop'
                    print("\n🛑 Stopping discussion at your request.")
                    break

                if user_input:
                    print(f"\n👤 FOUNDER:")
                    for line in user_input.split('\n'):
                        print(f"   {line}")
                    print()
                    discussion.append({
                        "persona": "FOUNDER",
                        "round": round_num,
                        "message": user_input
                    })
            else:
                silent_rounds += 1
                print(f"\n💭 Personas continuing discussion... (no question for founder, {silent_rounds}/{config.MAX_SILENT_ROUNDS})")

                # Check if we should auto-stop
                if silent_rounds >= config.MAX_SILENT_ROUNDS:
                    print(f"\n✅ Discussion complete - personas reached conclusion after {round_num} rounds.")
                    break

                # Give user option to interject anyway or stop
                if self.interactive:
                    print('   Press Enter to continue, type input to add thoughts, or \'stop\' to end.')
                    print('   Use \"\"\" for multi-line input.')
                    user_input = self._get_founder_input(allow_empty=True)

                    if user_input is None:  # User typed 'stop'
                        print("\n🛑 Stopping discussion at your request.")
                        break
                    elif user_input:
                        silent_rounds = 0  # User input resets the counter
                        print(f"\n👤 FOUNDER:")
                        for line in user_input.split('\n'):
                            print(f"   {line}")
                        print()
                        discussion.append({
                            "persona": "FOUNDER",
                            "round": round_num,
                            "message": user_input
                        })

        if round_num >= config.MAX_TOTAL_ROUNDS:
            print(f"\n⚠️ Reached maximum rounds ({config.MAX_TOTAL_ROUNDS}). Wrapping up.")

        return discussion

    def _get_founder_input(self, allow_empty: bool = False) -> str | None:
        """
        Get input from the founder with multi-line support.

        Args:
            allow_empty: If True, empty input returns "" instead of re-prompting

        Returns:
            User's input string, or None if they typed 'stop'

        Multi-line mode:
            Type \"\"\" to start, then type your response across multiple lines.
            Type \"\"\" on its own line to finish.
        """
        first_line = input("> ").strip()

        # Check for stop
        if first_line.lower() == 'stop':
            return None

        # Check for multi-line mode
        if first_line == '"""':
            print('📝 Multi-line mode. Type your response, then \"\"\" to finish:')
            lines = []
            while True:
                try:
                    line = input()
                    if line.strip() == '"""':
                        break
                    lines.append(line)
                except EOFError:
                    break
            return '\n'.join(lines)

        # Single line (or empty if allowed)
        if not first_line and not allow_empty:
            return ""

        return first_line

    def _should_ask_founder(
        self,
        product_idea: str,
        discussion: list[dict],
        round_num: int
    ) -> dict:
        """
        Agent decides whether to ask the founder a question.

        This is a meta-level decision: the agent reflects on the discussion
        and decides if more information from the founder would be valuable.

        Returns:
            {"should_ask": bool, "question": str or None}
        """
        system_prompt = """You are a discussion moderator analyzing a product feedback conversation.

Your job is to decide: should we ask the founder/user a clarifying question?

Ask a question if:
- There's missing information that would change the evaluation
- Personas are making assumptions that need validation
- There's a key decision point the founder should weigh in on

Do NOT ask if:
- The discussion is productive and personas have enough info
- Previous questions have already covered the key points
- The personas are close to reaching useful conclusions

Respond with JSON:
{
    "should_ask": true/false,
    "question": "The specific question to ask the founder" or null,
    "reasoning": "Brief explanation of your decision"
}"""

        discussion_text = '\n'.join([
            f"- {d['persona']}: {d['message']}"
            for d in discussion[-10:]  # Last 10 messages for context
        ])

        user_message = f"""Product idea: {product_idea}
Round: {round_num}

Recent discussion:
{discussion_text}

Should we ask the founder a question, or let the discussion continue?"""

        response = llm.chat_json(system_prompt, user_message)

        try:
            result = json.loads(response)
            if result.get("should_ask") and result.get("question"):
                return {"should_ask": True, "question": result["question"]}
            return {"should_ask": False, "question": None}
        except json.JSONDecodeError:
            return {"should_ask": False, "question": None}

    def _build_persona_prompt(
        self,
        persona_skill: Skill,
        task_skill: Skill | None,
        round_num: int
    ) -> str:
        """
        Build system prompt with skill injection.

        THIS IS THE CORE OF HOW SKILLS WORK:
        We inject the skill content into the system prompt.
        The LLM reads these instructions and follows them.
        """
        parts = []

        # Base context
        parts.append("You are participating in a product feedback discussion.")
        parts.append(f"This is round {round_num} of the discussion.\n")

        # Inject task skill (how to approach the evaluation)
        if task_skill:
            parts.append("## YOUR TASK")
            parts.append(task_skill.content)
            parts.append("")

        # Inject persona skill (who you are)
        parts.append("## YOUR PERSONA")
        parts.append(persona_skill.content)
        parts.append("")

        # Discussion guidelines
        parts.append("## GUIDELINES")
        parts.append("- Keep responses concise (2-4 sentences)")
        parts.append("- Stay in character as your persona")
        parts.append("- In round 1, give your initial reaction")
        parts.append("- In later rounds, respond to what others have said")
        parts.append("- Be specific - reference the actual product idea")

        return '\n'.join(parts)

    def _build_discussion_context(
        self,
        product_idea: str,
        discussion: list[dict],
        current_persona: str,
        round_num: int
    ) -> str:
        """Build the user message with discussion history."""
        parts = []

        parts.append(f"Product idea: {product_idea}\n")

        if discussion:
            parts.append("Previous discussion:")
            for entry in discussion:
                parts.append(f"- {entry['persona']} (round {entry['round']}): {entry['message']}")
            parts.append("")

        if round_num == 1:
            parts.append("Give your initial reaction to this product idea.")
        else:
            parts.append("Respond to what others have said. Build on good points, challenge weak ones.")

        return '\n'.join(parts)

    def _summarize(self, product_idea: str, task_type: str, discussion: list[dict]) -> str:
        """Generate a summary of the discussion."""
        print(f"\n{'='*60}")
        print("📊 SUMMARY")
        print(f"{'='*60}\n")

        system_prompt = """You are a neutral moderator summarizing a product feedback discussion.

Provide a concise summary that includes:
1. Key insights (what the personas agreed on)
2. Key disagreements (where they differed)
3. Recommendations (actionable next steps)

Be specific and reference the actual discussion points."""

        discussion_text = '\n'.join([
            f"- {d['persona']}: {d['message']}"
            for d in discussion
        ])

        user_message = f"""Product: {product_idea}
Task: {task_type}

Discussion:
{discussion_text}

Summarize the key takeaways."""

        summary = llm.chat(system_prompt, user_message)
        print(summary)
        return summary

    def save_chat(self, filepath: str | None = None, format: str = "json") -> str:
        """
        Save the last discussion to a file.

        Args:
            filepath: Where to save. If None, auto-generates based on timestamp.
            format: "json" or "markdown"

        Returns:
            The filepath where the chat was saved.

        KEY INSIGHT: Saving chats lets you:
        - Review discussions later
        - Compare how different personas evaluated the same idea
        - Build a library of product feedback
        """
        if not self.last_chat:
            print("❌ No chat to save. Run a discussion first.")
            return ""

        # Auto-generate filepath if not provided
        if not filepath:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_idea = self.last_chat["product_idea"][:30].replace(" ", "_")
            ext = "md" if format == "markdown" else "json"
            filepath = f"chats/{timestamp}_{safe_idea}.{ext}"

        # Ensure directory exists
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)

        if format == "markdown":
            content = self._format_as_markdown()
        else:
            content = json.dumps(self.last_chat, indent=2)

        with open(filepath, "w") as f:
            f.write(content)

        print(f"💾 Chat saved to: {filepath}")
        return filepath

    def _format_as_markdown(self) -> str:
        """Format the chat as readable markdown."""
        chat = self.last_chat
        lines = []

        lines.append(f"# Product Feedback: {chat['product_idea']}")
        lines.append(f"\n**Date:** {chat['timestamp']}")
        lines.append(f"**Task:** {chat['task_type']}")
        lines.append(f"**Personas:** {', '.join(chat['personas'])}")

        if chat.get("selection_reasoning"):
            lines.append(f"\n**Why these personas:** {chat['selection_reasoning']}")

        lines.append("\n---\n")
        lines.append("## Discussion\n")

        current_round = 0
        for entry in chat["discussion"]:
            if entry["round"] != current_round:
                current_round = entry["round"]
                lines.append(f"\n### Round {current_round}\n")

            persona = entry["persona"]
            emoji = "👤" if persona == "USER" else "🎭"
            lines.append(f"**{emoji} {persona}:**")
            lines.append(f"{entry['message']}\n")

        lines.append("\n---\n")
        lines.append("## Summary\n")
        lines.append(chat["summary"])

        return "\n".join(lines)
