---
name: setup-components
description: |
  Extract component specifications from a Figma file into individual JSON files.
  Documents variants, props, token usage, anatomy, and usage guidelines for each
  component. Use after setup-tokens to build the component layer of your
  design system documentation.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_component
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_get_component_for_development
  - mcp__figma-console__figma_get_component_for_development_deep
  - mcp__figma-console__figma_get_component_image
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_generate_component_doc
  - mcp__figma-console__figma_get_design_system_summary
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_get_variables
  - mcp__figma-console__figma_get_styles
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_capture_screenshot
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_get_annotations
  - mcp__figma-console__figma_audit_component_accessibility
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Extract Components

You are a design system specialist. Your job is to extract detailed component
specifications from the user's Figma file and produce individual JSON spec files
for each component.

## Before you begin

1. Confirm Figma is connected by checking open files.

2. Check if `design-system/tokens.json` exists in the working directory. If yes, load it — you'll
   reference token names in component specs AND use the `$extensions.figma.key` values
   for direct variable lookups via `figma.variables.importVariableByKeyAsync(key)`
   instead of scanning collections.

3. **Ask the user where components live.** This is the critical question:

> "Where are the components I should extract?
>
> **A) This file** — Components are defined locally in the current Figma file
> **B) An attached library** — Components come from a separate library file
>    → If so, what's the library file URL? (e.g., `https://www.figma.com/design/ABC123/My-Library`)
> **C) Multiple sources** — Some local, some from libraries
>
> If you're not sure, I can check what's in this file and what libraries are attached."

**Why the file URL matters:** The MCP tools can read component data from ANY Figma
file via REST API — but they need the file URL or key. Unlike variables (which have
a plugin API for library discovery), components can ONLY be discovered from library
files via REST API tools like `figma_get_design_system_kit` and
`figma_get_library_components`. Without the library file URL, you're limited to
navigating to the file or reverse-discovering from instances.

4. Ask the user about scope:

> "Which components should I extract?
>
> **A) Everything** — All published components
> **B) Specific categories** — e.g., just Inputs, or just Navigation
> **C) Search** — Components matching a name pattern"

## Step 1: Discover components

The goal is to build a **complete key map** — component name → Figma component key
(hash) — so all downstream skills can instantiate via `figma_instantiate_component`
without searching. Use whichever strategy works, in priority order.

### Strategy 1: `figma_get_design_system_kit` (best — single call, gets everything)

If the user provided a library file URL/key, this is the fastest path:

```
Use figma_get_design_system_kit with:
  - fileKey: "<library file key from URL>"
  - format: "full" (or "compact" for large libraries)
  - include: ["components"]
  - includeImages: true (for visual reference)
```

This returns ALL components with variant definitions, visual specs, property
definitions, and rendered screenshots in one call. Extract the component keys
from the response.

If the components are local (in the current file), call without a fileKey —
it uses the currently open file.

### Strategy 2: `figma_get_library_components` (good — with variant keys)

If Strategy 1 fails or you need variant-level keys:

```
Use figma_get_library_components with:
  - libraryFileUrl: "<library file URL>" OR libraryFileKey: "<key>"
  - includeVariants: true
  - limit: 100
```

This returns component sets with a `variants` array containing individual variant
keys. **Use variant keys (type: COMPONENT) for `figma_instantiate_component`, NOT
component set keys (type: COMPONENT_SET).**

### Strategy 3: `figma_search_components` (good — for specific components)

Search by name in local file or library:

```
Use figma_search_components with:
  - query: "Button" (or empty for all)
  - libraryFileKey: "<key>" (for library search)
  - limit: 25
```

### Strategy 4: `figma_execute` local discovery (for current file only)

When components are defined in the current file:

```javascript
// Run via figma_execute — discovers all local components with keys
const allComponents = figma.root.findAll(n =>
  n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
);

return allComponents.map(c => ({
  name: c.name,
  type: c.type,
  id: c.id,
  key: c.key,  // CRITICAL: hash key for instantiation
  description: c.description || '',
  ...(c.type === 'COMPONENT_SET' ? {
    variants: c.children.map(v => ({
      name: v.name,
      id: v.id,
      key: v.key,  // Variant key for figma_instantiate_component
      properties: Object.fromEntries(
        v.name.split(', ').map(p => p.split('='))
      )
    }))
  } : {})
}));
```

