# Build Tasks: [FEATURE NAME]

**Input**: `plans/[feature]/build.json`, `design-system/components/index.json`, `design-system/tokens.json`
**Output**: Ordered task list for `/build` to execute mechanically — zero runtime decisions.

This file is the **execution contract** between `/plan` and `/build`.
Every decision — content, overrides, batching, fonts — is pre-computed.
Build reads this top-to-bottom and executes. If a field is missing, build
flags it; build never infers.

## Header

```markdown
# Build Tasks: [Feature Name]

**Plan**: plans/[feature]/build.json
**Coverage**: [N] library + [N] icons + [N] token-built = [N]% ([total] elements)
**Fonts required**: Inter (Regular, Medium, Semi Bold, Bold)
**Canvas origin**: scan
```

- **Coverage**: Pre-counted from build.json manifest
- **Fonts required**: All font families + styles needed (plan scans all text nodes)
- **Canvas origin**: `scan` (runtime canvasScan) or fixed `(X, Y)` if known

## Format: `[ID] [Phase] [Type] Description`

- **ID**: Unique (S001, C001, I001, T001, V001)
- **Phase**: SCAFFOLD | COMPONENT | ICON | TOKEN-BUILT | VALIDATE
- **Type**: frame | library | library×N | icon | text | check
- Every task maps to one or a small batch of Figma API calls
- Text content is LITERAL — the exact string to set, not a description

---

## Phase 1: SCAFFOLD (Layout Structure)

**Purpose**: Create empty frame skeleton. No content.

```markdown
- [ ] S001 [frame] Root "Page Name" — 1440×auto, HORIZONTAL, fill: bg-primary (b6157f...)
- [ ] S002 [frame] "Left Sidebar" → Root — 275px FIXED, VERTICAL, pad: spacing-xl (f4d6b3...), gap: spacing-md (cc421a...), stroke-right: border-secondary (eaa71a...)
- [ ] S003 [frame] "Center Content" → Root — FILL, VERTICAL, pad: spacing-4xl (284dba...), gap: spacing-3xl (ac8c94...)
- [ ] S004 [frame] "Right Panel" → Root — 350px FIXED, VERTICAL, pad: spacing-xl (f4d6b3...), gap: spacing-xl (f4d6b3...)
- [ ] S005 [check] Screenshot → verify columns, correct widths, no phantom 100px heights
```

**Gate**: All section frames exist with correct sizing. No content yet.

---

## Phase 2: COMPONENTS (Library Instances)

**Purpose**: Instantiate every library component. Text content is pre-written.

### Notation

- `[library]` — single component instance
- `[library×N]` — batch: N instances of same variantKey in same parent (one `figma_execute` call)
- `vk:` — variantKey (40-char hex for `figma_instantiate_component`)
- `→` — parent frame
- `overrides:` — exact property names and values for `figma_set_instance_properties`
- `text:` — exact text property values (literal strings, not descriptions)

### Example tasks

```markdown
### 2a. Structural (batch: 3× Content divider in Center Content)
- [ ] C001 [library] Horizontal tabs → vk:2a3bc6... → Center Content → FILL width
  - overrides: { }
  - text: { "Tab 1": "For you", "Tab 2": "Following" }
- [ ] C002 [library×3] Content divider → vk:6293e7... → Center Content → FILL width
  - batch: 3 instances, same parent, same variantKey

### 2b. Interactive
- [ ] C003 [library] Button Primary lg → vk:42a689... → Left Sidebar → FILL width
  - overrides: { "⬅️ Icon leading": false, "➡️ Icon trailing": false }
  - text: { "Button": "Post" }
- [ ] C004 [library] Input field Icon leading md → vk:ff6a9c... → Right Panel → FILL width
  - overrides: { "Label": false, "Hint text": false, "Help icon": false, "Supporting text": false }
  - text: { "Placeholder": "Search" }

### 2c. Data Display
- [ ] C005 [library] Avatar md → vk:25f76e... → Compose Row → 40×40 FIXED
- [ ] C006 [library] Badge sm Pill Warning → vk:04ae58... → Premium Title → HUG
  - text: { "Text": "50% off" }

### 2d. Icons
- [ ] I001 [icon] home-01 → key:a3194a... → Nav: Home → 24×24
- [ ] I002 [icon] search-md → key:0a0013... → Nav: Explore → 24×24
- [ ] I003 [icon] bell-01 → key:ea2ea8... → Nav: Notifications → 24×24

- [ ] C_CHECK [check] Instance count = [expected total] → screenshot shows components in place
```

