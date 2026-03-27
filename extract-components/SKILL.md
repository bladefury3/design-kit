---
name: extract-components
description: |
  Extract component specifications from a Figma file into individual JSON files.
  Documents variants, props, token usage, anatomy, and usage guidelines for each
  component. Use after extract-tokens to build the component layer of your
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
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_get_annotations
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

   **Note on library components**: If components come from an attached team library,
   use `figma_execute` with `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()`
   and the async Figma plugin APIs. The standard MCP tools may not surface library data.

2. Check if `tokens.json` exists in the working directory. If yes, load it — you'll
   reference token names in component specs AND use the `$extensions.figma.key` values
   for direct variable lookups via `figma.variables.importVariableByKeyAsync(key)`
   instead of scanning collections. If not, note it and proceed (you can still extract
   components, just without token cross-references or fast variable lookups).
3. Ask the user about scope:

> "I can extract components in a few ways:
>
> **A) Full library** — Every published component in the file
> **B) Selection** — Just the components you've selected in Figma
> **C) Page-based** — All components on a specific page
> **D) Search** — Components matching a name pattern
>
> Which approach works best?"

## Step 1: Discover components

The goal of discovery is to build a **complete key map** — component name → Figma
component key (hash string) — so that all downstream skills can instantiate components
directly via `figma_instantiate_component` without searching.

### 1a. Get the component key map via figma_execute

This is the most reliable method, especially for library components:

```javascript
// Run via figma_execute — discovers all local components with their keys
const allComponents = figma.root.findAll(n =>
  n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
);

return allComponents.map(c => ({
  name: c.name,
  type: c.type,
  id: c.id,
  key: c.key,  // CRITICAL: the hash key for instantiation
  description: c.description || '',
  parent: c.parent?.name || null,
  // For component sets, get variant keys
  ...(c.type === 'COMPONENT_SET' ? {
    variants: c.children.map(v => ({
      name: v.name,
      id: v.id,
      key: v.key,  // CRITICAL: variant key for figma_instantiate_component
      // Parse variant properties from the name (e.g., "Size=md, State=default")
      properties: Object.fromEntries(
        v.name.split(', ').map(p => p.split('='))
      )
    }))
  } : {})
}));
```

For library components not in the current file, use `figma_get_library_components`
with `includeVariants=true`, then capture the `componentKey` from each result.

### 1b. Also try MCP discovery tools

Based on the user's scope choice:

**Full library:**
```
Use figma_get_library_components with the library file key to get component keys.
Use figma_get_design_system_summary for an overview.
```

**Selection:**
```
Use figma_get_selection to get currently selected nodes.
Filter to component and component set types.
```

**Page-based:**
```
Use figma_get_file_data to find components on the specified page.
```

**Search:**
```
Use figma_search_components with the user's search term.
```

**Important**: Whichever method you use, always capture the **component key** (hash
string). This is the equivalent of `$extensions.figma.key` in tokens.json — it's the
direct instantiation handle that eliminates searching.

Present a summary:
> "Found **24 components**. Here's the breakdown:
>
> - **Inputs**: Button, TextField, Select, Checkbox, Radio, Toggle, Slider
> - **Navigation**: Tabs, Breadcrumb, Sidebar, Navbar, Pagination
> - **Feedback**: Alert, Toast, Badge, Tooltip, Progress
> - **Layout**: Card, Divider, Avatar, Modal, Drawer, Accordion, Table
>
> Want me to extract all of them, or a specific group?"

## Step 2: Deep-dive each component

For each component, gather comprehensive details. Prefer `figma_execute` for
extracting keys and structural data (faster, captures keys), then use MCP tools
for enrichment (descriptions, images, annotations):

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

  // Bound variables (token usage) — cross-reference with tokens.json
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

```
Use figma_get_component_for_development for dev-ready specs.
Use figma_get_component_for_development_deep for full anatomy breakdown.
Use figma_analyze_component_set for variant matrix analysis.
Use figma_get_annotations for any designer annotations.
Use figma_get_component_image to capture a visual reference.
```

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
- **Include the figma hash key for each token** (from tokens.json `$extensions.figma.key`)
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

Create one JSON file per component in a `components/` directory.

### File naming

Use kebab-case matching the component name:
- `Button` → `components/button.json`
- `Text Field` → `components/text-field.json`
- `Navigation/Breadcrumb` → `components/breadcrumb.json` (flatten hierarchy)

