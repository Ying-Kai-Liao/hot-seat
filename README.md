# Hot Seat 🔥

> Put your product idea in the hot seat. AI advisors will grill it from every angle.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## What is this?

Hot Seat puts your product ideas through an intense interrogation. Instead of getting polite feedback, you get AI advisors who challenge, probe, and stress-test your concept from every angle (Skeptical VC, Early Adopter, Budget-Conscious Consumer, and dynamically generated domain experts).

**Key features:**
- 🔥 **Brutal honesty** - No sugar-coating, no hand-holding
- 🎭 **Multiple perspectives** - Each advisor has distinct expertise, biases, and evaluation criteria
- 💬 **Dynamic debate** - Advisors respond to each other, building a real conversation
- ❓ **Smart questions** - The system asks you clarifying questions when advisors need more info
- 🔑 **BYOK** - Bring Your Own Key - your API key stays in your browser, never on our servers
- 💾 **Export** - Download sessions as Markdown or JSON

## Quick Start

### Web UI (Recommended)

```bash
# Clone the repo
git clone https://github.com/Ying-Kai-Liao/hot-seat
cd hot-seat

# Start the local server
python server.py

# Open http://localhost:8000 in your browser
```

1. Click the ⚙️ settings icon
2. Enter your OpenAI API key
3. Describe your product idea
4. Click "Take the Hot Seat"

### CLI Version

```bash
# Install dependencies
pip install -r requirements.txt

# Set your API key
export OPENAI_API_KEY="sk-..."

# Run
python main.py

# Or with a file
python main.py --idea product_idea.txt
```

## How It Works

The system uses a **skill-based agent architecture**:

1. **Skill files** define advisors and tasks as markdown with YAML frontmatter
2. **Skill selector** uses an LLM to pick relevant skills for your specific product
3. **Orchestrator** runs the interrogation loop, injecting skills into system prompts
4. **Meta-moderator** decides when to ask you questions vs. let advisors continue

```
Your idea → Skill Selection → Advisor Loading → Interrogation Loop → Verdict
                                      ↓
                              [Ask founder?] ←→ Your input
```

## Project Structure

```
hot-seat/
├── web/                    # Web UI (vanilla HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── skills/                 # Advisor and task definitions
│   ├── personas/
│   │   ├── skeptical-vc.md
│   │   ├── early-adopter.md
│   │   └── budget-conscious.md
│   └── tasks/
│       ├── critique.md
│       ├── brainstorm.md
│       └── find-pmf.md
├── main.py                 # CLI entry point
├── server.py               # Static file server for web UI
├── orchestrator.py         # Main agent logic
├── skill_loader.py         # Parses skill files
├── skill_selector.py       # LLM picks skills
├── llm.py                  # OpenAI wrapper
└── config.py               # Settings
```

## Skill Format

Skills are markdown files with YAML frontmatter:

```markdown
---
name: skeptical-vc
description: Use when evaluating product ideas from an investor's perspective.
---

# Skeptical VC

## Your Identity
You are a veteran VC partner who has seen 10,000 pitches...

## How You Think
- First question: "Why will this fail?"
- Care about: TAM/SAM/SOM, unit economics...

## Response Style
Direct and blunt. Ask pointed questions...
```

## Adding Custom Advisors

1. Create a new file in `skills/personas/`:

```markdown
---
name: my-advisor
description: Use when evaluating products for [specific context].
---

# My Custom Advisor

## Your Identity
[Who is this advisor? Background, experience, values]

## How You Think
[What do they evaluate? What are their biases?]

## Response Style
[How do they communicate?]
```

2. The system will automatically discover and use it when relevant.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |

### Config Options (config.py)

```python
MODEL = "gpt-4o-mini"      # LLM model to use
MAX_SILENT_ROUNDS = 3      # Auto-stop after N rounds without questions
MAX_TOTAL_ROUNDS = 10      # Safety limit
```

## Privacy & Security

- **BYOK (Bring Your Own Key)**: Your API key is stored in your browser's localStorage and never sent to any server except OpenAI.
- **No backend**: The web UI makes API calls directly from your browser to OpenAI.
- **Local-first**: Everything runs on your machine.

## Contributing

Contributions welcome! Some ideas:

- [ ] More advisors (industry-specific experts)
- [ ] More modes (due diligence, pivot analysis, competitive teardown)
- [ ] Advisor memory across sessions
- [ ] Export to Notion/Google Docs

## License

MIT

---

Built by [Ying-Kai Liao](https://github.com/Ying-Kai-Liao) with 🔥 and Claude