**Gate**: Instance count matches expected. No default text visible.

---

## Phase 3: TOKEN-BUILT (Gap Filler)

**Purpose**: Add remaining elements that have no library component match.
Every text string is literal. Every token is pre-resolved with figmaKey.

### Text content (literal strings — build sets these exactly)

```markdown
- [ ] T001 [text] "AI Designer" → Semi Bold, text-sm (fs:abc123...), text-primary (fill:def456...) → User Text → FILL width
- [ ] T002 [text] "@aihypedesigner" → Regular, text-sm (fs:abc123...), text-tertiary (fill:789abc...) → User Text → FILL width
- [ ] T003 [text] "What's happening?" → Regular, text-lg (fs:bcd234...), text-placeholder (fill:cde567...) → Compose Row → FILL width
```

### Custom frames (structural wrappers only)

```markdown
- [ ] T016 [frame] X Logo placeholder → 28×28, fill: fg-primary (3c34d4...), radius: radius-xs (1c5578...)
- [ ] T017 [frame] Nav item row → HORIZONTAL, FILL, gap: spacing-lg (489173...), pad-y: spacing-md (cc421a...)
- [ ] T018 [frame] Image placeholder → FILL width, 280px height, fill: bg-tertiary (890abc...), radius: radius-xl (def012...)
```

### Token binding verification

```markdown
- [ ] T_CHECK [check] Walk all FRAME nodes → verify padding/gap use setBoundVariable
- [ ] T_CHECK2 [check] Walk all TEXT nodes → verify fontSize/lineHeight/fill are token-bound
```

**Gate**: All content visible. No placeholder text remains. Zero hardcoded values.

---

## Phase 4: VALIDATE

```markdown
- [ ] V001 [check] Coverage: INSTANCE / (INSTANCE + FRAME + TEXT) ≥ 30%
- [ ] V002 [check] Text: no "Olivia Rhye", "Label", "Button CTA", "Lorem ipsum", "UX review presentations"
- [ ] V003 [check] Overrides: all Buttons have icon props set, all Inputs have Label set
- [ ] V004 [check] Tokens: zero hardcoded padding/gap/fill values
- [ ] V005 [check] Visual: screenshot matches plan.md ASCII layout
- [ ] V006 [check] Present coverage stats + final screenshot to user
```

---

## Key rules for tasks.md generation (/plan Step 6)

1. **All text is literal.** Write the exact string, not "appropriate heading text."
2. **All overrides use exact property names.** Resolve from components/index.json
   including emoji prefixes (⬅️, ➡️, 🔀). Case-sensitive.
3. **All token keys are 40-char hex.** Include inline with the task.
4. **Batch groups are pre-computed.** If N≥2 instances share variantKey + parent,
   mark as `[library×N]` with `batch:` annotation.
5. **Fonts are listed in header.** Scan all text tasks to collect unique font families + styles.
6. **Coverage is pre-counted.** Sum library + icons + token-built from manifest.

## Execution order

```
Phase 1 (SCAFFOLD) → must complete before Phase 2
Phase 2 (COMPONENTS) → must complete before Phase 3
Phase 3 (TOKEN-BUILT) → must complete before Phase 4
Phase 4 (VALIDATE) → gates final presentation
```

Within each phase, tasks with the same parent can be batched
into a single `figma_execute` call.
