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

**Build executes. Build does not decide.** All content, property overrides, batch
grouping, and font requirements are pre-resolved in `tasks.md`. If tasks.md exists,
read it and execute line by line. If tasks.md does not exist, fall back to parsing
build.json (legacy mode) but flag that tasks.md should be generated via `/plan`.

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
The phases are:

```
Phase 0: VALIDATE-KEYS → Verify every key in tasks.md/build.json is a usable Figma key
Phase 1: LOAD TASKS    → Read tasks.md (preferred) or parse build.json (legacy fallback)
Phase 2: SCAFFOLD      → Execute SCAFFOLD phase tasks (empty structure only)
Phase 3: COMPONENTS    → Execute COMPONENT phase tasks (library instances + icons)
Phase 4: TOKEN-BUILT   → Execute TOKEN-BUILT phase tasks (frames + text)
Phase 5: VALIDATE      → Execute VALIDATE phase checks
```

**CRITICAL: Do NOT start Phase 4 until Phase 3's exit gate passes.**
Phase 3 (components) must complete before Phase 4 (token-built). This
prevents the #1 build failure: building everything as frames and never
swapping in library components.

### Phase 0: VALIDATE-KEYS (before any Figma mutation)

Walk every `tokenKey`, `figmaKey`, and `variantKey` in `build.json` and verify
each is in the expected Figma format. Do this **before MANIFEST** so failures
are surfaced atomically — never start a build that will silently fall back to
hardcoded values mid-flight.

**Pre-resolved key shortcut:** If `design-system/components/index.json` has a
`variantKeys` map on a component entry, and the `build.json` references that
component by variant name (e.g., `"Size=lg, Hierarchy=Primary, Icon=Default,
State=Default"`), look up the 40-char hex key directly from `variantKeys` —
skip `figma_search_components` + `importComponentSetByKeyAsync` for that
component. This eliminates 5-15s per component lookup.

**Step A — Format check (always run, no Figma calls):**
- Must be a 40-char hex hash (e.g., `a1b2c3d4...`).
  Reject path-style strings like `Colors/Text/text-primary`,
  `color.primary.500`, or anything containing `/`, `.`, or non-hex characters.
- Length check: exactly 40 characters. Shorter or longer = invalid.
- Variant vs set check: nodes intended for `figma_instantiate_component`
  must carry a `variantKey` (individual variant), not a `figmaKey` (component
  set). Reject `figmaKey` on instantiation nodes.

**Step B — Existence check (one batched figma_execute call):**

Format-only validation misses stale-but-well-formed keys (e.g., a key was
correctly extracted six weeks ago but the variable has since been deleted from
the library). Resolve every format-passing key against Figma in a single batched
call:

```javascript
// Run via figma_execute — verify all keys resolve in current Figma state
const tokenKeys = [/* all tokenKey values from build.json */];
const variantKeys = [/* all variantKey values from build.json */];
const stale = { tokens: [], variants: [] };

for (const key of tokenKeys) {
  try {
    const v = await figma.variables.importVariableByKeyAsync(key);
    if (!v) stale.tokens.push(key);
  } catch (e) {
    stale.tokens.push({ key, error: e.message });
  }
}

for (const key of variantKeys) {
  try {
    const c = await figma.importComponentByKeyAsync(key);
    if (!c) stale.variants.push(key);
  } catch (e) {
    stale.variants.push({ key, error: e.message });
  }
}

return stale;
```

Batch in groups of 50 keys per call if the build is large. Use a 30s timeout.

**Exit gate (mandatory):**
- If ZERO invalid keys (format AND existence): log "Phase 0 passed — N keys
  validated" and proceed to Phase 1.
- If ANY invalid key: STOP. Do not run Phase 1. Print a single report listing
  every invalid key with: location in the build.json tree, bad value, the
  category (`format-invalid` vs `format-valid-but-stale`), and the expected
  format. Then offer the user a recovery path via AskUserQuestion:

  > "build.json has [N] invalid keys ([F] format-invalid, [S] stale).
  > How should I proceed?
  >
  > **A) Re-run extraction** — Run `/setup-tokens` and `/setup-components` to
  >    refresh keys, then re-run `/build`. Best for stale keys.
  > **B) Patch inline** — Tell me the corrected key for each bad entry; I'll
  >    update build.json in-place and proceed. Best for 1-3 typo fixes.
  > **C) Re-plan** — Run `/plan` to regenerate build.json from scratch.
  > **D) Abort** — Stop and let me investigate manually."

  - **If A**: stop the build, do not auto-run extraction (the user owns that step).
  - **If B**: walk each bad key one by one, prompt for the replacement, validate
    the replacement passes Steps A and B, write back to build.json, then resume
    Phase 1 from the top.
  - **If C/D**: stop cleanly, write nothing.

**Never silently substitute a hardcoded value for a missing or invalid key.**
The earlier "fall back and flag" rule under Error Recovery only applies to
runtime failures from `setBoundVariable` after a key passed Phase 0. Pre-build,
invalid keys are a hard stop with explicit user direction.

