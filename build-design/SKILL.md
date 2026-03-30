---
name: build-design
description: |
  Execute a plan.json in Figma. Reads the structured build plan and mechanically
  creates frames, instantiates library components, binds tokens, and sets text.
  No planning, no guessing — just execution. Use after plan-design.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_instantiate_component
  - mcp__figma-console__figma_set_fills
  - mcp__figma-console__figma_set_strokes
  - mcp__figma-console__figma_set_text
  - mcp__figma-console__figma_resize_node
  - mcp__figma-console__figma_move_node
  - mcp__figma-console__figma_create_child
  - mcp__figma-console__figma_clone_node
  - mcp__figma-console__figma_rename_node
  - mcp__figma-console__figma_delete_node
  - mcp__figma-console__figma_set_instance_properties
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_capture_screenshot
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_navigate
  - Read
  - Write
  - Bash
  - AskUserQuestion
  - Agent
---

# Build Design

You are a design builder. Your job is to execute a `plan.json` file in Figma —
mechanically, precisely, and without improvisation. Every component, token, and
text value is already decided in the plan. You just build it.

**You do NOT make design decisions.** If something is ambiguous or missing in the
plan, ask the user — don't guess. All decisions were made in `/plan-design`.

## Before you begin

1. Confirm Figma is connected.

2. Read `plan.json` from the working directory. This is your build spec.
   If it doesn't exist:
   > "No plan.json found. Run `/plan-design` first to create a build plan."

3. Read `tokens.json` and `components/index.json` — you'll need these for
   on-demand component extraction if any components haven't been fully extracted yet.

4. **Pre-build validation (mandatory):**

   a. **Verify token keys**: Scan all `figmaKey` values in plan.json. Every key must
      be a 40-character hex hash. If any key contains `/` (path-style), STOP and warn:
      > "Plan contains path-style token keys that won't work. Run `/extract-tokens`
      > to refresh, or manually fix the keys in tokens.json."

   b. **Verify component coverage**: Check the plan's `componentCoverage.percentage`.
      If below 60%, warn:
      > "Only [X]% of elements use library components. Review the plan — some
      > token-built elements may have library equivalents."

   c. **Verify typography tokens**: Check that every `type: "text"` node in the plan
      has `fontSize`, `lineHeight`, AND `fills` in its `tokens` object. If any text
      node is missing typography tokens, STOP and warn:
      > "Text node '[name]' is missing typography token bindings. The plan must
      > specify fontSize, lineHeight, and fills for every text node."

   d. **Check relationships.json**: If it exists, verify that composition patterns
      are respected (e.g., if Avatar label group contains Avatar, don't instantiate
      a standalone Avatar where the label group should be used).

5. Confirm with the user:
   > "Ready to build: **[plan name]** ([width]px)
   > - [N] library components to instantiate
   > - [N] token-built frames
   > - [N] text nodes
   >
   > Build it?"

## Step 1: Prepare the token key map

Extract all unique figmaKey values from the plan into a flat key map. This gets
embedded into `figma_execute` calls for O(1) variable binding.

```javascript
// Read plan.json, build: { "shortAlias": "figmaHashKey" }
// e.g., { "bg.primary": "b6157f22...", "s.4xl": "284dbace..." }
```

This is the same pattern used in the dashboard build — all token bindings are
direct key lookups, zero collection scanning.

## Step 2: Build the frame tree

Walk the plan's `layout` tree depth-first. For each node:

### type: "frame"

Create a Figma frame with auto-layout:

```javascript
const frame = figma.createFrame();
frame.name = node.name;
frame.layoutMode = node.direction === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';

// Apply token bindings from node.tokens
for (const [prop, token] of Object.entries(node.tokens)) {
  if (token.figmaKey) {
    const v = await figma.variables.importVariableByKeyAsync(token.figmaKey);
    if (prop === 'fills') {
      frame.fills = [figma.variables.setBoundVariableForPaint(
        {type:'SOLID', color:{r:0,g:0,b:0}}, 'color', v
      )];
    } else {
      frame.setBoundVariable(prop, v);
    }
  }
}

// Apply sizing
if (node.sizing?.width === 'fill') frame.layoutSizingHorizontal = 'FILL';
if (node.sizing?.height === 'fill') frame.layoutSizingVertical = 'FILL';
if (typeof node.width === 'number') frame.resize(node.width, node.height || 100);

// Apply alignment
if (node.justify) frame.primaryAxisAlignItems = node.justify.toUpperCase().replace('-', '_');
if (node.align) frame.counterAxisAlignItems = node.align.toUpperCase();
```

### type: "library-component"

Instantiate from the library using the variant key:

```
Use figma_instantiate_component with:
  - componentKey: node.variantKey (the hash from plan.json)
  - parentId: parent frame's ID
```

**CRITICAL: Use `variantKey`, not `figmaKey`.** The variantKey is the specific
variant's component key. The figmaKey is the component set key (which will fail).

After instantiation, apply overrides:

```javascript
// Set text overrides
const instance = await figma.getNodeByIdAsync(instanceId);
const texts = instance.findAll(n => n.type === 'TEXT');
for (const t of texts) {
  await figma.loadFontAsync(t.fontName);
  // Match by node name or content pattern
  if (node.overrides.text && t.name.toLowerCase().includes('text')) {
    t.characters = node.overrides.text;
  }
}

// Set sizing
if (node.sizing?.width === 'fill') instance.layoutSizingHorizontal = 'FILL';
if (node.sizing?.height === 'fill') instance.layoutSizingVertical = 'FILL';
```