### Strategy 5: Navigate to library file (when REST API is blocked)

If the library is a copy/draft and REST returns 404:

> "The library isn't accessible via API (it may be a copy or unpublished).
> Could you open the library file in Figma and run the Desktop Bridge plugin?
> I'll switch to it, discover all components, then switch back.
> This is a one-time operation — the keys are saved for all future use."

```
Use figma_navigate to switch to the library file URL.
Run figma_execute discovery (Strategy 4) inside the library file.
Use figma_navigate to switch back.
```

### Strategy 6: Reverse-discover from instances (last resort)

If the user can't open the library file, discover keys from existing instances
on the canvas:

```javascript
// Run via figma_execute — discover keys from placed instances
const instances = figma.currentPage.findAll(n => n.type === 'INSTANCE');
const discovered = {};

for (const inst of instances) {
  const main = await inst.getMainComponentAsync();
  if (!main) continue;
  const parent = main.parent;
  const setName = parent?.type === 'COMPONENT_SET' ? parent.name : main.name;

  if (!discovered[setName]) {
    discovered[setName] = {
      name: setName,
      componentSetKey: parent?.type === 'COMPONENT_SET' ? parent.key : null,
      variants: {}
    };
  }

  discovered[setName].variants[main.name] = {
    key: main.key,
    nodeId: main.id
  };
}

return Object.values(discovered);
```

> "I can discover keys from component instances on the canvas.
> Could you drag a few components from the library onto the page?
> I'll extract their keys and you can delete them afterward."

### Strategy priority and when REST API fails

The REST API tools (`figma_get_design_system_kit`, `figma_get_library_components`,
`figma_get_file_data`) require the library file to be accessible to the API token.
They return 404 when:
- The file is a **duplicate/copy** (not the original published library)
- The file is **not shared** with the API token's account
- The file is a **draft** that hasn't been published

When REST fails, you MUST fall back to Strategy 5 or 6. Always tell the user
why the fallback is needed.

| Situation | Strategy | MCP Calls |
|---|---|---|
| User provided library URL + REST works | 1: design_system_kit | 1 call |
| Need variant-level keys | 2: library_components | 1 call |
| Searching for specific components | 3: search_components | 1 call |
| Components in current file | 4: figma_execute local | 1 call |
| REST blocked (copy/draft) | 5: Navigate to file | 2-3 calls |
| Can't open library file | 6: Reverse from instances | 1 call + user action |

Present a summary:
> "Found **24 components** across 4 categories. I'll build `design-system/components/index.json`
> with keys for all of them — this is the catalog that all other skills reference.
>
> - **Inputs** (7): Button, TextField, Select, Checkbox, Radio, Toggle, Slider
> - **Navigation** (5): Tabs, Breadcrumb, Sidebar, Navbar, Pagination
> - **Feedback** (4): Alert, Toast, Badge, Tooltip, Progress
> - **Layout** (8): Card, Divider, Avatar, Modal, Drawer, Accordion, Table
>
> Individual component JSONs (full variant keys, props, anatomy) are built
> **on-demand** — the first time you or another skill works with a specific
> component, I'll extract its full spec and save it for future use."

## Step 2: Build `design-system/components/index.json` (the catalog)

The index is the **primary output** of this skill. It contains every component's
name, description, category, figmaKey, and defaultVariantKey — enough for any
downstream skill to instantiate components without searching.

Build the index from the discovery data in Step 1. For each component set, capture:
- `name` — component name
- `file` — path to individual JSON (e.g., `design-system/components/button.json`) — may not exist yet
- `category` — category/group
- `description` — short description
- `figmaKey` — component set key (40-char hex hash, e.g., `aa53b4bdab230880d4c65891a3ef1a8f02320d35`)
- `defaultVariantKey` — key of the default variant (40-char hex hash) for `figma_instantiate_component`