### Phase 1: LOAD TASKS (before touching Figma)

**Preferred**: Read `plans/<name>/tasks.md` and use it as the execution checklist.
Every task is pre-computed with exact text, overrides, batch groups, and figmaKeys.
Execute line by line — do not re-interpret, infer, or generate content.

**Legacy fallback**: If tasks.md does not exist, parse `build.json` manifest into
a flat checklist (library components, icons, token-built, coverage). Flag:
> "No tasks.md found — using build.json directly. Re-run `/plan` to generate
> tasks.md with pre-resolved overrides and content."

**This checklist is mandatory.** Without it, you WILL skip components.

### Phase 2: SCAFFOLD (1-3 figma_execute calls)

Create ONLY the empty frame structure: root, sections, sub-sections.
Set sizing, padding, gaps, fills. NO content, NO components, NO text.
Screenshot to verify proportions.

### Phase 2.5: COMPONENT PROBE (run ONCE before Phase 3)

Before processing the manifest, test library availability:
1. Pick the smallest component from the manifest (a Divider, Badge, or Icon)
2. `figma_instantiate_component` with its variantKey
3. **If it succeeds**: proceed to Phase 3 normally. Delete the test instance.
4. **If it times out**: set `componentMode = "token-built-only"`. Skip Phase 3.
   Go straight to Phase 4. Log: "Component probe timed out."

Never retry after a timeout. Timeouts are library-level, not component-level.
See `shared/error-recovery.md` for details.

### Phase 3: COMPONENTS (skip if probe timed out)

Work through the manifest checklist item by item:
1. **Structural**: Tabs, dividers, page headers, section headers
2. **Interactive**: Buttons, inputs, toggles, dropdowns
3. **Data display**: Avatars, avatar groups, badges, tags
4. **Icons**: Every icon from the manifest

**Batch rule:** If the manifest has N≥2 instances of the same `variantKey` in
the same parent (e.g., 4 metric cards in a KPI row, 3 avatar groups in a list),
do ONE `figma_execute` call that imports the component once via
`importComponentByKeyAsync(key)` then loops `.createInstance()` × N. Apply
per-instance overrides inside the same call. This eliminates N-1 round trips.

For EACH component (or batch of identical components):
- `figma_instantiate_component` with variantKey (or batch via `figma_execute`)
- Move into parent frame, set sizing
- **Combine boolean + text overrides in a single `figma_set_instance_properties`
  call.** Do NOT split boolean overrides and text overrides into separate calls.
  Two-call patterns per instance are a regression.
- Check off the manifest entry

**Search cache rule:** Maintain an in-context `searchCache: { query → result }`
map across the run. If you search for "Button" via `figma_search_components`
and get results, cache them. Re-searches for "Button" return cached. Cache is
per-session; not persisted.

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
/plan → plans/<name>/plan.md (human) + build.json (machine) + tasks.md (execution)
                ↓
