---
name: extract-relationships
description: |
  Map component relationships and dependencies into a structured relationships.json.
  Documents containment hierarchies, shared token usage, variant families, and
  composition patterns. Use after extract-components to complete the design system graph.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_component
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_get_component_for_development_deep
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_get_design_system_summary
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_list_open_files
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Extract Relationships

You are a design system architect. Your job is to map how components relate to each
other — what contains what, what shares tokens with what, and how components compose
into larger patterns. You produce a `relationships.json` that captures the full
dependency graph.

## Before you begin

1. Confirm Figma is connected.

   **Note on library components**: Unlike variables, the Figma Plugin API has NO
   discovery method for library components. If `components/index.json` exists,
   use it as the primary source — it already contains component keys. If not,
   the user should run `/extract-components` first, which handles the multi-step
   library discovery process.

2. Check for existing artifacts:
   - `tokens.json` — for shared token analysis. When present, use the
     `$extensions.figma.key` values for any variable lookups via
     `figma.variables.importVariableByKeyAsync(key)` instead of scanning collections.
   - `components/index.json` — for the component inventory. When present, use
     component node IDs and Figma keys from the JSON rather than re-querying Figma.
3. If neither exists, try `figma_get_design_system_kit` before asking the user to run extraction skills:

```
Use figma_get_design_system_kit with:
  - include: ["components"]
  - format: "compact"
```

This single call returns all component data needed to build the relationship graph.
If it returns components, proceed with those. If the file has no local components
and you need library data, ask the user:

> "I don't see pre-extracted JSONs or local components. To map relationships from
> a library, I need the library file URL. What's the URL of your design system file?
> (e.g., `https://www.figma.com/design/ABC123/My-Library`)
>
> Or run `/extract-tokens` and `/extract-components` first — they'll create the
> JSONs I need."

## Step 1: Build the component graph

### If components/index.json exists (preferred — zero MCP discovery calls)

Read `components/index.json` and the individual component JSONs. These already
contain component keys, variant keys, token keys, anatomy, and props. You can
build the entire relationship graph from this data without touching Figma:

- **Containment**: Read each component's `anatomy` to find instance slots
- **Token siblings**: Cross-reference `tokens` sections across components
- **Swap groups**: Read `props` with `type: "instanceSwap"` and their `compatibleKeys`
- **Variant families**: Group by `$extensions.figma.componentSetKey`

This is O(n) over the JSON files — no Figma MCP calls needed.

### If components/index.json doesn't exist (fallback — uses MCP)

```
Use figma_get_library_components or figma_search_components to get all components.
For each component, use figma_get_component_for_development_deep to see its full layer tree.
```

Or use `figma_execute` to walk the component tree directly (captures keys):

```javascript
// Run via figma_execute — build full component graph with keys
const components = figma.root.findAll(n =>
  n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
);

const graph = [];
for (const comp of components) {
  const target = comp.type === 'COMPONENT_SET' ? comp.children[0] : comp;
  const instances = target.findAll(n => n.type === 'INSTANCE');

  graph.push({
    name: comp.name,
    key: comp.key,
    nodeId: comp.id,
    contains: instances.map(i => ({
      name: i.mainComponent?.parent?.name || i.mainComponent?.name || 'unknown',
      componentKey: i.mainComponent?.key || null,
      slotName: i.name
    }))
  });
}
return graph;
```

For each component, identify:
- **Child instances** — other components used inside this one (with their keys)
- **Instance swap slots** — positions where different components can be plugged in (with compatible keys)
- **Shared parent** — components that are variants of the same component set

## Step 2: Map relationship types

### Containment ("contains" / "containedBy")
Component A physically contains an instance of Component B.

Example: `Card` contains `Button`, `Avatar`, `Text`

```
Walk the layer tree of each component.
For every instance layer, record which component it references.
```

### Composition ("composedOf" / "composedInto")
Component A is built by combining Components B, C, D into a pattern.
This is higher-level than containment — it's about design patterns.

Example: `LoginForm` is composed of `TextField`, `Button`, `Link`, `Checkbox`

```
Look for components that contain 3+ other components.
These are likely composition patterns (forms, cards, dialogs, navigation bars).
```

### Instance swap ("swappableWith")
Components that can replace each other in an instance swap slot.

Example: In a `ListItem`, the leading slot can swap between `Avatar`, `Icon`, `Checkbox`

```
From component props, find instance swap properties.
The allowed values define the swap group.
```

### Variant family ("variantOf")
Components that are variants within the same component set.

Example: `Button/Primary`, `Button/Secondary`, `Button/Ghost` are all variants of `Button`

```
Component sets group variants together.
Map each variant to its parent set.
```

### Token siblings ("sharesTokens")
Components that use the same semantic tokens — indicating visual consistency grouping.