### type: "text"

Create a text node with **ALL properties token-bound**. Never hardcode font sizes,
line heights, or text colors — always bind to variables from tokens.json.

```javascript
await figma.loadFontAsync({family: 'Inter', style: node.style || 'Regular'});
const text = figma.createText();
text.characters = node.content;
text.fontName = {family: 'Inter', style: node.style || 'Regular'};

// MANDATORY: Bind ALL token properties — fontSize, lineHeight, AND fills
// Never use hardcoded values like text.fontSize = 14
for (const [prop, token] of Object.entries(node.tokens)) {
  const v = await figma.variables.importVariableByKeyAsync(token.figmaKey);
  if (prop === 'fills') {
    text.fills = [figma.variables.setBoundVariableForPaint(
      {type:'SOLID', color:{r:0,g:0,b:0}}, 'color', v
    )];
  } else {
    text.setBoundVariable(prop, v);
  }
}
```

**CRITICAL**: If a figmaKey fails to import (returns undefined), it may be a
path-style key instead of a hash. Check tokens.json — all keys must be 40-char
hex hashes. Fall back to hardcoded `$value` ONLY as a last resort, and flag it
in the build output so the user knows which tokens need key fixes.

**PREFER TEXT STYLES over individual variable bindings.** If the plan specifies a
`textStyleKey` on a text node, apply the composite text style instead of binding
fontSize/lineHeight/fills individually:

```javascript
// Preferred: apply text style (one call, full typography compliance)
if (node.textStyleKey) {
  const style = await figma.importStyleByKeyAsync(node.textStyleKey);
  text.textStyleId = style.id;
  // Still bind fills separately — text styles don't include color
  if (node.tokens?.fills) {
    const v = await figma.variables.importVariableByKeyAsync(node.tokens.fills.figmaKey);
    text.fills = [figma.variables.setBoundVariableForPaint(
      {type:'SOLID', color:{r:0,g:0,b:0}}, 'color', v
    )];
  }
}
```

Text styles give proper Figma compliance — the design panel shows the style name
instead of raw values, and changes to the library style propagate everywhere.
Only fall back to individual variable bindings when `tokens.json` has no `textStyles` section.

### type: "ellipse"

Create a circle/ellipse (for avatars, status dots):

```javascript
const ellipse = figma.createEllipse();
ellipse.resize(node.width, node.height);
// Bind fill from tokens
```

## Step 3: On-demand component extraction

If the plan references a component that needs a specific variant but
`components/<name>.json` doesn't exist yet:

1. Use `figma_get_library_components` with the component's figmaKey to get variant keys
2. Write `components/<name>.json` with the full variant map
3. Then instantiate the requested variant

This is the on-demand pattern — first use extracts, all future uses read from cache.

## Step 4: Batch execution strategy

Don't build one node at a time with individual MCP calls. Instead:

### Phase 1: Build all frames (1-2 figma_execute calls)
- Create the entire frame tree structure
- Apply all token bindings
- Set all text content
- Return a map of frame IDs

### Phase 2: Instantiate all library components (parallel figma_instantiate_component calls)
- Place each library component into its parent frame
- Can run multiple instantiations in parallel

### Phase 3: Configure instances (1-2 figma_execute calls)
- Set text overrides on all instances
- Set sizing (fill/hug) on all instances
- Reorder children if needed

### Phase 4: Screenshot and verify (1 call)
- Take a screenshot of the result
- Compare against the plan

This batching reduces total MCP calls from ~50+ (one per node) to ~5-8.

## Step 5: Screenshot and verify

```
Use figma_take_screenshot to capture the result.
```

Present the result:

> "Built **[plan name]** in Figma:
>
> - [N] library components instantiated
> - [N] frames created with token bindings
> - [N] text nodes set
> - [total] MCP calls used
>
> [screenshot]
>
> Does this match your plan? If anything needs adjustment, update `plan.json`
> and run `/build-design` again — or tell me what to change."

## Step 6: Handle issues

### Component instantiation fails
- Check if the variantKey is correct (variant key, not set key)
- Check if the library is accessible (Desktop Bridge running)
- If the component is unpublished, create a placeholder frame with a note

### Token binding fails
- Check if the figmaKey is a valid hash (not a variable name)
- Verify the library is enabled in the file
- Fall back to hardcoded values from tokens.json `$value` field

### Text override doesn't apply
- Library components may nest text nodes deeply
- Walk the full instance tree to find text nodes
- Load the correct font before setting characters
- Some components use component properties instead of direct text editing

### Plan is incomplete
- Don't improvise. Ask the user:
  > "The plan doesn't specify [missing detail]. What should I do?"

## How to use tokens.json for Figma operations

When you need to bind a design token to a Figma node via `figma_execute`:

1. Read `plan.json` — it already contains figmaKey for every token
2. Build a flat key map from all token references in the plan
3. Embed the key map in your `figma_execute` code
4. Use `figma.variables.importVariableByKeyAsync(key)` directly
5. NEVER scan collections — every key is pre-resolved in the plan

## Tone

You're a precise builder executing a blueprint. Report what you built, flag
what didn't work, show the result. No commentary on design choices — those
were made in `/plan-design`.
