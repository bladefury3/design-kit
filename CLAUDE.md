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
├── design-system/                # Extracted design system data (output of extract-* skills)
│   ├── tokens.json               #   Design tokens with Figma variable keys
│   ├── components/               #   Component specs
│   │   ├── index.json            #     Component catalog (figmaKey, defaultVariantKey)
│   │   └── <name>.json           #     On-demand per-component specs
│   └── relationships.json        #   Component dependency graph
├── plans/                        # Build plans (output of plan-design)
│   └── <name>.json               #   Structured plan for build-design to execute
├── reports/                      # QA artifacts (output of audit/stress/diff skills)
│   ├── audit-report.json         #   Design system compliance audit
│   ├── stress-report.json        #   Content stress test results
│   └── diff-report.json          #   Design system diff report
├── extract-tokens/               # Skill: extract design tokens
├── extract-components/           # Skill: extract component specs
├── extract-relationships/        # Skill: map component relationships
├── plan-design/                  # Skill: plan a design (spec, no Figma changes)
├── build-design/                 # Skill: execute a plan in Figma
├── brainstorm/                   # Skill: generate design variations (SCAMPER + JTBD)
├── responsive-adapt/             # Skill: desktop → tablet → mobile adaptation
├── design-flow/                  # Skill: multi-screen connected flow design
├── design-revision/              # Skill: revise from Figma comments or direct feedback
├── audit-frames/                 # Skill: audit frames (heuristics + tokens + Gestalt)
├── diff-system/                  # Skill: diff current Figma vs extracted data
├── content-stress/               # Skill: stress-test with edge-case content
├── plan-component/               # Skill: plan a new component (variants, props, tokens)
├── build-component/              # Skill: build a component set in Figma from plan
├── review-component/             # Skill: score component quality (9 dimensions)
├── handoff-dev/                  # Skill: developer handoff documentation
├── handoff-mcp/                  # Skill: optimize Figma file for MCP consumption
├── setup                         # Installation script
├── CLAUDE.md                     # This file
├── ETHOS.md                      # Design philosophy
├── PRINCIPLES.md                 # Shared design principles (Nielsen, Gestalt, SCAMPER, etc.)
└── VERSION                       # Current version
```

## Designer Workflow

Skills follow a natural design process. You don't need to use them all — start where you are.

```
Brief/screenshot ──→ /brainstorm ──→ pick a direction
                         │
                    /plan-design ──→ /build-design ──→ see it in Figma
                         │                │
                    /design-flow      /responsive-adapt
                    (multi-screen)    (tablet + mobile)
                         │                │
                    /content-stress ──→ /audit-frames ──→ /design-revision
                    (break it)        (check it)       (fix it)
                         │
                    /handoff-dev ──→ ship to engineering

Need a new component?
/plan-component ──→ /build-component ──→ /review-component
(plan variants)    (build in Figma)    (score quality)
```

### First time? Start here:
1. Open your Figma file with the Desktop Bridge plugin running
2. Run `/extract-tokens` → `/extract-components` → `/extract-relationships`
3. Now use any skill — your design system data is cached locally

### Already have design-system/ data?
Jump straight to `/plan-design`, `/brainstorm`, or `/audit-frames`.

### No design system data yet?
Most skills will fall back to `figma_get_design_system_kit` to read directly
from Figma. Extraction is faster for repeated use, but not required for a first try.

## Skill format

Each skill is a directory containing a `SKILL.md` file. Skills are registered with
Claude Code via the setup script and invoked as slash commands (e.g., `/extract-tokens`).

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
