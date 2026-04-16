# Build Phases

The build process is split into 5 sequential phases. Each phase has an entry
gate (prerequisite) and an exit gate (validation check). **Do not start a phase
until the previous phase's exit gate passes.**

## Overview

```
Phase 0: VALIDATE-KEYS → Verify every key in build.json is a usable Figma key
Phase 1: MANIFEST      → Parse build.json, create component checklist
Phase 2: SCAFFOLD      → Root frame + section frames (layout only, no content)
Phase 3: COMPONENTS    → Instantiate ALL library components from manifest
Phase 4: TOKEN-BUILT   → Fill gaps with token-built frames/text
Phase 5: VALIDATE      → Coverage check, text check, style check
```

## Phase 0: VALIDATE-KEYS (no Figma calls)

**Purpose**: Catch invalid keys before any Figma mutation. Path-style or
malformed keys silently break `setBoundVariable` and `instantiateComponent`,
producing partial frames the user must clean up. Phase 0 makes failures atomic.

**Entry gate**: build.json exists and has been read.

**Process**:
1. Walk every node in build.json
2. Collect every `tokenKey`, `figmaKey`, and `variantKey`
3. **Step A — Format check** (no Figma calls):
   - 40-char hex hash (regex: `^[a-f0-9]{40}$`)
   - Length exactly 40 characters
   - `figma_instantiate_component` nodes use `variantKey`, not `figmaKey`
   - Reject path-style strings (`Colors/Text/text-primary`, `color.primary.500`)
4. **Step B — Existence check** (one batched figma_execute call):
   - Resolve every format-passing key against current Figma state
   - `figma.variables.importVariableByKeyAsync(key)` for tokens
   - `figma.importComponentByKeyAsync(key)` for variants
   - Catches stale-but-well-formed keys (e.g., variable was deleted from library)
   - Batch in groups of 50 keys per call for large builds; 30s timeout
5. Aggregate all failures into a single report (categorize: `format-invalid` vs
   `format-valid-but-stale`)

**Exit gate**:
- ZERO invalid keys → log "Phase 0 passed — N keys validated" → proceed to Phase 1
- ANY invalid key → STOP. Print every invalid key with location, bad value,
  category, expected format. Offer recovery via AskUserQuestion:
  - **A) Re-run extraction** (best for stale keys)
  - **B) Patch inline** (walk each bad key, prompt for replacement, validate
    against Steps A+B, write back to build.json, resume Phase 1)
  - **C) Re-plan** from scratch
  - **D) Abort**

**Never silently substitute hardcoded values for invalid keys.** The "fall back
and flag" rule under Error Recovery only applies to runtime `setBoundVariable`
failures *after* a key passed Phase 0.

## Phase 1: MANIFEST (no Figma calls)

**Purpose**: Parse build.json into a flat checklist of everything to build.
This is the "bill of materials" that Phase 3 uses to instantiate components.

**Entry gate**: build.json exists and has been read.

**Process**:
1. Read `plans/<name>/build.json`
2. Walk every node in the tree
3. For each node, create a manifest entry:

```
MANIFEST:
  library-components:
    - [ ] Button (Primary lg) → variantKey: 42a689... → parent: Left Sidebar → text: "Post"
    - [ ] Button (Primary sm) → variantKey: c95b4b... → parent: Composer Actions → text: "Post"
    - [ ] Avatar (md placeholder) → variantKey: 25f76e... → parent: Compose Row
    - [ ] Horizontal tabs (Underline md) → variantKey: 2a3bc6... → parent: Center Feed
    - [ ] Input field (Icon leading) → variantKey: ??? → parent: Right Sidebar → placeholder: "Search"
    - [ ] Badge (Warning pill sm) → variantKey: 04ae58... → parent: Premium Title → text: "50% off"
    - [ ] Content divider (Text single) → variantKey: 6293e7... → parent: Center Feed (x3)
    ...

  icons:
    - [ ] home-01 → key: a3194a... → parent: Nav: Home → size: 24x24
    - [ ] search-md → key: 0a0013... → parent: Nav: Explore → size: 24x24
    - [ ] bell-01 → key: ea2ea8... → parent: Nav: Notifications → size: 24x24
    ...

  token-built:
    - [ ] X Logo placeholder → 28x28 frame, fg.primary fill
    - [ ] Tweet body text → text-sm, text-primary
    - [ ] Image placeholder → fill width, 280px, bg.tertiary, radius-xl
    ...

  text-overrides:
    - [ ] Post Button (sidebar) → "Post"
    - [ ] Post Button (composer) → "Post"
    - [ ] Subscribe Button → "Subscribe"
    - [ ] Tabs → ["For you", "Following"]
    ...
```

