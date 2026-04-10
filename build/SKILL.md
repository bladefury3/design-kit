---
name: build
description: |
  Execute a plan from plans/ in Figma. Builds ONE SECTION AT A TIME with a
  screenshot check after each. Use after plan.
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

Build a plan from `plans/` in Figma using **5 enforced phases**.

## Tool Selection

Read `shared/tool-selection.md` for the full decision tree. The critical rules:

- **Library component** → `figma_instantiate_component` (NEVER `figma_execute`)
- **Token-built frame** → `figma_execute` with `mkF()` helper
- **Setting text on instance** → `figma_set_instance_properties` (NEVER tree walk via `figma_execute`)
- **Toggling boolean props** → `figma_set_instance_properties`
- **Setting fills/strokes** → `figma_set_fills` / `figma_set_strokes` (or `bf()`/`bs()` inside `figma_execute`)

**CRITICAL: variantKey vs figmaKey**

`figma_instantiate_component` requires a **variantKey** (individual variant),
NOT a **figmaKey** (component set). The plan's `build.json` should have
`variantKey` on every library-component node. If it has `figmaKey` instead,
the instantiation will fail or produce the wrong variant.

Check `design-system/components/index.json`: use `defaultVariantKey`, not `figmaKey`.

## The Rule

**Components first. Frames fill gaps. Validate before presenting.**

Read `build-helpers/build-phases.md` for the full phase specification.
The 5 phases are:

```
Phase 1: MANIFEST     → Parse build.json into a component checklist
Phase 2: SCAFFOLD     → Root frame + section frames (empty structure only)
Phase 3: COMPONENTS   → Instantiate ALL library components from manifest
Phase 4: TOKEN-BUILT  → Fill remaining gaps with frames/text
Phase 5: VALIDATE     → Coverage, text, property, token binding checks
```

**CRITICAL: Do NOT start Phase 4 until Phase 3's exit gate passes.**
Phase 3 (components) must complete before Phase 4 (token-built). This
prevents the #1 build failure: building everything as frames and never
swapping in library components.

### Phase 1: MANIFEST (before touching Figma)

Parse `build.json` and print a flat checklist of every element to build:
- Library components (with variantKey, parent section, text overrides)
- Icons (with componentKey, parent, size)
- Token-built elements (with justification for why no component fits)
- Expected coverage percentage

**This checklist is mandatory.** Without it, you WILL skip components.

### Phase 2: SCAFFOLD (1-3 figma_execute calls)

Create ONLY the empty frame structure: root, sections, sub-sections.
Set sizing, padding, gaps, fills. NO content, NO components, NO text.
Screenshot to verify proportions.

### Phase 3: COMPONENTS (the critical phase)

Work through the manifest checklist item by item:
1. **Structural**: Tabs, dividers, page headers, section headers
2. **Interactive**: Buttons, inputs, toggles, dropdowns
3. **Data display**: Avatars, avatar groups, badges, tags
4. **Icons**: Every icon from the manifest

For EACH component:
- `figma_instantiate_component` with variantKey
- Move into parent frame, set sizing
- `figma_set_instance_properties` for overrides
- Set text content
- Check off the manifest entry

**Exit gate**: Count INSTANCE nodes. Must match manifest total.
If not, find and add missing components before proceeding.

### Phase 4: TOKEN-BUILT (fill gaps)

ONLY NOW add token-built frames and text for elements with no library match.
Bind ALL values to tokens — zero hardcoded pixels.

### Phase 5: VALIDATE

Run 5 checks (coverage, text, overrides, tokens, visual). Present results.

## Relationship to /plan

The build process depends on `/plan` output. The pipeline is:

```
/plan → plans/<name>/plan.md + build.json (with manifest)
                ↓
/build Phase 1 → reads manifest from build.json → prints task checklist
/build Phase 2 → creates scaffold (empty frames)
/build Phase 3 → instantiates components from manifest checklist
/build Phase 4 → fills gaps with token-built frames/text
/build Phase 5 → validates and presents
```

This mirrors spec-kit's `/speckit.specify` → `/speckit.plan` → `/speckit.tasks`
→ `/speckit.implement` pipeline. The key insight borrowed from spec-kit:

1. **Specifications drive implementation** — the manifest is the source of truth
2. **Tasks are flat and ordered** — not a nested tree that requires interpretation
3. **Each task has one API call** — no creative re-interpretation
4. **Gates block progression** — you can't skip Phase 3 and jump to Phase 4

See `build-helpers/tasks-template.md` for the task list format and
`build-helpers/build-phases.md` for the full phase specification.

## Helper Functions

Embed these in every `figma_execute` call that creates frames, text, or binds tokens.
Do NOT read from an external file — copy the helpers you need directly into the call.

