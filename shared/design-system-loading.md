# Design System Loading

Standard 3-tier fallback for loading design system data. Every skill that reads
tokens, components, or relationships MUST follow this pattern.

## Tier 1: Local JSON (fast, pre-extracted)

Read ALL of these from the project directory:

- `design-system/tokens.json` — token values and figma keys
- `design-system/components/index.json` — component catalog with figmaKey, defaultVariantKey, typicalOverrides
- `design-system/relationships.json` — component dependency graph
- `design-system/icons.json` — icon catalog with keys, categories, tags (optional)

If all files exist and contain data, proceed. This is the fastest path.

## Tier 2: Live MCP extraction (slower, always current)

If any files are missing:

> "Design system data not found locally. Let me try reading it directly from Figma..."

```
Use figma_get_design_system_kit with:
  - include: ["tokens", "components", "styles"]
  - format: "full"
```

If this returns data, use it for the session — no need to run extraction skills.

**For large design systems (500+ tokens, 100+ components):**
Use `format: "compact"` to avoid context overflow. This returns names, types,
and property definitions without variant-level visual specs.

## Tier 3: Ask user

Only if `figma_get_design_system_kit` also fails:

> "Couldn't read the design system from Figma either. I can still proceed
> using basic frames and tokens, but component matching will be limited.
> Want to proceed, or run the extraction skills first?"
>
> A) Proceed without design system data
> B) I'll run `/setup-tokens` and `/setup-components` first

**STOP.** Wait for response before continuing.

## Key resolution rules

- Every token reference must resolve to a `figmaKey` (40-char hex hash).
  Path-style keys (e.g., `color/primary`) fail silently in `setBoundVariable`.
- Every component reference must resolve to a `variantKey` (individual variant),
  NOT a `figmaKey` (component set). See `shared/tool-selection.md` for details.
- If a key is missing from the cached data, search at runtime with
  `figma_search_components` or `figma_get_variables` — don't skip the element.