4. Count totals:
   - Library components: N
   - Icons: N
   - Token-built: N
   - Expected coverage: N / (N + N) = X%

**Exit gate**: Manifest is printed. Coverage projection is >= 30%. If below
30%, go back to the plan and find more library component matches.

**CRITICAL**: The manifest is not optional. Without it, the LLM will skip
components and build everything as frames. The manifest is the checklist
that Phase 3 works through item by item.


## Phase 2: SCAFFOLD (1-2 figma_execute calls)

**Purpose**: Create the empty frame structure — root frame and section frames
with correct sizing, spacing tokens, and fills. NO content yet.

**Entry gate**: Manifest exists.

**Process**:
1. One `figma_execute` call: create root frame, position on canvas
2. One `figma_execute` call per top-level section: create the section frame,
   set auto-layout direction, sizing mode, padding/gap tokens, fill/stroke

**What gets created**:
- Root frame (width, bg fill, horizontal layout)
- Section frames (sidebar, center, right rail, etc.)
- Sub-section frames if needed (composer area, tweet card container, etc.)

**What does NOT get created**:
- No text nodes
- No library components
- No icons
- No content of any kind

**Exit gate**: Screenshot the root. Verify:
- [ ] Correct number of columns/sections
- [ ] Correct widths (fixed vs fill)
- [ ] No phantom 100px heights
- [ ] Background fills and borders visible


## Phase 3: COMPONENTS (the critical phase)

**Purpose**: Instantiate every library component from the manifest. This is
the FIRST phase that adds visible content. Components go in BEFORE any
token-built frames.

**Entry gate**: Scaffold exists. Manifest exists.

**Process**: Work through the manifest checklist in order:

### 3a. Structural components first
These define the layout structure:
- Horizontal tabs
- Content dividers
- Page headers
- Section headers

For each:
1. `figma_instantiate_component` with the variantKey from the manifest
2. `figma_execute` to move it into its parent frame and set sizing
3. `figma_set_instance_properties` to set overrides
4. Check off the manifest entry

### 3b. Interactive components
These are the buttons, inputs, toggles:
- Buttons (all of them)
- Input fields
- Toggles, checkboxes, dropdowns

For each:
1. Instantiate with variantKey
2. Move into parent, set sizing
3. Set property overrides (disable Icon leading, Icon trailing, Label, Hint, etc.)
4. Set text content via `figma_set_instance_properties` or `sweepText`
5. Check off the manifest entry

### 3c. Data display components
These show content:
- Avatars
- Avatar groups
- Avatar label groups
- Badges
- Tags
- Metric items

For each:
1. Instantiate with variantKey
2. Move into parent, set sizing (FIXED for avatars, HUG for badges)
3. Set text overrides (names, labels)
4. Check off the manifest entry

### 3d. Icons
Instantiate every icon from the manifest:
- Nav icons
- Toolbar icons
- Action icons
- Status icons

For each:
1. `figma_instantiate_component` with the icon componentKey
2. Move into parent, set FIXED sizing at specified size (typically 24x24 or 20x20)
3. Check off the manifest entry