```javascript
// === EMBED THESE IN EVERY figma_execute CALL ===

// Import tokens from a flat key map
async function importTokens(keys) {
  const vars = {};
  for (const [alias, key] of Object.entries(keys))
    vars[alias] = await figma.variables.importVariableByKeyAsync(key);
  return vars;
}

// Bind fill/stroke
function bf(node, variable) {
  node.fills = [figma.variables.setBoundVariableForPaint(
    {type:'SOLID', color:{r:0,g:0,b:0}}, 'color', variable)];
}
function bs(node, variable) {
  node.strokes = [figma.variables.setBoundVariableForPaint(
    {type:'SOLID', color:{r:0,g:0,b:0}}, 'color', variable)];
  node.strokeWeight = 1;
}

// Create frame with correct sizing (prevents 100px bug)
function mkF(parent, name, dir, wS, hS) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir || 'VERTICAL';
  f.fills = [];
  f.clipsContent = false;
  if (parent) {
    parent.appendChild(f);
    f.layoutSizingHorizontal = wS || 'HUG';
    f.layoutSizingVertical = hS || 'HUG';
  }
  return f;
}

// Create text with token bindings (prevents text clipping)
function mkT(parent, content, style, fillVar, fsVar, lhVar, hug) {
  const t = figma.createText();
  t.fontName = {family: 'Inter', style: style || 'Regular'};
  t.characters = content;
  parent.appendChild(t);
  t.layoutSizingHorizontal = hug ? 'HUG' : 'FILL';
  t.layoutSizingVertical = 'HUG';
  t.setBoundVariable('fontSize', fsVar);
  t.setBoundVariable('lineHeight', lhVar);
  bf(t, fillVar);
  return t;
}

// Find clear canvas space
function canvasScan() {
  const children = figma.currentPage.children;
  const selection = figma.currentPage.selection;
  let originX = 0, originY = 0;
  if (selection.length > 0) {
    const sel = selection[0];
    originX = sel.x + sel.width + 300;
    originY = sel.y;
  } else if (children.length > 0) {
    let maxRight = -Infinity;
    for (const child of children) {
      const right = child.x + child.width;
      if (right > maxRight) maxRight = right;
    }
    originX = maxRight + 300;
  }
  return { originX, originY };
}
```

## Before you begin

1. Read the plan from `plans/<name>/build.json` (or `plans/<name>.json`).
2. Load design system data following `shared/design-system-loading.md`.
3. Find clear canvas space following `shared/canvas-positioning.md`.

## How to build

### Step 1: Create the root frame

One `figma_execute` call. Create the root frame with the page background,
set its width, position it on the canvas. Nothing else.

```javascript
const root = figma.createFrame();
root.name = 'Page Name';
root.layoutMode = 'HORIZONTAL';
root.resize(1440, 1);  // height=1, NOT 100
root.clipsContent = false;
root.layoutSizingVertical = 'HUG';
// bind bg fill, set padding/gap, position at originX/originY
```

### Step 2: Build each section separately

For each top-level section in the plan (left sidebar, center feed, right sidebar),
do ONE `figma_execute` call that:

1. Creates the section frame
2. Appends it to root
3. Sets sizing AFTER append (FILL or fixed width)
4. Creates ONLY the token-built frames and text inside this section
5. Leaves placeholder slots where library components go

**Keep each call under 15 elements.** If a section has more, split it into
sub-sections (e.g., build the feed composer separately from the feed posts).

### Step 3: Instantiate library components into each section

For each library component in the plan:

1. `figma_instantiate_component` with the `variantKey` from the plan
2. Move it into its parent frame
3. Set sizing (FILL/HUG) AFTER it's in the parent
4. `figma_set_instance_properties` to disable unwanted properties:
   - Input field: `Label=false`, `Hint text=false`, `Help icon=false` (unless plan says otherwise)
   - Page header: `Search=false`, `Actions=false`
   - Button: `Icon leading=false`, `Icon trailing=false`
   - Avatar label group: set subtitle text to empty if not needed
5. Set text content on the instance (see "How to set text" below)

**NEVER skip property overrides.** Library components show labels, hints, icons
by default. If the plan has `propertyOverrides`, apply them. If not, disable
Label, Hint text, Help icon, and Actions as defaults.

### How to set text on library components

**Preferred: Use figma_set_instance_properties for TEXT properties.**
Many components expose text as component properties (e.g., "Label text",
"Placeholder", "Supporting text"). These are reliable — they use the
component's property API, not string matching.

```
figma_set_instance_properties with:
  nodeId: the instance ID
  properties: { "Label text": "New Label", "Placeholder": "Search..." }
```

Combine boolean and text overrides in a single call when possible:

```
figma_set_instance_properties with:
  nodeId: the instance ID
  properties: {
    "Label": false,
    "Hint text": false,
    "Help icon": false,
    "Placeholder": "Enter your email"
  }
```

**Fallback: Walk the instance tree (section-aware).**
If the component doesn't expose text as properties, find text nodes by
walking the instance's children. ALWAYS scope the walk to one specific
instance — never walk the entire page tree.