**CRITICAL: Key format must be 40-char hex hashes, NOT nodeId format.**

NodeId-format keys (e.g., `3287:427074`) are session-specific and only work within
the file where they were extracted. They go stale when Figma restarts and fail
when used from a different file (e.g., a product file instantiating from a library).

40-char hex keys (e.g., `aa53b4bdab230880d4c65891a3ef1a8f02320d35`) are permanent
and work cross-file via `figma_instantiate_component`.

**How to get hex keys:**
- `figma_get_library_components` with `includeVariants: true` → returns hex keys
- `figma_search_components` with `libraryFileKey` → returns hex keys
- `figma_execute` with `component.key` → returns hex keys (Plugin API)
- `figma_get_design_system_kit` → may return nodeId format — if so, re-query with
  `figma_search_components` using the component name + `libraryFileKey` to get hex keys
- `recommendedDesktopKey` — key of simplest Desktop variant (prefer Simple/Default over Banner/Chart)
- `variantClassification` — variants grouped by breakpoint (Desktop vs Mobile)
- `typicalOverrides` — boolean properties usually turned OFF in practice
- `hasPlaceholderContent` — whether the component ships with domain-specific sample data
- `variantCount` — how many variants exist
- `status` — published/draft

Write `design-system/components/index.json`. This is the one file that MUST be produced. Everything
else is on-demand.

Each entry in the index should include the variant intelligence fields:

```json
{
  "name": "Page header",
  "figmaKey": "abc123...",
  "defaultVariantKey": "def456...",
  "recommendedDesktopKey": "<key of simplest Desktop variant — prefer Simple/Default over Banner/Chart>",
  "variantClassification": {
    "Desktop": ["Simple", "Avatar", "Banner simple"],
    "Mobile": ["Simple", "Avatar", "Banner simple"]
  },
  "typicalOverrides": {
    "Search": false,
    "Actions": false
  },
  "hasPlaceholderContent": true
}
```

### Variant Intelligence (mandatory)

For EACH component set with multiple variants, classify the variants and pick
the recommended Desktop key. This prevents downstream skills from using wrong
variants (e.g., Mobile sidebar, Banner page header, Open dropdown).

**Classification rules:**
1. **Split by breakpoint**: Group variants into Desktop vs Mobile
2. **Rank by complexity**: Within Desktop variants, rank from simplest to most complex
   - Prefer: `Simple`, `Default`, `Placeholder` styles
   - Avoid as default: `Banner`, `Chart`, `Open`, `Avatar leading`
3. **Set `recommendedDesktopKey`**: The simplest Desktop variant that would work
   for a generic use case