**Exit gate**: Count INSTANCE nodes in the tree.
- [ ] Instance count matches manifest total (library-components + icons)
- [ ] Every manifest entry is checked off
- [ ] Screenshot shows components are in the right positions
- [ ] No default text visible ("Olivia Rhye", "Label", "Button CTA")

**If instance count doesn't match, DO NOT proceed.** Find and add the missing
components before moving on.


## Phase 4: TOKEN-BUILT (fill the gaps)

**Purpose**: Add the remaining elements that have no library component match.
These should be the MINORITY of elements.

**Entry gate**: Phase 3 exit gate passed. All library components instantiated.

**Process**: Work through the token-built section of the manifest:
- Custom layout frames (tweet card body, trending items, etc.)
- Text content nodes (body text, headings, metadata, etc.)
- Image placeholders
- Custom shapes (floating action buttons, etc.)

For each text node, bind ALL of these tokens:
- `fontSize` via `setBoundVariable`
- `lineHeight` via `setBoundVariable`
- `fills` via `setBoundVariableForPaint`
- `textAutoResize = 'HEIGHT'` if the text should fill width

For each frame node, bind ALL spacing tokens:
- `paddingTop/Right/Bottom/Left` via `setBoundVariable`
- `itemSpacing` via `setBoundVariable`
- `cornerRadius` via `setBoundVariable` (use individual corners for asymmetric)

**ZERO hardcoded values.** Every pixel value must come from a token.

**Exit gate**:
- [ ] All manifest token-built entries checked off
- [ ] Screenshot looks complete
- [ ] No empty sections or missing content


## Phase 5: VALIDATE

**Purpose**: Final quality check before presenting to the user.

**Entry gate**: All phases 1-4 complete.

**Process**: Run these 5 checks:

### 5a. Component coverage check
```
Count INSTANCE nodes / (INSTANCE + FRAME + TEXT nodes) = coverage %
```
- >= 30%: Pass (social media feeds, dashboards)
- >= 50%: Good (settings pages, forms)
- >= 70%: Excellent (standard CRUD pages)
- Below 20%: FAIL — go back to Phase 3 and find missing components

### 5b. Text content check
Walk all TEXT nodes. Flag any that contain:
- "Olivia Rhye" or "olivia@untitledui.com"
- "Label" (exactly)
- "Button CTA"
- "Placeholder"
- "UX review presentations"
- "Lorem ipsum"
- Any text from the Untitled UI default content

### 5c. Property override check
Walk all INSTANCE nodes. For each Button, Input, Page header:
- Are icon properties disabled?
- Are Label/Hint/Help properties disabled (unless needed)?
- Are default texts replaced?

### 5d. Token binding check
Walk all FRAME nodes. For each:
- Does it have hardcoded padding/gap values? (should be token-bound)
- Does it have hardcoded fills? (should be variable-bound)

Walk all TEXT nodes. For each:
- Is fontSize bound to a variable? (should be)
- Is lineHeight bound to a variable? (should be)
- Is fill bound to a variable? (should be)

### 5e. Visual check
Take a final screenshot. Compare against the original brief/screenshot:
- [ ] Layout matches (columns, proportions, hierarchy)
- [ ] No phantom spacing or collapsed sections
- [ ] Text is readable and correctly sized
- [ ] Icons are visible (not zero-sized or hidden)

**Exit gate**: All 5 checks pass. Present to user with coverage stats.


## Why This Order Matters

The traditional build order (frames first, components later) fails because:

1. The LLM builds a complete-looking page out of frames
2. By the time it reaches "swap in components", the page looks done
3. Component swapping becomes optional cleanup, not structural

The phased order (scaffold → components → token-built) forces:

1. Empty page structure first (can't be tempted to add content)
2. Library components as the FIRST content — they define the visual quality
3. Token-built only fills gaps that components can't cover
4. Validation catches misses before the user sees the result

Think of it like building a house:
- Phase 2 = Foundation and framing
- Phase 3 = Windows, doors, fixtures (manufactured components)
- Phase 4 = Custom millwork (the stuff you have to build by hand)
- Phase 5 = Inspection
