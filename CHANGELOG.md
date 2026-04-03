# Changelog

## 0.1.0 — 2026-04-03

Initial release.

### Skills (19)

**Setup** — One-time design system extraction
- `/setup-tokens` — Extract design tokens from Figma variables
- `/setup-components` — Catalog components with variant keys, props, and typicalOverrides
- `/setup-relationships` — Map component dependency graph
- `/setup-icons` — Catalog icons with search tags

**Create** — The design loop
- `/plan` — Map a brief to library components and tokens
- `/build` — Execute a plan in Figma
- `/brainstorm` — Generate design variations (SCAMPER + JTBD)
- `/flow` — Design multi-screen connected flows
- `/plan-component` — Plan a new component (duplicate check, variant matrix, props)
- `/build-component` — Build a component set in Figma from plan
- `/responsive` — Desktop to tablet + mobile adaptation

**Review** — Check and fix
- `/audit` — Score against heuristics, Gestalt, cognitive load, token compliance
- `/stress-test` — Break designs with extreme content
- `/review-component` — Score 9 component quality dimensions
- `/revise` — Apply targeted fixes from review feedback
- `/diff` — Track design system changes

**Handoff** — Ship to engineering
- `/handoff` — Developer specs with token names and interaction states
- `/handoff-ai` — Optimize Figma file for AI/MCP consumption

### Features
- Works with any Figma library via Figma Console MCP
- Token-bound builds — every color, spacing, and radius uses design system variables
- Duplicate detection — `/plan-component` searches before creating
- typicalOverrides — auto-disables icon placeholders, hint text, and other defaults
- Findings go to Figma comments — not JSON files on disk
- Designer quickstart guide in CLAUDE.md
- HTML presentation deck for team onboarding
- HTML viewer for browsing extracted design system data
- Benchmark infrastructure with rubrics and test cases for 19 skills
