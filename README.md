# Design Kit

AI-powered design system skills for product designers. Works with Figma through Claude Code and Cursor.

Extract tokens, audit designs against heuristics, brainstorm layout variations, generate responsive
breakpoints, stress-test with real content, and hand off to engineering — all from your terminal.

## What you get

**17 slash commands** that plug into your design workflow:

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
| `/plan-component` | Plan a new component — variants, props, tokens, anatomy |
| `/build-component` | Build a component set in Figma from a plan |
| `/review-component` | Score component quality across 9 dimensions |
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
*"Use design-kit-plan-design to plan a settings page"*

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

### Build a new component

```
/plan-component          # plan variants, props, tokens, anatomy
/build-component         # create the component set in Figma
/review-component        # score quality across 9 dimensions
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

Need a new component?
/plan-component ──→ /build-component ──→ /review-component
(plan variants)    (build in Figma)    (score quality)
```

Skills read from and write to three local directories:

| Directory | What's in it | Created by |
|---|---|---|
| `design-system/` | Tokens, component specs, relationships | `/extract-*` skills, `/build-component` |
| `plans/` | Screen + component build plans | `/plan-design`, `/brainstorm`, `/plan-component` |
| `reports/` | Audit, stress, diff, and review reports | `/audit-frames`, `/content-stress`, `/diff-system`, `/review-component` |

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
  + new  /design-review
  ~ updated  /audit-frames
  ~ updated  /brainstorm
  ~ updated  PRINCIPLES.md

→ Installing 15 skills...
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

## Project structure

```
design-kit/
├── design-system/           # Extracted design system data (generated)
│   ├── tokens.json          #   Design tokens with Figma variable keys
│   ├── components/          #   Component specs (index.json + per-component)
│   └── relationships.json   #   Component dependency graph
├── plans/                   # Build plans (generated)
│   └── components/          #   Component plans (from plan-component)
├── reports/                 # Audit/stress/diff/review reports (generated)
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
├── plan-component/
├── build-component/
├── review-component/
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