### Step 4: Screenshot after each section

After building each section + its components:

```
figma_take_screenshot of the root frame
```

Check:
- Does the section look right?
- Are there 100px phantom heights? (frame with unexpected whitespace)
- Are library components showing unwanted labels or icons?
- Is the text correct (not "Olivia Rhye" or "Label")?

**If anything is wrong, fix it NOW.** Don't move to the next section.

### Step 5: Present the result

After all sections are built and verified:

> "Built **[plan name]** in Figma:
> - [N] sections built and verified
> - [N] library components instantiated
> - [N] property overrides applied
>
> [screenshot]"

## Figma API rules (prevents the bugs we keep hitting)

1. **Height 1, not 100**: `frame.resize(width, 1)` — auto-layout HUG expands it.
   Never `resize(width, 100)`.

2. **Append before sizing**: `parent.appendChild(frame)` FIRST, then
   `frame.layoutSizingHorizontal = 'FILL'`. The other order throws an error.

3. **clipsContent = false**: Set on every frame. Prevents content from being
   silently hidden.

4. **Property overrides on every component**: `figma_set_instance_properties`
   after every `figma_instantiate_component`. Never skip this.

5. **Section-aware text sweeps**: When replacing "Olivia Rhye" with a real name,
   find the specific component instance in the specific section — don't walk the
   entire tree. The same component type in different sections needs different names.

6. **One section at a time**: Build sidebar → screenshot → fix. Then feed →
   screenshot → fix. Then right sidebar → screenshot → fix. Not all at once.

7. **NEVER hardcode spacing values.** If you write `paddingTop = 24` or
   `itemSpacing = 16`, you're bypassing the design system. Every padding,
   gap, and spacing MUST use `setBoundVariable` with a token from the plan:
   ```javascript
   frame.setBoundVariable('paddingTop', V['s.3xl']);
   frame.setBoundVariable('itemSpacing', V['s.xl']);
   ```
   If `setBoundVariable` fails, diagnose the error — don't fall back to
   hardcoded values. Common fix: ensure the value is a variable object
   (from `importVariableByKeyAsync`), not a string or ID.

8. **NEVER use emoji as icons.** Emoji (🟥, 📘, 🎮, 🤖, 🟢) are text
   characters, not design components. Every icon in the design must be a
   library icon component instantiated via `figma_instantiate_component`.
   The plan's build.json should have resolved every icon to a component key
   in its resolution pass. If an icon key is missing from the plan, search
   the library at build time — don't substitute with emoji.

9. **Icons are library components, not ellipses.** Never use
   `figma.createEllipse()` for an icon. Icons exist in the library as
   standalone components (24x24). Instantiate them like any other component.

## Definition of Done

Before presenting the build to the user, verify ALL of these:

1. [ ] Every section has been screenshotted and checked
2. [ ] Every library component from the plan was instantiated (count INSTANCE nodes)
3. [ ] Every library component has property overrides applied (no unwanted labels/hints/icons)
4. [ ] All text shows domain-specific content (no "Olivia Rhye", "Label", "UX review presentations")
5. [ ] No frames are stuck at 100px height (check for phantom whitespace)
8. [ ] All spacing/padding uses setBoundVariable with tokens (no hardcoded pixel values)
9. [ ] Zero emoji used as icons (no 🟥, 📘, 🎮 — all icons are library components)
10. [ ] Every icon from the plan was instantiated as a library component (not an ellipse)
6. [ ] Root frame is positioned at originX (not overlapping existing content at 0,0)
7. [ ] clipsContent is false on all frames (no silently hidden content)

If ANY check fails, fix it before presenting. The designer should never
have to ask "why does this input have a label?" or "why does it say Olivia Rhye?"

## Error Recovery

Follow `shared/error-recovery.md` for all error handling. The most common
build failures and their fixes:

### "Instance not found" or wrong variant appears
The key is a `figmaKey` (component set), not a `variantKey` (individual variant).
Check `design-system/components/index.json` — use `defaultVariantKey`.
If keys are stale, re-search: `figma_search_components` with the component name.

### Property overrides have no effect
Property names are case-sensitive. Use `figma_get_component_details` to see
actual property names. `figma_set_instance_properties` handles `#nodeId`
suffixes automatically, but the base name must match exactly.

### Token binding fails
Fall back to hardcoded value AND flag it:
> "Token `spacing.xl` binding failed — used hardcoded `24px` instead.
> Re-run `/setup-tokens` to refresh token keys."

Never silently use hardcoded values.

### figma_execute timeout
Split the operation. Max 10-15 elements per call. Increase timeout to 15-20s
for complex sections. Never exceed 25s.

## Screenshot Validation

Follow `shared/screenshot-validation.md` after every section build.
Follow `shared/placeholder-detection.md` for text content checks.

## Tone

Report what you built, section by section. Show a screenshot after each major
section. Flag what doesn't look right. Don't present a "complete" build that
has obvious problems.