/build Phase 0 → validates every key in tasks.md (40-char hex), STOPs on invalid
/build Phase 1 → reads tasks.md line by line (or build.json manifest as fallback)
/build Phase 2 → executes SCAFFOLD tasks (empty frames)
/build Phase 3 → executes COMPONENT tasks (library instances + icons)
/build Phase 4 → executes TOKEN-BUILT tasks (frames + text with pre-written content)
/build Phase 5 → executes VALIDATE tasks (coverage, text, overrides, tokens, visual)
```

**The key principle: plan decides, build executes.**

1. **tasks.md is the contract** — every task is pre-computed with exact strings, keys, overrides
2. **Tasks are flat and ordered** — not a nested tree that requires interpretation
3. **Each task maps to one API call** — no creative re-interpretation
4. **Gates block progression** — you can't skip Phase 3 and jump to Phase 4
5. **Build never generates content** — if text is missing from tasks.md, flag it, don't guess

See `build-helpers/tasks-template.md` for the task list format and
`build-helpers/build-phases.md` for the full phase specification.

## Helper Functions

Embed these in every `figma_execute` call that creates frames, text, or binds tokens.
Do NOT read from an external file — copy the helpers you need directly into the call.
(Figma's plugin sandbox cannot import from external files at runtime.)

**Canonical source**: `build-helpers/figma-helpers.js` — if updating helpers,
update both that file and the copies below.

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

1. **Find the right build files.** Check what exists:
   - `plans/<name>/tasks.md` — single-screen plan (preferred)
   - `plans/<name>/screens/` — multi-screen plan (check for per-screen files)

   **For multi-screen plans:** If the user specified a screen ("build the compose
   screen"), find `plans/<name>/screens/02-compose-tasks.md`. If they said just
   "/build", list available screens and ask which to build:

   > "This plan has [N] screens. Which should I build?
   > A) 01-inbox  B) 02-compose  C) All (sequential)"

   **For single-screen plans:** Read `plans/<name>/tasks.md` directly.

2. Read the plan from the located build.json (or tasks.md).
2. Load design system data following `shared/design-system-loading.md`.
   - **Also load**: `design-system/product.json` and `design-system/content-guide.md`
     if they exist (Tier 0 in the loading pattern). Use product terminology for
     all text content and content-guide.md voice patterns for any text you generate.
3. Check for `plans/<feature>/context.md` — if it exists, load shared decisions
   (header config, nav items, spacing rhythm). Every shared component must match
   the context exactly. Do not deviate from context.md decisions.
4. Find clear canvas space following `shared/canvas-positioning.md`.

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
4. `figma_set_instance_properties` to apply property overrides from the plan.
   The plan's `propertyOverrides` were resolved using the richness-aware
   precedence chain (see `plan/SKILL.md` "Richness-aware property resolution"):
   - If the plan says `Label=false`, disable it.
   - If the plan says `Featured icon=true` (because richness ≥ Standard and the
     archetype recommends it), enable it.
   - If the plan has NO `propertyOverrides` AND no richness context, fall back
     to the Lean defaults: disable Label, Hint text, Help icon, Actions.
   **If overrides fail silently**: check the error response — it lists available
   property names. Some libraries use emoji prefixes (e.g., `⬅️`, `➡️`, `🔀`).
   **Combine boolean + text overrides in a single call** when possible (see below).
5. Set text content on the instance (see "How to set text" below)

**NEVER skip property overrides.** Library components show labels, hints, icons
by default. If the plan has `propertyOverrides`, apply them exactly. If richness
is Standard+ and the plan enables decorative props, do NOT re-disable them — the
plan already resolved what should be on vs off for this richness level.

### How to set text on library components

**Content rules (build is a text executor, not a writer):**

**When tasks.md exists**: Every text string is pre-written in the task. Use the
exact literal string from the `text:` field. Do not modify, improve, or infer.
If a task has no `text:` field, leave the element with its default text and flag
it in the validation report.

**When tasks.md does NOT exist (legacy mode)**: Fall back to build.json text
overrides. If text is missing there too, use `content-guide.md` patterns and
`product.json` terminology to write copy. Flag all inferred text:
> "No tasks.md found — inferred [N] text strings. Re-run `/plan` to pre-resolve content."

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

## Phase 6: State Generation (optional — run when requested or via /design)

After the primary frame passes Phase 5 validation, generate state variants to
show how the screen behaves with different data conditions. Each state is a
cloned copy of the primary frame with targeted modifications.

### When to generate states

- **Always** when called from `/design` (the autonomous orchestrator)
- **On request** when the user asks for states, empty states, error states, etc.
- **Suggested** after any build — mention states as a next step

### State priority (when called from /design)

| Priority | State | Required? | What changes | Text source |
|---|---|---|---|---|
| 1 | **Empty / First-time** | **MANDATORY** | Lists empty, metrics show zero/dash, tables show 0 rows | `content-guide.md` emptyStatePattern |
| 2 | **Error / Recovery** | **MANDATORY** | Inline error banner at top, retry button visible | `content-guide.md` errorPattern |
| 3 | **Loading / Skeleton** | Optional | Content replaced with gray rectangle placeholders | No text — skeleton shapes |
| 4 | **Success / Confirmation** | Optional | Toast or banner confirming completed action | Brief confirmation |

If you can only build 2 states, build Empty + Error. These catch the most
common UX failures and are weighted highest in design audits.

### How to generate each state

1. **Clone the primary frame**: `figma_clone_node` on the root frame
2. **Rename**: "[Screen Name] — [State] State"
3. **Position**: Per `shared/canvas-positioning.md` — all states in a horizontal row, 100px gap between each frame, same y as primary
4. **Modify**: Walk the cloned frame and apply state-specific changes:
   - **Empty**: Find list/table sections → replace content with empty state (illustration + headline + CTA)
   - **Loading**: Find content sections → replace with gray rectangles (`fills: [{type:'SOLID', color:{r:0.92,g:0.92,b:0.93}}]`, `cornerRadius: 8`)
   - **Error**: Add an alert/banner component at the top of the content area
   - **Success**: Add a toast/notification at the top
5. **Screenshot** each state for validation

### Content for states

If `design-system/content-guide.md` exists, use its patterns:
- Empty state headline: follow `emptyStatePattern`
- Error message: follow `errorPattern`
- Success message: brief confirmation

If `design-system/product.json` exists, use product terminology:
- "No [product-specific items] yet" (not "No items yet")
- "Create your first [product term]" (not "Add item")

## Definition of Done

Before presenting the build to the user, verify ALL of these:

1. [ ] Every section has been screenshotted and checked
2. [ ] Every library component from the plan was instantiated (count INSTANCE nodes)
3. [ ] Every library component has property overrides applied (no unwanted labels/hints/icons)
4. [ ] All text shows domain-specific content (no "Olivia Rhye", "Label", "UX review presentations")
4a. [ ] If `content-guide.md` exists, every generated string follows its voice + terminology rules
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
