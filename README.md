# Design Kit

AI-powered design system skills for product designers. Works with Figma through Claude Code and Cursor.

Extract tokens, audit designs against heuristics, brainstorm layout variations, generate responsive
breakpoints, stress-test with real content, and hand off to engineering — all from your terminal.

## What you get

**14 slash commands** that plug into your design workflow:

| Command | What it does |
|---|---|
| `/extract-tokens` | Pull design tokens from Figma into structured JSON |
| `/extract-components` | Document component specs, variants, and props |
| `/extract-relationships` | Map how components depend on each other |
| `/plan-design` | Create a build plan from a brief, wireframe, or screenshot |
| `/build-design` | Execute a plan in Figma — components, tokens, layout |
| `/brainstorm` | Generate 3-5 design variations using SCAMPER + Jobs-to-be-Done |
| `/responsive-adapt` | Desktop to tablet and mobile with content choreography |
| `/design-flow` | Design multi-screen flows (onboarding, checkout, settings) |
| `/content-stress` | Break your design with edge-case content before users do |
| `/audit-frames` | Nielsen's heuristics + Gestalt + cognitive load + token compliance |
| `/diff-system` | What changed in your design system since last extraction? |
| `/revision` | Apply feedback surgically — classifies, prioritizes, fixes |
| `/handoff-dev` | Generate developer-ready specs with exact tokens and states |
| `/handoff-mcp` | Optimize your Figma file for AI/MCP consumption |

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

Skills are installed as slash commands. Type `/extract-tokens` in Claude Code to start.

### Option B: Cursor

Cursor uses `.cursor/rules/` for custom instructions. Install design-kit skills as rule files:

```bash
# Clone into your project (or a shared location)
git clone https://github.com/nicholasgriffintn/design-kit.git ~/.design-kit

# Copy skills as Cursor rules
mkdir -p .cursor/rules
for skill in ~/.design-kit/*/SKILL.md; do
  name=$(basename $(dirname "$skill"))
  cp "$skill" ".cursor/rules/design-kit-${name}.md"
done
```

Then reference them in Cursor by asking: *"Follow the design-kit-brainstorm rules to generate variations"*
or create a `.cursorrules` file:

```
When I ask you to brainstorm, plan, build, audit, or extract design system data,
follow the instructions in .cursor/rules/design-kit-*.md files.
Use the Figma Console MCP tools to interact with Figma.
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

### First time: extract your design system

```
/extract-tokens          # pulls colors, spacing, typography, radii
/extract-components      # catalogs all components with variant keys
/extract-relationships   # maps how components compose together
```

This creates a `design-system/` directory with your tokens, component specs, and dependency graph.
It's a one-time step — the data is cached locally for all future commands.

### Design something new

```
/plan-design             # describe what you want, or paste a screenshot
/build-design            # executes the plan in Figma
```

### Explore variations

```
/brainstorm              # generates 3-5 alternative layouts from your design
/responsive-adapt        # creates tablet + mobile versions
/design-flow             # plans a multi-screen flow (onboarding, checkout)
```

### Check your work

```
/content-stress          # injects extreme content — long names, empty states, RTL
/audit-frames            # scores against Nielsen's 10, Gestalt, cognitive load
/diff-system             # what changed in the design system since last extraction?
```

### Iterate and ship

```
/revision                # apply feedback without rebuilding from scratch
/handoff-dev             # generate developer specs with exact tokens and states
```

---

## How it works

```
Brief/screenshot ──→ /brainstorm ──→ pick a direction
                         │
                    /plan-design ──→ /build-design ──→ see it in Figma
                         │                │
                    /design-flow      /responsive-adapt
                    (multi-screen)    (tablet + mobile)
                         │                │
                    /content-stress ──→ /audit-frames ──→ /revision
                    (break it)        (check it)       (fix it)
                         │
                    /handoff-dev ──→ ship to engineering
```

Skills read from and write to three local directories:

| Directory | What's in it | Created by |
|---|---|---|
| `design-system/` | Tokens, component specs, relationships | `/extract-*` skills |
| `plans/` | Structured build plans | `/plan-design`, `/brainstorm` |
| `reports/` | Audit, stress, and diff reports | `/audit-frames`, `/content-stress`, `/diff-system` |

You don't need to extract first — most skills can read directly from Figma as a
fallback. But extraction is faster for repeated use and lets you track changes over time.

---

## Staying up to date

Design Kit is actively developed. To get the latest skills and improvements:

### If you cloned globally (`~/.design-kit`)

```bash
cd ~/.design-kit && git pull && ./setup
```

### If you cloned into a project

```bash
cd design-kit && git pull && ./setup --local
```

### Automatic updates (optional)

Add a git hook or CI step to pull updates on a schedule:

```bash
# Add to your project's Makefile or package.json scripts
update-design-kit:
  cd ~/.design-kit && git pull --ff-only && ./setup
```

Or use a cron job for daily updates:

```bash
# Run once to set up (updates daily at 9am)
(crontab -l 2>/dev/null; echo "0 9 * * * cd ~/.design-kit && git pull --ff-only && ./setup") | crontab -
```

### Cursor: re-copy after updates

After pulling updates, re-run the copy step to refresh your Cursor rules:

```bash
for skill in ~/.design-kit/*/SKILL.md; do
  name=$(basename $(dirname "$skill"))
  cp "$skill" ".cursor/rules/design-kit-${name}.md"
done
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

See [PRINCIPLES.md](PRINCIPLES.md) for the full framework reference.

---

## Project structure

```
design-kit/
├── design-system/           # Extracted design system data (generated)
│   ├── tokens.json          #   Design tokens with Figma variable keys
│   ├── components/          #   Component specs (index.json + per-component)
│   └── relationships.json   #   Component dependency graph
├── plans/                   # Build plans (generated)
├── reports/                 # Audit/stress/diff reports (generated)
├── extract-tokens/          # Skills (each contains a SKILL.md)
├── extract-components/
├── extract-relationships/
├── plan-design/
├── build-design/
├── brainstorm/
├── responsive-adapt/
├── design-flow/
├── content-stress/
├── audit-frames/
├── diff-system/
├── revision/
├── handoff-dev/
├── handoff-mcp/
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