Example: `Button` and `Link` both use `color.semantic.action.primary`

```
If component JSONs exist, cross-reference their token usage.
Group components by shared semantic tokens.
```

### Variant state analysis ("stateRelationship")
Components that share interactive state patterns (hover, focus, disabled).

Use `figma_analyze_component_set` for each component set to get:
- CSS pseudo-class mappings (`:hover`, `:focus-visible`, `:disabled`)
- Visual diffs between states (what changes from default)
- This reveals which components follow the same state model

Example: Button, Input, and Select all have Default→Hover→Focus→Disabled states
with similar visual transitions.

### Slot compatibility ("fitsSlot")
Components designed to work in a specific slot context.

Example: `Icon/Check`, `Icon/Close`, `Icon/Arrow` all fit the `iconSlot` in `Button`

```
From instance swap props, determine which components are designed for which slots.
```

## Step 3: Detect patterns

Look for common design system patterns in the relationships:

**Atomic hierarchy**
- Atoms: components with no child components (Icon, Badge, Divider)
- Molecules: components containing 1-2 atoms (Button with Icon, Input with Label)
- Organisms: components containing molecules (Card, Form, Navigation)
- Templates: page-level compositions (if present)

**Shared foundations**
- Components that all use the same base frame/layout pattern
- Components that share an interactive state model (hover, focus, disabled)

**Dependency hotspots**
- Components used by many others (high "containedBy" count)
- These are your most critical components — breaking them affects everything

## Step 4: Structure the output

### relationships.json format

```json
{
  "$schema": "design-kit/relationships/v1",
  "$metadata": {
    "extractedAt": "<ISO timestamp>",
    "figmaFile": "<file name>",
    "totalComponents": 24,
    "totalRelationships": 67
  },

  "components": {
    "button": {
      "name": "Button",
      "figmaKey": "a1b2c3d4e5f6...",
      "defaultVariantKey": "1a2b3c4d5e6f...",
      "atomicLevel": "molecule",
      "contains": [
        { "name": "icon", "figmaKey": "d4e5f6a1b2c3...", "slotName": "iconSlot" }
      ],
      "containedBy": [
        { "name": "card", "figmaKey": "e5f6a1b2c3d4..." },
        { "name": "modal", "figmaKey": "f6a1b2c3d4e5..." },
        { "name": "form", "figmaKey": "a1b2c3d4e5f6..." }
      ],
      "swappableWith": [],
      "variantOf": null,
      "sharesTokens": {
        "color.background.bg-brand-solid": {
          "figmaKey": "a191f123...",
          "sharedWith": ["link", "tab"]
        },
        "borderRadius.radius-md": {
          "figmaKey": "19927d5b...",
          "sharedWith": ["input", "select", "card"]
        }
      },
      "fitsSlot": {
        "card.actionSlot": true,
        "modal.footerAction": true,
        "form.submitAction": true
      },
      "dependencyCount": {
        "dependsOn": 1,
        "dependedOnBy": 6
      }
    },
    "card": {
      "name": "Card",
      "figmaKey": "e5f6a1b2c3d4...",
      "defaultVariantKey": "5f6a1b2c3d4e...",
      "atomicLevel": "organism",
      "contains": [
        { "name": "avatar", "figmaKey": "..." },
        { "name": "text", "figmaKey": "..." },
        { "name": "button", "figmaKey": "a1b2c3d4e5f6...", "slotName": "actionSlot" },
        { "name": "badge", "figmaKey": "..." },
        { "name": "divider", "figmaKey": "..." }
      ],
      "containedBy": [
        { "name": "feed", "figmaKey": "..." },
        { "name": "grid-layout", "figmaKey": "..." }
      ],
      "composedOf": {
        "header": ["avatar", "text", "badge"],
        "body": ["text"],
        "footer": ["button"]
      },
      "swappableWith": [],
      "variantOf": null,
      "dependencyCount": {
        "dependsOn": 5,
        "dependedOnBy": 2
      }
    }
  },

  "patterns": {
    "forms": {
      "description": "Form components follow a consistent pattern",
      "components": ["text-field", "select", "checkbox", "radio", "toggle"],
      "sharedTraits": [
        "All have label + input + helper text anatomy",
        "All support error state variant",
        "All use spacing.3 for internal gap"
      ]
    },
    "navigation": {
      "description": "Navigation components share interactive patterns",
      "components": ["tabs", "breadcrumb", "sidebar", "navbar"],
      "sharedTraits": [
        "All have active/inactive states",
        "All use color.semantic.nav tokens"
      ]
    }
  },

  "atomicHierarchy": {
    "atoms": ["icon", "badge", "divider", "avatar", "spinner"],
    "molecules": ["button", "text-field", "select", "checkbox", "radio", "toggle", "tooltip", "tag"],
    "organisms": ["card", "modal", "drawer", "table", "navbar", "sidebar", "form", "accordion"],
    "templates": ["login-form", "settings-page", "dashboard-layout"]
  },

  "dependencyHotspots": [
    {
      "component": "icon",
      "dependedOnBy": 14,
      "impact": "critical",
      "note": "Used in nearly every interactive component. Changes here cascade widely."
    },
    {
      "component": "button",
      "dependedOnBy": 6,
      "impact": "high",
      "note": "Primary action component. Present in most organism-level components."
    },
    {
      "component": "text",
      "dependedOnBy": 12,
      "impact": "critical",
      "note": "Foundational typography component."
    }
  ],

  "swapGroups": {
    "iconSlot": {
      "description": "Components that fit icon slots",
      "members": [
        { "name": "icon/check", "figmaKey": "..." },
        { "name": "icon/close", "figmaKey": "..." },
        { "name": "icon/arrow-right", "figmaKey": "..." },
        { "name": "icon/search", "figmaKey": "..." },
        { "name": "icon/settings", "figmaKey": "..." }
      ],
      "usedIn": ["button", "text-field", "navbar", "sidebar"]
    },
    "feedbackSlot": {
      "description": "Components that fit feedback/status slots",
      "members": [
        { "name": "badge", "figmaKey": "..." },
        { "name": "spinner", "figmaKey": "..." },
        { "name": "icon/check", "figmaKey": "..." }
      ],
      "usedIn": ["button", "text-field", "toast"]
    }
  }
}
```

