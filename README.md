# Design Kit

AI-powered design system skills for product designers. Works with Figma through Claude Code and Cursor.

Catalog your tokens, explore variations, audit designs, stress-test with real content,
and hand off to engineering — all from your terminal.

## What you get

**19 slash commands** organized into 4 phases:

### Phase 1: Setup (one-time — catalog what you have)

| Command | What it does |
|---|---|
| `/setup-tokens` | Pull design tokens from Figma into structured JSON |
| `/setup-components` | Document component specs, variants, and props |
| `/setup-relationships` | Map how components depend on each other |
| `/setup-icons` | Catalog icons with keys, categories, and search tags |

### Phase 2: Create (the design loop)

| Command | What it does |
|---|---|
| `/brainstorm` | Generate 3-5 design variations using SCAMPER + Jobs-to-be-Done |
| `/plan` | Create a build plan from a brief, wireframe, or screenshot |
| `/build` | Execute a plan in Figma — components, tokens, layout |
| `/plan-component` | Plan a new component — variants, props, tokens, anatomy |
| `/build-component` | Build a component set in Figma from a plan |
| `/flow` | Design multi-screen flows (onboarding, checkout, settings) |
| `/responsive` | Desktop to tablet and mobile with content choreography |

### Phase 3: Review (check and fix)

| Command | What it does |
|---|---|
| `/audit` | Nielsen's heuristics + Gestalt + cognitive load + token compliance |
| `/stress-test` | Break your design with edge-case content before users do |
| `/review-component` | Score component quality across 9 dimensions |
| `/revise` | Apply feedback from Figma comments or direct input |
| `/diff` | What changed in your design system since last extraction? |

### Phase 4: Handoff (ship to engineering)

| Command | What it does |
|---|---|
| `/handoff` | Generate developer-ready specs with exact tokens and states |
| `/handoff-ai` | Optimize your Figma file for AI/MCP consumption |

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) or [Cursor](https://cursor.com)
- [Figma Desktop](https://www.figma.com/downloads/) with a design system file open
- [Figma Console MCP](https://github.com/nicholasgriffintn/figma-console-mcp) — connects Claude/Cursor to Figma

---

## Installation

### Option A: Claude Code (recommended)

**Global install** — available in every project:

```bash
git clone https://github.com/nicholasgriffintn/design-kit.git ~/.design-kit
cd ~/.design-kit && ./setup
```

**Project-local install** — scoped to one repo:

```bash
git clone https://github.com/nicholasgriffintn/design-kit.git
cd design-kit && ./setup --local
```

Skills are installed as slash commands. Type `/setup-tokens` in Claude Code to start.

### Option B: Cursor (with setup script)

```bash
git clone https://github.com/nicholasgriffintn/design-kit.git ~/.design-kit
cd ~/.design-kit && ./setup --cursor=/path/to/your/project
```

This copies all skills to `.cursor/rules/` and creates a `.cursorrules` file automatically.

To install into the current directory instead:

```bash
cd your-project
~/.design-kit/setup --cursor
```

Then reference skills in Cursor by asking:
*"Follow the design-kit-brainstorm rules to explore variations"* or
*"Use design-kit-plan to plan a settings page"*

### Option C: Add to an existing Cursor project (no install script)

Each skill is just a text file. You can drop them into any project and Cursor
will pick them up automatically. No command line required beyond the initial download.

**Step 1: Download design-kit into your project**

Open Terminal, navigate to your project folder, and run:

```bash
git clone https://github.com/nicholasgriffintn/design-kit.git .design-kit
```

This creates a hidden `.design-kit` folder inside your project with all the skills.

> **What if I don't have Terminal experience?**
> Open Cursor, press `Ctrl+`` ` (backtick) to open the built-in terminal, paste
> the command above, and press Enter. That's it.

**Step 2: Copy the skills Cursor needs**

Still in Terminal (or Cursor's built-in terminal), run:

```bash
mkdir -p .cursor/rules
for skill in .design-kit/*/SKILL.md; do
  name=$(basename "$(dirname "$skill")")
  cp "$skill" ".cursor/rules/design-kit-${name}.md"
done
```

This copies each skill into `.cursor/rules/` where Cursor automatically reads them.

**Step 3: Add a `.cursorrules` file**

Create a file called `.cursorrules` in your project root (not inside any folder)
with this content:

```
When the user asks you to work with Figma, design systems, design tokens,
components, or design workflows, follow the instructions in the
.cursor/rules/design-kit-*.md files.

Use the Figma Console MCP tools (figma_*) to interact with Figma.

Available design-kit commands (reference by name):

Setup (one-time — catalog your design system):
- setup-tokens: Pull tokens from Figma
- setup-components: Document component specs
- setup-relationships: Map component dependencies
- setup-icons: Catalog icon library with search tags

Create (design new screens and components):
- brainstorm: Generate design variations using SCAMPER
- plan: Create a structured build plan
- build: Execute a plan in Figma
- plan-component: Plan a new component (variants, props, tokens)
- build-component: Build a component set in Figma
- flow: Multi-screen connected flows
- responsive: Desktop to tablet/mobile

Review (check and fix your work):
- audit: Heuristic + token + Gestalt audit
- stress-test: Stress-test with edge-case content
- review-component: Score component quality (9 dimensions)
- revise: Apply feedback from Figma comments or direct input
- diff: Design system change detection

Handoff (ship to engineering):
- handoff: Developer handoff documentation
- handoff-ai: Optimize file for AI/MCP
```

> **Tip:** You can create this file in Cursor — just right-click your project root
> in the sidebar, choose "New File", name it `.cursorrules`, and paste the text above.

**Step 4: Use skills in Cursor**

That's it. Now just tell Cursor which skill to use in plain English:

- *"Follow the design-kit-brainstorm rules to explore variations for my dashboard"*
- *"Use design-kit-plan to plan a settings page"*
- *"Run design-kit-audit on my current Figma selection"*

Cursor reads the rules from `.cursor/rules/` and follows the skill instructions
automatically. No slash commands needed.

**Updating to the latest version**

When new skills are added or existing ones improve, update by running:

```bash
cd .design-kit && git pull && cd ..
for skill in .design-kit/*/SKILL.md; do
  name=$(basename "$(dirname "$skill")")
  cp "$skill" ".cursor/rules/design-kit-${name}.md"
done
```

**Only want specific skills?**

You don't have to install everything. Just copy the ones you need:

```bash
mkdir -p .cursor/rules
cp .design-kit/plan/SKILL.md .cursor/rules/design-kit-plan.md
cp .design-kit/build/SKILL.md .cursor/rules/design-kit-build.md
cp .design-kit/audit/SKILL.md .cursor/rules/design-kit-audit.md
```

### Figma Console MCP setup

Both Claude Code and Cursor need the Figma Console MCP server to talk to Figma.

**Claude Code** — add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "figma-console-mcp"]
    }
  }
}
```

**Cursor** — add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "figma-console-mcp"]
    }
  }
}
```

