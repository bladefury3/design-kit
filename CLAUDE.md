# Design Kit

Design system documentation skills for Claude Code. Works with Figma Console MCP to
extract, audit, and optimize design systems.

## Commands

```bash
./setup              # Install skills to ~/.claude/commands/
./setup --local      # Install to .claude/commands/ in current project
```

## Project Structure

```
design-kit/
├── design-system/                # Extracted design system data (output of setup-* skills)
│   ├── tokens.json               #   Design tokens with Figma variable keys
│   ├── icons.json                #   Icon catalog with keys, categories, and tags
│   ├── components/               #   Component specs
│   │   ├── index.json            #     Component catalog (figmaKey, defaultVariantKey)
│   │   └── <name>.json           #     On-demand per-component specs
│   └── relationships.json        #   Component dependency graph
├── plans/                        # Build plans (output of /plan)
│   └── <name>.json               #   Structured plan for /build to execute
├── reports/                      # QA artifacts (output of audit/stress/diff skills)
│   ├── audit-report.json         #   Design system compliance audit
│   ├── stress-report.json        #   Content stress test results
│   └── diff-report.json          #   Design system diff report
│
│── ── Phase 1: Setup ─────────────────────────────────────────────────
├── setup-tokens/                 # Catalog your design tokens from Figma
├── setup-components/             # Catalog your components with variants and props
├── setup-relationships/          # Map how components depend on each other
├── setup-icons/                  # Catalog icons with search tags
│
│── ── Phase 2: Create ────────────────────────────────────────────────
├── brainstorm/                   # Generate design variations (SCAMPER + JTBD)
├── plan/                         # Plan a screen — map brief to components + tokens
├── build/                        # Execute a plan in Figma
├── plan-component/               # Plan a new component (variants, props, tokens)
├── build-component/              # Build a component set in Figma from plan
├── flow/                         # Design multi-screen connected flows
├── responsive/                   # Desktop to tablet + mobile adaptation
│
│── ── Phase 3: Review ────────────────────────────────────────────────
├── audit/                        # Check designs against heuristics + tokens + Gestalt
├── stress-test/                  # Break designs with edge-case content
├── review-component/             # Score component quality (9 dimensions)
├── revise/                       # Fix designs based on feedback
├── diff/                         # What changed in the design system?
│
│── ── Phase 4: Handoff ───────────────────────────────────────────────
├── handoff/                      # Developer-ready specs with tokens and states
├── handoff-ai/                   # Optimize Figma file for AI/MCP consumption
│
│── ── Internal ───────────────────────────────────────────────────────
├── eval-skills/                  # Benchmark skill quality over time
├── setup                         # Installation script
├── CLAUDE.md                     # This file
├── ETHOS.md                      # Design philosophy
├── PRINCIPLES.md                 # Shared design principles (Nielsen, Gestalt, SCAMPER, etc.)
└── VERSION                       # Current version
```

## Designer Workflow

Skills are organized into 4 phases. You don't need them all — start where you are.

```
Phase 1: SETUP (one-time — catalog what you have)
  /setup-tokens → /setup-components → /setup-relationships → /setup-icons

Phase 2: CREATE (the design loop)
  /brainstorm ──→ pick a direction
       │
  /plan ──→ /build ──→ see it in Figma
       │         │
  /flow       /responsive
  (multi-screen)  (tablet + mobile)

Phase 3: REVIEW (check and fix)
  /stress-test ──→ /audit ──→ /revise
  (break it)      (check it)   (fix it)

Phase 4: HANDOFF (ship to engineering)
  /handoff ──→ done

Need a new component?
  /plan-component ──→ /build-component ──→ /review-component
```

### First time? Start here:
1. Open your Figma file with the Desktop Bridge plugin running
2. Run `/setup-tokens` → `/setup-components` → `/setup-relationships` → `/setup-icons`
3. Now use any skill — your design system data is cached locally

### Already have design-system/ data?
Jump straight to `/plan`, `/brainstorm`, or `/audit`.

### No design system data yet?
Most skills will fall back to `figma_get_design_system_kit` to read directly
from Figma. Extraction is faster for repeated use, but not required for a first try.

## Skill format

Each skill is a directory containing a `SKILL.md` file. Skills are registered with
Claude Code via the setup script and invoked as slash commands (e.g., `/setup-tokens`).

### Writing skills

- Use designer-friendly language — not engineering jargon
- Skills interact with Figma via `figma-console` MCP tools
- Always validate with screenshots after making changes
- Output structured JSON following W3C Design Tokens format where applicable
- Ask the user before making assumptions about their design system
- Skills should degrade gracefully without pre-extracted data — use
  `figma_get_design_system_kit` as a fallback before telling the user to
  run extraction skills

## Figma MCP interaction

Skills use these MCP tool groups:
- **Variables**: `figma_get_variables`, `figma_get_token_values`, `figma_browse_tokens`
- **Components**: `figma_get_component`, `figma_search_components`, `figma_get_library_components`
- **Styles**: `figma_get_styles`
- **Design system**: `figma_get_design_system_summary`, `figma_get_design_system_kit`
- **File data**: `figma_get_file_data`, `figma_get_selection`
- **Screenshots**: `figma_take_screenshot`, `figma_capture_screenshot`

## Output formats

### design-system/tokens.json
Follows [W3C Design Tokens](https://design-tokens.github.io/community-group/format/) format:
```json
{
  "color": {
    "primary": {
      "$value": "#6366f1",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

### design-system/components/<name>.json
Per-component spec files:
```json
{
  "$schema": "design-kit/component/v1",
  "name": "Button",
  "tokens": ["color.primary", "spacing.md"],
  "variants": [...],
  "props": [...]
}
```

### design-system/relationships.json
Component dependency graph:
```json
{
  "$schema": "design-kit/relationships/v1",
  "components": {
    "Card": {
      "contains": ["Button", "Avatar", "Text"],
      "usedIn": ["Feed", "Profile"]
    }
  }
}
```

## Commit style

One logical change per commit. Separate renames from behavior changes.
