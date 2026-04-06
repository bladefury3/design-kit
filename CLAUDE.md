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
├── plans/                        # Build plans (output of /plan, /brainstorm, /flow)
│   ├── <feature>/                #   One folder per feature/flow
│   │   ├── plan.md               #     Human-readable: IA, hierarchy, components, edge cases
│   │   ├── build.json            #     Machine-readable: pre-resolved keys for /build
│   │   └── screens/              #     Per-screen build JSONs (for multi-screen flows)
│   │       └── 01-<screen>.json  #       One build JSON per screen (avoids context overload)
│   └── components/               #   Component plans (separate lifecycle)
│       └── <component>.md        #     Variant matrix, props, anatomy
├── build-helpers/                # Reusable Figma plugin API helpers
│   └── figma-helpers.js          #   mkFrame, mkText, sweepText, canvasScan, etc.
├── reports/                      # (deprecated — QA findings go to Figma comments)
│   └── ...                       #   Audit/stress/diff results are presented inline
│                                 #   and posted as Figma comments, not saved as JSON
│
│── ── Phase 1: Setup ─────────────────────────────────────────────────
├── setup-tokens/                 # Catalog your design tokens from Figma
├── setup-components/             # Catalog your components with variants and props
├── setup-relationships/          # Map how components depend on each other
├── setup-icons/                  # Catalog icons with search tags
│
│── ── Phase 1.5: Capture ──────────────────────────────────────────────
├── capture/                      # Capture a live URL → raw + mapped Figma builds
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

## Quick Start for Designers

### What is this?

Design Kit gives you slash commands in Claude Code that talk directly to your
Figma file. You describe what you want in plain English, and it builds, audits,
and documents your designs — all without leaving the conversation.

### Prerequisites