### Component JSON format

The output must include `$extensions.figma` with the **component key** (hash string)
for direct instantiation, and **variant keys** for each variant combination. This is
the component equivalent of `$extensions.figma.key` in tokens.json — it eliminates
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
  ]
}
```

### Why every key matters

| Field | What it enables | Without it |
|---|---|---|
| `$extensions.figma.variantKeys` | `figma_instantiate_component(key)` — one call | `figma_search_components` + parse results + guess variant |
| `tokens[*].figmaKey` | `importVariableByKeyAsync(key)` in `figma_execute` | Scan 6 collections + 359 variables per token |
| `props[*].$extensions.figma.compatibleKeys` | Direct instance swap by key | Search for compatible components each time |
```

## Step 4: Create component index

After extracting all components, create `components/index.json`:

The index is the **quick-lookup table** that downstream skills read first. It must
include component keys so that a skill can instantiate any component without opening
the individual JSON file.

```json
{
  "$schema": "design-kit/component-index/v1",
  "$metadata": {
    "extractedAt": "<ISO timestamp>",
    "totalComponents": 24,
    "figmaFile": "<file name>"
  },
  "components": {
    "button": {
      "file": "button.json",
      "name": "Button",
      "category": "Inputs",
      "status": "published",
      "variantCount": 3,
      "description": "Primary action trigger",
      "figmaKey": "a1b2c3d4e5f6...",
      "defaultVariantKey": "1a2b3c4d5e6f..."
    },
    "text-field": {
      "file": "text-field.json",
      "name": "Text Field",
      "category": "Inputs",
      "status": "published",
      "variantCount": 4,
      "description": "Single-line text input",
      "figmaKey": "b2c3d4e5f6a1...",
      "defaultVariantKey": "2b3c4d5e6f1a..."
    }
  },
  "categories": {
    "Inputs": ["button", "text-field", "select", "checkbox", "radio", "toggle", "slider"],
    "Navigation": ["tabs", "breadcrumb", "sidebar", "navbar", "pagination"],
    "Feedback": ["alert", "toast", "badge", "tooltip", "progress"],
    "Layout": ["card", "divider", "avatar", "modal", "drawer", "accordion", "table"]
  }
}
```

This means a downstream skill like `/lofi-to-hifi` can do:
1. Read `components/index.json`
2. Look up `components.button.defaultVariantKey`
3. Call `figma_instantiate_component(key)` — done. No searching.
```

## Step 5: Validate and report

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
> "Extracted **24 components** into `components/`:
>
> **Quality summary:**
> - 18/24 have descriptions
> - 20/24 use token variables
> - 6/24 are missing disabled states
> - 2 components have hardcoded colors that should be tokens
>
> **Files created:**
> - `components/button.json`
> - `components/text-field.json`
> - ... (list all)
> - `components/index.json`
>
> Want me to detail the issues I flagged?"

## Step 6: Handle edge cases

**Component sets vs. standalone components**
- Component sets (with variants) → single JSON with full variant matrix
- Standalone components → simpler JSON without variants section

**Nested components**
- Components that contain instances of other components → document the relationship
  in `anatomy` and note it for `extract-relationships`

**Unpublished components**
- Ask the user if they want to include unpublished components
- Mark them with `"status": "draft"` in the output

**Very large component libraries (50+)**
- Process in batches of 10
- Show progress after each batch
- Allow the user to pause/resume

**Components with no variants**
- Still extract — document props, tokens, layout
- Variant section can be empty or omitted

### How to use tokens.json for Figma operations

When you need to bind a design token to a Figma node via `figma_execute`:

1. Read `tokens.json` from the working directory
2. Look up the token by its path (e.g., `tokens.spacing["spacing-xl"]`)
3. Get the Figma key from `$extensions.figma.key`
4. In your `figma_execute` code, use `figma.variables.importVariableByKeyAsync(key)` directly
5. NEVER scan collections with `getAvailableLibraryVariableCollectionsAsync()` + `getVariablesInLibraryCollectionAsync()` — this is slow and redundant when tokens.json exists

This turns O(n) collection scanning into O(1) direct key lookup per token.

## Tone

You're a thorough design system cataloger. You appreciate well-structured components
and gently note opportunities for improvement. Always ask before making assumptions
about component categorization or naming conventions.