Then open your Figma file and run the **Desktop Bridge** plugin (Plugins > Development > Figma Desktop Bridge).

---

## Quick start

### First time: catalog your design system

```
/setup-tokens          # pulls colors, spacing, typography, radii
/setup-components      # catalogs all components with variant keys
/setup-relationships   # maps how components compose together
/setup-icons           # catalogs icons with search tags
```

This creates a `design-system/` directory with your tokens, component specs, and dependency graph.
It's a one-time step — the data is cached locally for all future commands.

### Design something new

```
/plan                  # describe what you want, or paste a screenshot
/build                 # executes the plan in Figma
```

### Explore variations

```
/brainstorm            # generates 3-5 alternative layouts from your design
/responsive            # creates tablet + mobile versions
/flow                  # plans a multi-screen flow (onboarding, checkout)
```

### Check your work

```
/stress-test           # injects extreme content — long names, empty states, RTL
/audit                 # scores against Nielsen's 10, Gestalt, cognitive load
/diff                  # what changed in the design system since last extraction?
```

### Build a new component

```
/plan-component        # plan variants, props, tokens, anatomy
/build-component       # create the component set in Figma
/review-component      # score quality across 9 dimensions
```

### Iterate and ship

```
/revise                # apply feedback without rebuilding from scratch
/handoff               # generate developer specs with exact tokens and states
```

---

## How it works

```
Phase 1: SETUP (one-time)
  /setup-tokens → /setup-components → /setup-relationships → /setup-icons

Phase 2: CREATE
  /brainstorm ──→ pick a direction
       │
  /plan ──→ /build ──→ see it in Figma
       │         │
  /flow       /responsive
  (multi-screen)  (tablet + mobile)

Phase 3: REVIEW
  /stress-test ──→ /audit ──→ /revise
  (break it)      (check it)   (fix it)

Phase 4: HANDOFF
  /handoff ──→ done

Need a new component?
  /plan-component ──→ /build-component ──→ /review-component
```