1. **Claude Code** — installed and running ([claude.ai/code](https://claude.ai/code))
2. **Figma Desktop** — with the [Figma Console MCP](https://github.com/nichochar/figma-console-mcp) plugin running
3. **This repo** — cloned and skills installed via `./setup`

### Your first 5 minutes

```
Step 1:  Open your Figma file. Run the Desktop Bridge plugin.
Step 2:  In Claude Code, run /setup-tokens
         → This reads your colors, spacing, radii from Figma and caches them.
Step 3:  Run /setup-components
         → This catalogs every component in your library with variant keys.
Step 4:  You're ready. Try any skill below.
```

### What can I do?

**Setup (one-time)**

| I want to... | Run this | What happens |
|---|---|---|
| **Catalog my design tokens** | `/setup-tokens` | Reads colors, spacing, radii, typography from Figma → `design-system/tokens.json` |
| **Catalog my components** | `/setup-components` | Reads every component with variant keys, props, overrides → `design-system/components/` |
| **Map component relationships** | `/setup-relationships` | Builds dependency graph → `design-system/relationships.json` |
| **Catalog icons** | `/setup-icons` | Maps icon names to keys with search tags → `design-system/icons.json` |

**Capture**

| I want to... | Run this | What happens |
|---|---|---|
| **Bring a live page into Figma** | `/capture` | Give a URL → raw replica + design-system-mapped version side by side |

**Create**

| I want to... | Run this | What happens |
|---|---|---|
| **Design a new screen** | `/plan` then `/build` | Describe the screen → get a plan → build it in Figma with library components |
| **Design a multi-screen flow** | `/flow` | Describe the user journey → get connected screens with flow annotations |
| **Explore design variations** | `/brainstorm` | Get 3-5 layout variations using SCAMPER + Jobs-to-be-Done |
| **Create a new component** | `/plan-component` then `/build-component` | Define variants, props, tokens → build as a component set |
| **Generate responsive variants** | `/responsive` | Convert a desktop design to tablet + mobile breakpoints |

**Review**

| I want to... | Run this | What happens |
|---|---|---|
| **Check my design quality** | `/audit` | Score against Nielsen heuristics, Gestalt, cognitive load, token compliance |
| **Break-test with extreme content** | `/stress-test` | Inject long names, huge numbers, empty states to find what breaks |
| **Review a component** | `/review-component` | Score 9 quality dimensions: variants, tokens, accessibility, naming |
| **Fix issues from review** | `/revise` | Apply targeted fixes without rebuilding from scratch |
| **Track design system changes** | `/diff` | Compare current Figma state against your last extraction |

**Handoff**

| I want to... | Run this | What happens |
|---|---|---|
| **Prepare for dev handoff** | `/handoff` | Add token specs, interaction states, and implementation notes to Figma |
| **Optimize for AI tools** | `/handoff-ai` | Enrich descriptions, standardize naming for MCP/AI consumption |

### Common workflows

**"I need to bring our production app into Figma"**
```
/capture https://app.company.com/settings
→ raw replica built (exact CSS values, no tokens)
→ mapped version built (your components + tokens)
→ both side by side on canvas for comparison
```

**"I need to design a settings page"**
```
/plan settings page with sidebar navigation, account section, notification preferences
→ review the plan → approve
/build
→ see it in Figma
/audit
→ check quality, get a score
```

**"I need a user flow from signup to dashboard"**
```
/flow user signs up, verifies email, completes onboarding, lands on dashboard
→ review the flow map → approve
→ 5 connected screens built in Figma with flow annotations
/stress-test
→ test each screen with extreme content
```

**"I need a new Toast component"**
```
/plan-component toast notification with success, error, warning types
→ duplicate check runs automatically
→ review variant matrix → approve
/build-component
→ component set appears in Figma with all variants
/review-component
→ 9-dimension quality score
```

**"Is my design ready to ship?"**
```
/audit                    → design system compliance check
/stress-test              → content edge cases
/handoff                  → developer specs with token names and states
```

**"I just want to check what I have"**
```
/diff                     → what changed since last extraction
/review-component         → how good is this component
```

### Tips

- **You don't need setup to try a skill.** Most skills fall back to reading
  directly from Figma. But extraction (`/setup-tokens` + `/setup-components`)
  makes everything faster and more accurate.
- **Skills ask before acting.** You'll get options (A/B/C) at each decision
  point. No surprises.
- **Duplicate detection is automatic.** When you run `/plan-component`, it
  searches your library for existing components that might already do the job.
  It won't let you create duplicates.
- **Findings go to Figma comments.** Audit results, stress test failures, and
  review scores are posted as comments on your Figma frames — not buried in
  JSON files.
- **Everything is token-bound.** Skills use your design system tokens for
  every color, spacing, and radius. No hardcoded values.
- **Component defaults are smart.** After running `/setup-components`, the
  component index includes `typicalOverrides` — boolean properties that get
  automatically disabled when building (e.g., icon placeholders on buttons,
  hint text on inputs).
- **Plans are human-readable markdown.** When you run `/plan`, it creates a
  `plans/<feature>/plan.md` you can open, read, and share with your team.
  Screen details are in `plans/<feature>/screens/`. No JSON or hash keys.
- **You can skip `/plan-component` for simple components.** Describe what you
  want directly to `/build-component` if you know the structure. The plan step
  is most valuable for complex components where duplicate detection and variant
  architecture matter.

### Troubleshooting

| Problem | Fix |
|---|---|
| "Figma is not connected" | Open Figma Desktop → Plugins → Development → Figma Desktop Bridge → Run |
| Skills not found as `/commands` | Run `./setup` from the design-kit directory. Restart Claude Code. |
| Token binding fails silently | Run `/setup-tokens` to refresh — keys may be stale from a library update |
| Component search returns nothing | Run `/setup-components` — the component index may not exist yet |
| Build uses wrong variant (Mobile, Banner) | The component index needs `recommendedDesktopKey`. Re-run `/setup-components`. |
| Buttons show circle icon placeholders | The component index needs `typicalOverrides`. Re-run `/setup-components`. |
| Arrange destroys my component | Known issue with `figma_arrange_component_set`. Build props/description AFTER arranging, not before. |

## Skill Phases

Skills are organized into 4 phases. You don't need them all — start where you are.

```
Phase 1: SETUP (one-time — catalog what you have)
  /setup-tokens → /setup-components → /setup-relationships → /setup-icons

CAPTURE (bring existing pages into Figma)
  /capture URL ──→ raw replica + mapped version (side by side)

Phase 2: CREATE (the design loop — spec-driven)
  /brainstorm ──→ pick a direction
       │
  /plan ──→ /build ──→ see it in Figma
       │     │    │
       │     │    ├── Phase 1: MANIFEST (parse build.json → flat task checklist)
       │     │    ├── Phase 2: SCAFFOLD (empty frame structure)
       │     │    ├── Phase 3: COMPONENTS (instantiate ALL library components)
       │     │    ├── Phase 4: TOKEN-BUILT (fill gaps with frames/text)
       │     │    └── Phase 5: VALIDATE (coverage, text, tokens, visual)
       │     │
  /flow       /responsive
  (multi-screen)  (tablet + mobile)

  Build pipeline (inspired by github/spec-kit):
    /plan creates build.json with a "manifest" — a flat list of every
    component, icon, and token-built element with pre-resolved keys.
    /build reads the manifest and executes it as ordered tasks:
    components first, then token-built, then validate.
    See build-helpers/build-phases.md and build-helpers/tasks-template.md.

Phase 3: REVIEW (check and fix)
  /stress-test ──→ /audit ──→ /revise
  (break it)      (check it)   (fix it)

Phase 4: HANDOFF (ship to engineering)
  /handoff ──→ done

Need a new component?
  /plan-component ──→ /build-component ──→ /review-component
```

---

## For Skill Developers

Everything below is for people writing or modifying skills, not for designers using them.

## Skill format

Each skill is a directory containing a `SKILL.md` file. Skills are registered with
Claude Code via the setup script and invoked as slash commands (e.g., `/setup-tokens`).

### Writing skills

- Use designer-friendly language — not engineering jargon
- Skills interact with Figma via `figma-console` MCP tools
- Always validate with screenshots after making changes
- Plans output as human-readable markdown (see PRINCIPLES.md "Plan Format & Folder Structure")
- Design-system extraction outputs structured JSON following W3C Design Tokens format
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