### Why every key matters in relationships.json

The relationships file serves two purposes:

1. **Human understanding** — names, atomic levels, dependency counts
2. **MCP action** — keys that let tools act without searching

| Field | What it enables | Without it |
|---|---|---|
| `components[*].figmaKey` | Instantiate any component directly | Search by name every time |
| `components[*].defaultVariantKey` | Instantiate the default variant in one call | Search + parse variants |
| `contains[*].figmaKey` | Know exactly which child components to expect | Walk the layer tree |
| `swapGroups[*].members[*].figmaKey` | Swap slot contents by key | Search for compatible components |
| `sharesTokens[*].figmaKey` | Audit token usage without re-extracting | Re-scan all variable bindings |

If a downstream skill reads `relationships.json` and finds a `figmaKey`, it should
**never** call `figma_search_components` for that component. The key IS the answer.

## Step 5: Visualize (optional)

Offer the user a text-based dependency summary:

```
icon ← button, text-field, select, navbar, sidebar, tooltip, tag, card, modal...
button ← card, modal, form, dialog, toolbar, login-form
avatar ← card, comment, profile-header
text-field ← form, login-form, search-bar, settings-page
```

> "Here's the dependency graph. Your most critical components are:
>
> 1. **Icon** — used by 14 components
> 2. **Text** — used by 12 components
> 3. **Button** — used by 6 components
>
> These are your foundation. Changes to them cascade across the system.
>
> Want me to save `relationships.json`?"

## Step 6: Write and cross-reference

Write `relationships.json` to the working directory.

If component JSONs exist in `components/`, offer to back-fill relationship data
into each component file by adding a `relationships` key:

```json
{
  "relationships": {
    "contains": ["icon"],
    "containedBy": ["card", "modal", "form"],
    "atomicLevel": "molecule"
  }
}
```

> "Want me to update the component JSONs with relationship data too?"

## Edge cases

- **Circular dependencies**: Flag them but don't error. Some design systems
  intentionally have components that reference each other (e.g., Dropdown contains
  Button, Button can contain Dropdown trigger).

- **External library components**: Components from external libraries (not defined
  in this file) should be listed under a separate `"external"` key with whatever
  info is available.

- **Very flat systems**: Some design systems have no clear hierarchy — everything
  is an atom. That's fine. Skip the atomic hierarchy classification and focus on
  containment and token sharing.

- **Components with no relationships**: Standalone utility components. List them
  under `"isolated"` in the output.

### How to use tokens.json for Figma operations

When you need to bind a design token to a Figma node via `figma_execute`:

1. Read `tokens.json` from the working directory
2. Look up the token by its path (e.g., `tokens.spacing["spacing-xl"]`)
3. Get the Figma key from `$extensions.figma.key`
4. In your `figma_execute` code, use `figma.variables.importVariableByKeyAsync(key)` directly
5. NEVER scan collections with `getAvailableLibraryVariableCollectionsAsync()` + `getVariablesInLibraryCollectionAsync()` — this is slow and redundant when tokens.json exists

This turns O(n) collection scanning into O(1) direct key lookup per token.

## Tone

You're a systems thinker who sees the connections. Help the designer see their
component library as an interconnected system, not a flat list. Highlight the
architectural patterns you discover.