Skills read from and write to three local directories:

| Directory | What's in it | Created by |
|---|---|---|
| `design-system/` | Tokens, icons, component specs, relationships | `/setup-*` skills, `/build-component` |
| `plans/` | Screen + component build plans | `/plan`, `/brainstorm`, `/plan-component` |
| `reports/` | Audit, stress, diff, and review reports | `/audit`, `/stress-test`, `/diff`, `/review-component` |

You don't need to extract first — most skills can read directly from Figma as a
fallback. But extraction is faster for repeated use and lets you track changes over time.

---

## Staying up to date

The `--update` flag pulls the latest version from git, shows what changed, and reinstalls:

```bash
# Claude Code (global)
cd ~/.design-kit && ./setup --update

# Claude Code (project-local)
cd design-kit && ./setup --update

# Cursor
cd ~/.design-kit && ./setup --update --cursor=/path/to/your/project
```

The update shows you exactly what changed:

```
design-kit v0.2.0

✓ Updated: v0.1.0 → v0.2.0

What's new:
  + new  /responsive
  ~ updated  /audit
  ~ updated  /brainstorm
  ~ updated  PRINCIPLES.md

→ Installing 19 skills...
```

### Automatic updates (optional)

Set up a daily update with cron:

```bash
(crontab -l 2>/dev/null; echo "0 9 * * * cd ~/.design-kit && ./setup --update") | crontab -
```

Or add to your project's Makefile:

```makefile
update-design-kit:
	cd ~/.design-kit && ./setup --update
```

---

## Design principles

Design Kit embeds established design frameworks into every skill:

- **Nielsen's 10 Usability Heuristics** — scored 0-10 in audits, referenced in brainstorms
- **Gestalt Principles** — proximity, similarity, continuity checks in audits and planning
- **Cognitive Load Laws** — Hick's, Miller's, Fitts's Law with severity thresholds
- **SCAMPER** — structured variation technique for brainstorming
- **Jobs-to-be-Done** — each variation optimizes for a specific user job
- **Content Choreography** — responsive adaptation based on content priority
- **AI Slop Check** — catches generic card grids, uniform spacing, and "clean modern" non-decisions
- **Component Design Principles** — variant architecture, duplicate detection, token binding rules, quality dimensions

See [PRINCIPLES.md](PRINCIPLES.md) for the full framework reference.

---

## Benchmarking

Design Kit includes an AI-based evaluation system to test skill quality over time.

```
/eval-skills             # run benchmarks against test cases
```

Test cases feed varied inputs to each skill (vague briefs, contradictory constraints,
intentionally flawed designs) and score the output against rubrics. This catches
regressions when skills are edited and identifies weaknesses.

```
benchmarks/
├── test-cases/          # Diverse inputs per skill (vague, complex, edge-case)
├── rubrics/             # Shared + per-skill scoring criteria
├── results/             # Timestamped scores + baseline
└── dashboard.html       # Visual benchmark dashboard (open in browser)
```

Open `benchmarks/dashboard.html` in a browser and load a results JSON to see
score trends, weakest criteria, and per-test-case breakdowns.

---

## Project structure

```
design-kit/
├── design-system/           # Extracted design system data (generated)
│   ├── tokens.json          #   Design tokens with Figma variable keys
│   ├── icons.json           #   Icon catalog with keys, categories, tags
│   ├── components/          #   Component specs (index.json + per-component)
│   └── relationships.json   #   Component dependency graph
├── plans/                   # Build plans (generated)
│   └── components/          #   Component plans (from plan-component)
├── reports/                 # Audit/stress/diff/review reports (generated)
├── setup-tokens/            # Skills (each contains a SKILL.md)
├── setup-components/
├── setup-relationships/
├── setup-icons/
├── plan/
├── build/
├── brainstorm/
├── responsive/
├── flow/
├── stress-test/
├── audit/
├── diff/
├── revise/
├── plan-component/
├── build-component/
├── review-component/
├── handoff/
├── handoff-ai/
├── setup                    # Installation script
├── CLAUDE.md                # Project instructions for Claude
├── PRINCIPLES.md            # Shared design frameworks
├── ETHOS.md                 # Design philosophy
└── VERSION
```

---

## Uninstall

```bash
cd ~/.design-kit && ./setup --uninstall
```

For Cursor, delete the `.cursor/rules/design-kit-*.md` files.

---

## License

MIT

## Author

Sidharath Chhatani
