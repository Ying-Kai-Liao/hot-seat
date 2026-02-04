#!/usr/bin/env python3
"""
Multi-Persona Product Feedback Agent

A skill-based agent that creates a round-table discussion
with different personas to evaluate product ideas.

Usage:
    python main.py                          # Interactive mode
    python main.py --idea product.txt       # Read idea from file
    python main.py --idea product.txt -t 2  # From file, brainstorm mode

Environment:
    OPENAI_API_KEY - Your OpenAI API key

Learn more about how this works by reading the code comments!
"""

import argparse
import sys
from pathlib import Path
from orchestrator import Orchestrator


def print_banner():
    """Print welcome banner."""
    print("""
╔══════════════════════════════════════════════════════════════╗
║         🎭 Multi-Persona Product Feedback Agent 🎭            ║
║                                                              ║
║  Personas discuss your idea and ask YOU questions when       ║
║  they need more info. Discussion ends when they conclude     ║
║  or you type 'stop'.                                         ║
╚══════════════════════════════════════════════════════════════╝
""")


def get_task_type() -> str:
    """Ask user what type of feedback they want."""
    print("What would you like to do?")
    print("  1. Critique - Find weaknesses and risks")
    print("  2. Brainstorm - Generate variations and improvements")
    print("  3. Find PMF - Analyze product-market fit")
    print()

    choice = input("Choose (1/2/3) [default: 1]: ").strip()

    task_map = {
        "1": "critique",
        "2": "brainstorm",
        "3": "find-pmf",
        "": "critique"
    }

    return task_map.get(choice, "critique")


def ask_yes_no(prompt: str, default: bool = False) -> bool:
    """Ask a yes/no question."""
    suffix = "[Y/n]" if default else "[y/N]"
    response = input(f"{prompt} {suffix}: ").strip().lower()

    if not response:
        return default
    return response in ('y', 'yes')


def ask_save_chat(agent: Orchestrator):
    """Ask user if they want to save the chat."""
    if not ask_yes_no("\n💾 Save this discussion?", default=False):
        return

    print("Format?")
    print("  1. JSON (machine-readable, includes all metadata)")
    print("  2. Markdown (human-readable)")
    format_choice = input("Choose (1/2) [default: 2]: ").strip()
    format_type = "json" if format_choice == "1" else "markdown"

    custom_path = input("Filepath (press Enter for auto): ").strip()
    filepath = custom_path if custom_path else None

    agent.save_chat(filepath=filepath, format=format_type)


def get_multiline_input() -> str:
    """
    Get multi-line input from user.

    Start with \"\"\" to enter multi-line mode.
    End with \"\"\" on its own line to finish.
    """
    print('📝 Multi-line mode. Type your idea, then \"\"\" on a new line to finish:')
    print('─' * 40)

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


def get_product_idea() -> str | None:
    """
    Get product idea from user with support for multi-line input.

    - Single line: just type and press Enter
    - Multi-line: start with \"\"\" to enter multi-line mode
    - Quit: type 'quit', 'exit', or 'q'
    """
    print("\n" + "─" * 60)
    print("💡 Enter your product idea:")
    print("   - Single line: just type and press Enter")
    print('   - Multi-line: type \"\"\" to start, \"\"\" to end')
    print("   - Or 'quit' to exit")

    first_line = input("> ").strip()

    # Check for quit
    if first_line.lower() in ('quit', 'exit', 'q'):
        return None

    # Check for multi-line mode
    if first_line == '"""':
        return get_multiline_input()

    # Single line
    return first_line


def read_idea_from_file(filepath: str) -> str:
    """Read product idea from a file."""
    path = Path(filepath)
    if not path.exists():
        print(f"❌ File not found: {filepath}")
        sys.exit(1)

    content = path.read_text().strip()
    print(f"📄 Loaded idea from: {filepath}")
    print(f"   ({len(content)} characters, {len(content.split())} words)")
    return content


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Multi-Persona Product Feedback Agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                        # Interactive mode
  python main.py --idea product.txt     # Read idea from file
  python main.py -i idea.md -t 2        # From file, brainstorm mode
  python main.py -i idea.md -t 3 --no-interactive
        """
    )

    parser.add_argument(
        '-i', '--idea',
        type=str,
        help='Path to file containing product idea'
    )

    parser.add_argument(
        '-t', '--task',
        type=int,
        choices=[1, 2, 3],
        default=None,
        help='Task type: 1=Critique, 2=Brainstorm, 3=Find PMF'
    )

    parser.add_argument(
        '--no-interactive',
        action='store_true',
        help='Disable interactive mode (no interjections between rounds)'
    )

    parser.add_argument(
        '--save',
        type=str,
        metavar='PATH',
        help='Auto-save chat to this path after discussion'
    )

    parser.add_argument(
        '--format',
        choices=['json', 'markdown'],
        default='markdown',
        help='Format for saved chat (default: markdown)'
    )

    return parser.parse_args()


def main():
    """Main entry point."""
    args = parse_args()

    print_banner()

    # Determine interactive mode
    if args.idea and args.no_interactive:
        interactive = False
    elif args.no_interactive:
        interactive = False
    else:
        interactive = ask_yes_no("🗣️  Enable interactive mode? (interject anytime between rounds)", default=True)

    # Initialize orchestrator (loads all skills)
    try:
        agent = Orchestrator(interactive=interactive)
    except Exception as e:
        print(f"❌ Failed to initialize agent: {e}")
        sys.exit(1)

    print(f"✅ Agent ready! {'Interactive mode ON' if interactive else 'Personas will ask when needed'}\n")
    print("ℹ️  Discussion runs until personas conclude or you type 'stop'\n")

    # If idea provided via CLI, run once and exit
    if args.idea:
        product_idea = read_idea_from_file(args.idea)

        task_map = {1: "critique", 2: "brainstorm", 3: "find-pmf"}
        task_type = task_map.get(args.task) if args.task else get_task_type()

        try:
            agent.run(product_idea, task_type)

            if args.save:
                agent.save_chat(filepath=args.save, format=args.format)
            else:
                ask_save_chat(agent)

        except Exception as e:
            print(f"❌ Error during discussion: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

        return

    # Main loop for interactive use
    while True:
        product_idea = get_product_idea()

        if product_idea is None:
            print("\n👋 Goodbye!")
            break

        if not product_idea:
            print("Please enter a product idea.")
            continue

        task_type = get_task_type()

        try:
            agent.run(product_idea, task_type)

            # Offer to save
            ask_save_chat(agent)

        except Exception as e:
            print(f"❌ Error during discussion: {e}")
            import traceback
            traceback.print_exc()

        print("\n" + "═" * 60)
        input("Press Enter to continue...")


if __name__ == "__main__":
    main()
