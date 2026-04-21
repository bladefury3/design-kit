---
name: setup-all
description: |
  Run the full design system extraction pipeline in one command. Executes
  setup-tokens, setup-components, setup-relationships, setup-icons, and
  setup-product in dependency order. Skips already-extracted data.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_variables
  - mcp__figma-console__figma_get_styles
  - mcp__figma-console__figma_get_text_styles
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_get_component_for_development
  - mcp__figma-console__figma_get_component_for_development_deep
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_get_component_image
  - mcp__figma-console__figma_get_annotations
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_capture_screenshot
  - mcp__figma-console__figma_browse_tokens
  - mcp__figma-console__figma_get_token_values
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_navigate
  - mcp__figma-console__figma_get_comments
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - WebFetch
  - WebSearch
  - AskUserQuestion
  - Agent
---

# Setup All

You are a design system onboarding assistant. You run the full extraction pipeline
in one session so the designer can start creating immediately after.

**Goal**: Go from zero to a fully extracted design system in one conversation.

## Pipeline

Run these skills in order. Each step's output feeds the next.

```
Step 1: /setup-tokens         → design-system/tokens.json
Step 2: /setup-components     → design-system/components/index.json + per-component JSONs
Step 3: /setup-relationships  → design-system/relationships.json
Step 4: /setup-icons          → design-system/icons.json
Step 5: /setup-product        → design-system/product.json + content-guide.md
```

## Before you begin

1. **Confirm Figma is connected.** Use `figma_list_open_files`.
2. **Check what already exists.** Read the `design-system/` directory for existing files.

## Step 0: Inventory existing data

Check for each file:
- `design-system/tokens.json`
- `design-system/components/index.json`
- `design-system/relationships.json`
- `design-system/icons.json`
- `design-system/product.json`
- `design-system/content-guide.md`

If ALL files exist, ask:

> Your design system is already extracted. All 6 files exist.
>
> A) Re-extract everything (fresh start)
> B) Re-extract only stale data (I'll check file ages)
> C) Skip to creating — your data is ready

**STOP.** Wait for response.

If SOME files exist, list what's present and what's missing:

> Found existing data:
> - tokens.json (exists)
> - components/index.json (exists)
> - relationships.json (missing)
> - icons.json (missing)
> - product.json (missing)
>
> I'll extract only the missing files. Want me to also re-extract the existing ones?
>
> A) Extract missing only (faster)
> B) Re-extract everything (fresh)

**STOP.** Wait for response.

If NO files exist, proceed directly to Step 1.

## Step 1: Extract tokens

> **Step 1/5: Extracting design tokens...**

Read and follow `setup-tokens/SKILL.md` completely. This skill will:
- Discover all variable collections (local and library)
- Extract colors, spacing, radii, typography, shadows, opacity
- Handle multi-mode systems (light/dark)
- Output `design-system/tokens.json`

After completion, confirm:
> Tokens extracted: [N] tokens across [M] collections.

## Step 2: Extract components

> **Step 2/5: Cataloging components...**

Read and follow `setup-components/SKILL.md` completely. This skill will:
- Discover all published components
- Build the component index with variant keys
- Extract per-component specs on demand
- Output `design-system/components/index.json`

After completion, confirm:
> Components cataloged: [N] components with [M] total variants.

## Step 3: Map relationships

> **Step 3/5: Mapping component relationships...**

Read and follow `setup-relationships/SKILL.md` completely. This skill will:
- Build the dependency graph from the component index
- Classify atomic hierarchy (atoms, molecules, organisms)
- Identify composition patterns and swap groups
- Output `design-system/relationships.json`

After completion, confirm:
> Relationships mapped: [N] components, [M] containment links, [P] swap groups.

## Step 4: Catalog icons

> **Step 4/5: Cataloging icons...**

Read and follow `setup-icons/SKILL.md` completely. This skill will:
- Discover icon components (by size, naming, page location)
- Group by category and generate search tags
- Output `design-system/icons.json`

After completion, confirm:
> Icons cataloged: [N] icons across [M] categories.

## Step 5: Gather product context

> **Step 5/5: Gathering product context...**

Read and follow `setup-product/SKILL.md` completely. This skill will:
- Interview the designer about the product
- Extract from live URL (if provided)
- Research the product space
- Analyze the Figma file structure
- Output `design-system/product.json` and `design-system/content-guide.md`

This step is the most interactive — it asks questions about the product,
users, and voice. The other 4 steps are mostly automated.

## Completion

After all steps complete:

> **Design system fully extracted.**
>
> | File | Status | Summary |
> |---|---|---|
> | tokens.json | Extracted | [N] tokens, [M] modes |
> | components/index.json | Extracted | [N] components |
> | relationships.json | Extracted | [N] relationships |
> | icons.json | Extracted | [N] icons |
> | product.json | Extracted | [product name], [N] users |
> | content-guide.md | Extracted | Voice + tone patterns |
>
> You're ready to design. Try:
> - `/design [description]` — full autonomous pipeline
> - `/plan [description]` — plan a single screen
> - `/brainstorm [description]` — explore design directions

## Error handling

If any step fails:
1. Log the error and which step failed
2. Offer to skip and continue with the remaining steps
3. Note what's missing and how it affects downstream skills

Never abort the entire pipeline because one step failed. The remaining
steps can still provide value. Note degraded capabilities.

## Skipping steps

If the user explicitly asks to skip a step (e.g., "skip icons, we don't have
an icon library"), skip it and note the limitation.

If a step has no data to extract (e.g., no icon components found), log it
and proceed. Don't ask the user to provide data that doesn't exist.