4. **Document typical overrides**: For each component, note which boolean properties
   are usually turned OFF in practice:
   - Page header: `Search=false`, `Actions=false` (most pages don't need these)
   - Section header: `Tabs=False`, `Actions=false`, `Dropdown icon=false`
   - Input dropdown: `Hint text=false`, `Supporting text=false`
   - Metric item: `Actions=False`, `Dropdown icon=false`
   - Button: `Icon leading=false`, `Icon trailing=false`
   - Textarea: `Destructive=False`, `Hint text=false`
5. **Flag placeholder content**: Set `hasPlaceholderContent: true` if the component
   ships with domain-specific sample data (e.g., "Team members", "Marketing site
   redesign", "Olivia Rhye", "Product Designer"). Downstream skills use this flag
   to know a text sweep is required after instantiation.

**How to discover variants:**
```javascript
// Import any variant, then walk the component set
const comp = await figma.importComponentByKeyAsync('<any_variant_key>');
const parent = comp.parent;
if (parent?.type === 'COMPONENT_SET') {
  for (const child of parent.children) {
    // child.name = "Style=Simple, Breakpoint=Desktop"
    // child.key = "a5d7e41..."
  }
}
```

This is a one-time cost during extraction that saves repeated debugging during
every build session. Without this, `/plan` and `/build` default to `defaultVariantKey`
which is frequently a Mobile or complex variant.

## Step 3: On-demand deep extraction (per component)

Individual component JSONs are built **the first time a component is needed**,
not upfront for the entire library. This avoids extracting 100+ components that
may never be used.

### When to extract a full component JSON

A downstream skill (or the user) triggers extraction when:
- `/lofi-to-hifi` needs to instantiate a specific variant (not just the default)
- `/handoff` needs full props, anatomy, and token usage for documentation
- `/audit` needs to check token compliance for a specific component
- The user asks to "extract Button" or "show me the Card component spec"

### The on-demand extraction flow

1. Check if `design-system/components/<name>.json` exists
   - If yes → read it and use it (zero MCP calls)
   - If no → extract it now (Steps 3a/3b below), write the JSON, then use it
2. **Every extraction pays for itself twice** — first use extracts + acts,
   every future use just reads the cached JSON

### 3a. Extract keys and structure via figma_execute (for current file components)

Prefer `figma_execute` for extracting keys and structural data (faster, captures keys),
then use MCP tools for enrichment (descriptions, images, annotations):

### 2a. Extract keys and structure via figma_execute (primary method)

```javascript
// Run via figma_execute — extract full component data with keys
// Process one component set at a time
const node = await figma.getNodeByIdAsync('<COMPONENT_SET_NODE_ID>');

const result = {
  name: node.name,
  key: node.key,  // Component set key
  nodeId: node.id,
  description: node.description || '',
  // Variant keys — CRITICAL for direct instantiation
  variants: node.type === 'COMPONENT_SET'
    ? node.children.map(v => ({
        name: v.name,
        key: v.key,  // This is what figma_instantiate_component needs
        nodeId: v.id,
        properties: Object.fromEntries(
          v.name.split(', ').map(p => p.split('='))
        )
      }))
    : [{ name: node.name, key: node.key, nodeId: node.id }],

  // Component properties (props)
  componentPropertyDefinitions: node.componentPropertyDefinitions,

  // Bound variables (token usage) — cross-reference with design-system/tokens.json
  boundTokens: []
};

// Walk the component's layer tree to find bound variables
function walkForTokens(n) {
  if ('boundVariables' in n && n.boundVariables) {
    for (const [prop, binding] of Object.entries(n.boundVariables)) {
      const bindings = Array.isArray(binding) ? binding : [binding];
      for (const b of bindings) {
        if (b && b.id) {
          result.boundTokens.push({
            layer: n.name,
            property: prop,
            variableId: b.id
          });
        }
      }
    }
  }
  if ('children' in n) {
    for (const child of n.children) walkForTokens(child);
  }
}
walkForTokens(node);

return result;
```

### 2b. Enrich via MCP tools (secondary — for data not available via plugin API)

**If `figma_get_design_system_kit` was used in Step 1 with `format: "full"`,
you may already have visual specs, variant definitions, and resolved tokens
for each component. Check before making additional calls.**

For components that need deeper extraction:

```
Use figma_get_component_for_development_deep for full anatomy (up to 20 levels deep),
  resolved token names, instance references, and annotations.
Use figma_analyze_component_set for variant state machines, CSS pseudo-class mappings
  (hover, focus, disabled), and visual diffs between variants.
Use figma_get_annotations for designer annotations attached to the component.
Use figma_get_component_image for a rendered screenshot of each variant.
```

**State machine enrichment (mandatory for component sets with state variants):**
When writing a per-component JSON, call `figma_analyze_component_set` on the
component set's nodeId. Include the returned data in the component JSON under
a `stateMachine` key:
- `axes` — variant axes with all possible values (from `variantAxes`)
- `cssMapping` — CSS pseudo-class mappings (from `cssMapping`)
- `diffFromDefault` — only the changed properties per state vs default (from `diffFromDefault`)

This gives downstream skills (`/plan`, `/build`, `/handoff`) interaction state
data without re-querying Figma. For example, `/handoff` can emit hover/focus/disabled
specs directly from the cached state machine, and `/build` can set the correct
variant for each interaction state.

**Prefer `figma_get_component_for_development_deep` over the regular `_for_development`**
— it gives unlimited depth via Desktop Bridge and resolved token names.

### What to extract per component

**Identity**
- Name (as it appears in Figma)
- Description (from Figma component description field)
- Category/group (derived from naming convention or page location)
- Figma node ID (for cross-referencing)
- **Component key** (hash string for instantiation — CRITICAL)

**Variants**
- All variant properties and their possible values
- Default variant combination
- Which combinations are valid vs. intentionally excluded
- **Variant key for each combination** (hash string for `figma_instantiate_component`)

**Props** (component properties)
- Boolean props (show/hide elements)
- Text props (editable text content)
- Instance swap props (slot components)
- Their default values

**Anatomy**
- Layer structure (what's inside the component)
- Named layers that map to sub-elements
- Slot positions (where instance swaps happen)

**Token usage**
- Which tokens are applied (colors, spacing, typography, radii, shadows)
- Map each visual property to its token reference
- **Include the figma hash key for each token** (from design-system/tokens.json `$extensions.figma.key`)
- Flag any hardcoded values that should be tokens (linting opportunity)

**Sizing & spacing**
- Auto-layout properties (direction, gap, padding)
- Min/max constraints
- Fixed vs. hug vs. fill behavior
- Responsive behavior across breakpoints if defined

**States** (if captured as variants or interactive components)
- Default, hover, pressed, focused, disabled
- How state changes affect visual properties

**Annotations**
- Any annotations attached by the designer
- Usage guidelines in the description field

## Step 3: Structure the output

Create one JSON file per component in the `design-system/components/` directory.

### File naming

Use kebab-case matching the component name:
- `Button` → `design-system/components/button.json`
- `Text Field` → `design-system/components/text-field.json`
- `Navigation/Breadcrumb` → `design-system/components/breadcrumb.json` (flatten hierarchy)

### Component JSON format

The output must include `$extensions.figma` with the **component key** (hash string)
for direct instantiation, and **variant keys** for each variant combination. This is
the component equivalent of `$extensions.figma.key` in design-system/tokens.json — it eliminates
MCP search calls entirely.

```json
{
  "$schema": "design-kit/component/v1",
  "$metadata": {
    "extractedAt": "<ISO timestamp>",
    "figmaNodeId": "123:456",
    "figmaFile": "<file name>"
  },
  "name": "Button",
  "description": "Primary action trigger. Use for the main call-to-action on a page.",
  "category": "Inputs",
  "status": "published",

  "$extensions": {
    "figma": {
      "componentSetKey": "a1b2c3d4e5f6...",
      "nodeId": "123:456",
      "variantKeys": {
        "Size=sm, Variant=primary, State=default": "f6e5d4c3b2a1...",
        "Size=md, Variant=primary, State=default": "1a2b3c4d5e6f...",
        "Size=lg, Variant=primary, State=default": "6f5e4d3c2b1a...",
        "Size=md, Variant=secondary, State=default": "b1c2d3e4f5a6...",
        "Size=md, Variant=ghost, State=default": "c2d3e4f5a6b1...",
        "Size=md, Variant=destructive, State=default": "d3e4f5a6b1c2..."
      },
      "defaultVariantKey": "1a2b3c4d5e6f..."
    }
  },

  "variants": {
    "size": {
      "values": ["sm", "md", "lg"],
      "default": "md",
      "description": "Controls overall button dimensions"
    },
    "variant": {
      "values": ["primary", "secondary", "ghost", "destructive"],
      "default": "primary",
      "description": "Visual style variant"
    },
    "state": {
      "values": ["default", "hover", "pressed", "focused", "disabled"],
      "default": "default"
    }
  },

  "props": {
    "label": {
      "type": "text",
      "default": "Button",
      "description": "Button label text"
    },
    "showIcon": {
      "type": "boolean",
      "default": false,
      "description": "Show leading icon"
    },
    "iconSlot": {
      "type": "instanceSwap",
      "description": "Icon component to display when showIcon is true",
      "$extensions": {
        "figma": {
          "compatibleKeys": ["key1...", "key2...", "key3..."]
        }
      }
    }
  },

  "anatomy": {
    "root": {
      "type": "frame",
      "layout": "horizontal",
      "children": ["iconSlot", "label"]
    },
    "iconSlot": {
      "type": "instance",
      "description": "Leading icon slot"
    },
    "label": {
      "type": "text",
      "description": "Button label"
    }
  },

  "tokens": {
    "$description": "Token references with figma hash keys for direct binding",
    "background": {
      "primary":     { "$ref": "color.background.bg-brand-solid", "figmaKey": "a191f123..." },
      "secondary":   { "$ref": "color.background.bg-primary", "figmaKey": "b6157f22..." },
      "ghost":       "transparent",
      "destructive": { "$ref": "color.background.bg-error-solid", "figmaKey": "cb1aed3a..." }
    },
    "textColor":   { "$ref": "color.text.text-white", "figmaKey": "8ebcc991..." },
    "borderRadius": { "$ref": "borderRadius.radius-md", "figmaKey": "19927d5b..." },
    "fontSize": {
      "sm": { "$ref": "typography.fontSize.text-sm", "figmaKey": "4f043a03..." },
      "md": { "$ref": "typography.fontSize.text-md", "figmaKey": "b7a5042a..." },
      "lg": { "$ref": "typography.fontSize.text-lg", "figmaKey": "8137a2b2..." }
    },
    "padding": {
      "sm": { "y": "spacing.spacing-md", "x": "spacing.spacing-lg", "yKey": "cc421a9e...", "xKey": "48917321..." },
      "md": { "y": "spacing.spacing-lg", "x": "spacing.spacing-xl", "yKey": "48917321...", "xKey": "f4d6b399..." },
      "lg": { "y": "spacing.spacing-xl", "x": "spacing.spacing-3xl", "yKey": "f4d6b399...", "xKey": "ac8c9414..." }
    },
    "gap": { "$ref": "spacing.spacing-md", "figmaKey": "cc421a9e..." }
  },

  "layout": {
    "direction": "horizontal",
    "alignment": "center",
    "gap": { "$ref": "spacing.spacing-md", "figmaKey": "cc421a9e..." },
    "padding": {
      "top":    { "$ref": "spacing.spacing-lg", "figmaKey": "48917321..." },
      "right":  { "$ref": "spacing.spacing-xl", "figmaKey": "f4d6b399..." },
      "bottom": { "$ref": "spacing.spacing-lg", "figmaKey": "48917321..." },
      "left":   { "$ref": "spacing.spacing-xl", "figmaKey": "f4d6b399..." }
    },
    "sizing": {
      "width": "hug",
      "height": "fixed",
      "minWidth": "80px"
    }
  },

  "annotations": [
    "Use primary variant for single main action per page",
    "Destructive variant requires confirmation dialog"
  ],

  "stateMachine": {
    "axes": {
      "State": ["default", "hover", "focus", "disabled"],
      "Size": ["sm", "md", "lg"]
    },
    "cssMapping": {
      "hover": ":hover",
      "focus": ":focus-visible",
      "disabled": ":disabled"
    },
    "diffFromDefault": {
      "hover": { "fills": "color.background.bg-brand-solid-hover" },
      "focus": { "strokes": "color.border.border-brand", "strokeWeight": 2 },
      "disabled": { "opacity": 0.5 }
    }
  }
}
```

### Why every key matters

| Field | What it enables | Without it |
|---|---|---|
| `$extensions.figma.variantKeys` | `figma_instantiate_component(key)` — one call | `figma_search_components` + parse results + guess variant |
| `tokens[*].figmaKey` | `importVariableByKeyAsync(key)` in `figma_execute` | Scan 6 collections + 359 variables per token |
| `props[*].$extensions.figma.compatibleKeys` | Direct instance swap by key | Search for compatible components each time |
| `stateMachine` | `/handoff` emits hover/focus/disabled specs; `/build` picks correct state variant | Re-query `figma_analyze_component_set` every time |
```

## Step 4: Report

For each component, check for quality signals:

**Good signs** (celebrate these)
- Description field is filled in
- Consistent variant naming across components
- Token variables applied (not hardcoded values)
- Auto-layout used throughout
- Annotations present

**Issues to flag** (don't fix — just report)
- Missing description
- Hardcoded color values instead of tokens
- Inconsistent naming (`Primary` vs `primary` vs `isPrimary`)
- Missing states (no disabled variant, no hover state)
- Fixed sizing where auto-layout would be better

Present a report:
> "Built `design-system/components/index.json` with **24 component sets** cataloged:
>
> **Categories:**
> - Inputs (7): Button, TextField, Select, Checkbox, Radio, Toggle, Slider
> - Navigation (5): Tabs, Breadcrumb, Sidebar, Navbar, Pagination
> - Feedback (4): Alert, Toast, Badge, Tooltip, Progress
> - Layout (8): Card, Divider, Avatar, Modal, Drawer, Accordion, Table
>
> **Index includes for each:** name, figmaKey, defaultVariantKey, description, category
>
> **Individual component JSONs** are built on-demand. The first time you work with
> a component (e.g., `/lofi-to-hifi` instantiates a Button), its full spec gets
> extracted and cached as `design-system/components/button.json`. No wasted extraction.
>
> Want me to extract full specs for any specific components now?"

## Step 5: Handle edge cases

**Component sets vs. standalone components**
- Component sets (with variants) → single JSON with full variant matrix
- Standalone components → simpler JSON without variants section

**Nested components**
- Components that contain instances of other components → document the relationship
  in `anatomy` and note it for `setup-relationships`

**Unpublished components**
- Ask the user if they want to include unpublished components
- Mark them with `"status": "draft"` in the output

**Very large component libraries (50+)**
- Process in batches of 10
- Show progress after each batch
- Allow the user to pause/resume

**Fault tolerance**: If extraction fails for a single component, log the error and
continue with the rest. Never abort the entire batch for one failure.

```javascript
// Wrap each component extraction in try/catch
for (const comp of batch) {
  try {
    const data = await extractComponent(comp);
    results.push(data);
  } catch (err) {
    failures.push({ name: comp.name, error: err.message });
    // Continue — don't abort
  }
}
```

After completing all batches, report failures:
> "Extracted 108/112 components. 4 failed: [list with error reasons].
> These can be retried individually."

**Extraction order**: Process in dependency order when possible:
1. **Atoms first** (no children) — icons, badges, dividers
2. **Molecules next** (contain atoms) — buttons, inputs, toggles
3. **Organisms last** (contain molecules) — cards, forms, navigation bars

This ensures that when a molecule's anatomy references an atom, the atom's
spec already exists. Use `design-system/relationships.json` for the dependency
graph if available; otherwise extract flat and note unresolved references.

**Components with no variants**
- Still extract — document props, tokens, layout
- Variant section can be empty or omitted

### How to use design-system/tokens.json for Figma operations

When you need to bind a design token to a Figma node via `figma_execute`:

1. Read `design-system/tokens.json` from the working directory
2. Look up the token by its path (e.g., `tokens.spacing["spacing-xl"]`)
3. Get the Figma key from `$extensions.figma.key`
4. In your `figma_execute` code, use `figma.variables.importVariableByKeyAsync(key)` directly
5. NEVER scan collections with `getAvailableLibraryVariableCollectionsAsync()` + `getVariablesInLibraryCollectionAsync()` — this is slow and redundant when design-system/tokens.json exists

This turns O(n) collection scanning into O(1) direct key lookup per token.

## Next steps

> "Components cataloged. Next:
> - Run `/setup-relationships` to map how they connect
> - Run `/setup-icons` to catalog the icon library
> - Or jump to `/plan` — your components are ready to use"

## Tone

You're a thorough design system cataloger. You appreciate well-structured components
and gently note opportunities for improvement. Always ask before making assumptions
about component categorization or naming conventions.
