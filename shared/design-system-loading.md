# Design System Loading

Standard fallback for loading design system data. Every skill that reads
tokens, components, or relationships MUST follow this pattern.

## Tier 0: Product Context (loaded first, informs everything)

Read these from the project directory:

- `design-system/product.json` — product identity, users, IA, terminology, layout conventions
- `design-system/content-guide.md` — voice, tone, content patterns, error/empty state formulas
- `design-system/layout-patterns.json` — common page archetypes for pattern matching
- `design-system/decisions.md` — append-only log of prior design decisions (see `shared/decision-capture.md`)

If `product.json` exists, use it to:
- Pre-fill terminology (use product vocabulary, not generic labels)
- Match briefs to layout archetypes (from layout-patterns.json)
- Apply layout conventions for the page type being designed
- Use the correct navigation pattern and IA structure
- Skip clarifying questions that the product context already answers

If these files are missing, proceed — they are optional enrichment. Suggest
running `/setup-product` if the user would benefit from persistent product context.

If `decisions.md` exists, scan it before making any choice that the log might
already cover. Cite the prior decision when applying it; cite + override when
deviating. Skills that make new meaningful decisions append per
`shared/decision-capture.md`.

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

## Mode switching (light/dark)

When the user requests a dark mode build (or any non-default mode), apply variable
modes to the top-level build frame. All child library component instances will
automatically inherit the mode.

### How to apply modes

1. **Read `$metadata.modeCollections`** from `design-system/tokens.json`. This maps
   collection names → `{ collectionId, modes: { modeName → modeId } }`.

2. **For each collection**, get the collection object by ID, then call
   `setExplicitVariableModeForCollection()` on the parent frame:

```javascript
// Run via figma_execute
const frame = await figma.getNodeByIdAsync('<frameId>');

// From tokens.json $metadata.modeCollections
const modeCollections = {
  "1. Color modes": {
    "collectionId": "VariableCollectionId:5256:1315",
    "modes": { "Light mode": "5256:0", "Dark mode": "5256:1" }
  },
  "2. Radius": {
    "collectionId": "VariableCollectionId:6298:3",
    "modes": { "Default": "6298:3" }
  }
  // ... other collections
};

for (const [collName, collData] of Object.entries(modeCollections)) {
  const targetModeId = collData.modes["Dark mode"] || collData.modes["Default"];
  if (!targetModeId) continue;

  // Get the collection object by its stored ID
  const collection = await figma.variables.getVariableCollectionByIdAsync(collData.collectionId);
  if (collection) {
    frame.setExplicitVariableModeForCollection(collection, targetModeId);
  }
}
```

### Important notes

- **Pass collection objects, not string IDs** — `setExplicitVariableModeForCollection`
  requires a `VariableCollection` node (from `getVariableCollectionByIdAsync`), not a
  string collection ID. This is required when using `documentAccess: "dynamic-page"`.
- **Set modes on the parent frame** — child instances inherit. You don't need to set
  modes on every individual component instance.
- **All collections need modes set** — even collections with only a "Default" mode should
  have their mode explicitly set for consistency. Library components check all collections.
- **If `modeCollections` is missing from tokens.json**, discover modes at runtime by
  reading `resolvedVariableModes` from an existing frame that uses the desired mode, or
  by iterating collections via `figma_execute`.

### When modes are not in tokens.json

If `$metadata.modeCollections` doesn't exist (older extraction), fall back to runtime
discovery:

```javascript
// Read resolved modes from a reference frame that's already in the desired mode
const refFrame = await figma.getNodeByIdAsync('<reference-frame-id>');
const resolvedModes = refFrame.resolvedVariableModes;
// resolvedModes is an array of [collectionId, modeId] pairs

for (const [collId, modeId] of resolvedModes) {
  const collection = await figma.variables.getVariableCollectionByIdAsync(collId);
  if (collection) {
    targetFrame.setExplicitVariableModeForCollection(collection, modeId);
  }
}
```

Then suggest running `/setup-tokens` to re-extract with mode data for future builds.

## Key resolution rules

- Every token reference must resolve to a `figmaKey` (40-char hex hash).
  Path-style keys (e.g., `color/primary`) fail silently in `setBoundVariable`.
- Every component reference must resolve to a `variantKey` (individual variant),
  NOT a `figmaKey` (component set). See `shared/tool-selection.md` for details.
- If a key is missing from the cached data, search at runtime with
  `figma_search_components` or `figma_get_variables` — don't skip the element.
