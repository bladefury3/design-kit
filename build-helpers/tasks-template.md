# Build Tasks: [FEATURE NAME]

**Input**: `plans/[feature]/build.json`, `design-system/components/index.json`, `design-system/tokens.json`
**Output**: Ordered task list for `/build` to execute mechanically

## Format: `[ID] [Phase] [Type] Description`

- **Phase**: SCAFFOLD | COMPONENT | ICON | TOKEN | TEXT | VALIDATE
- **Type**: frame | library | icon | text | check
- Every task has an exact Figma API call or validation step

---

## Phase 1: SCAFFOLD (Layout Structure)

**Purpose**: Create empty frame skeleton. No content.

- [ ] S001 [frame] Create root frame "Page Name" (1440 x auto, HORIZONTAL, bg-primary)
- [ ] S002 [frame] Create "Left Sidebar" (275px FIXED, VERTICAL, padding: spacing-xl, border-right)
- [ ] S003 [frame] Create "Center Feed" (FILL, VERTICAL, border-right)
- [ ] S004 [frame] Create "Right Sidebar" (350px FIXED, VERTICAL, padding: spacing-xl)
- [ ] S005 [frame] Create sub-frames: "Nav Items", "Composer", "Tweet Card", "Premium CTA", etc.
- [ ] S006 [check] Screenshot root → verify 3 columns, correct widths, no phantom heights

**Gate**: All section frames exist with correct sizing. No content yet.

---

## Phase 2: COMPONENTS (Library Instances)

**Purpose**: Instantiate every library component. This is the FIRST content added.

### 2a. Structural Components

- [ ] C001 [library] Horizontal tabs → variantKey: 2a3bc6... → parent: Center Feed → FILL width
- [ ] C002 [library] Content divider → variantKey: 6293e7... → parent: Center Feed (x3) → FILL width
- [ ] C003 [library] Input field (Icon leading md) → variantKey: ??? → parent: Right Sidebar → FILL width
  - Override: Label=false, Hint text=false, Help icon=false, Required=false
  - Text: placeholder → "Search"

### 2b. Interactive Components

- [ ] C004 [library] Button (Primary lg) → variantKey: 42a689... → parent: Left Sidebar → FILL width
  - Override: Icon leading=false, Icon trailing=false
  - Text: "Post"
- [ ] C005 [library] Button (Primary sm) → variantKey: c95b4b... → parent: Composer Actions → HUG width
  - Override: Icon leading=false, Icon trailing=false
  - Text: "Post"
- [ ] C006 [library] Button (Primary md) → variantKey: c7b6f1... → parent: Premium CTA → HUG width
  - Override: Icon leading=false, Icon trailing=false
  - Text: "Subscribe"

### 2c. Data Display Components

- [ ] C007 [library] Avatar (md placeholder) → variantKey: 25f76e... → parent: Compose Row → 40x40 FIXED
- [ ] C008 [library] Avatar (md placeholder) → variantKey: 25f76e... → parent: Tweet Card → 40x40 FIXED
- [ ] C009 [library] Avatar (md placeholder) → variantKey: 25f76e... → parent: User Row → 40x40 FIXED
- [ ] C010 [library] Verified tick (xs) → variantKey: 955620... → parent: Tweet Header → 16x16 FIXED
- [ ] C011 [library] Badge (sm Warning pill) → variantKey: 04ae58... → parent: Premium Title → HUG
  - Text: "50% off"
- [ ] C012 [library] Avatar group (xs) → variantKey: 526117... → parent: News Meta (x3) → HUG

- [ ] C013 [check] Count INSTANCE nodes → expected: 15+ → if less, find missing components

**Gate**: Instance count matches expected. Screenshot shows components in place.

---

## Phase 3: ICONS (Library Icon Instances)

**Purpose**: Instantiate every icon as a library component. Never use frame placeholders.

### 3a. Sidebar Navigation Icons

- [ ] I001 [icon] home-01 → key: a3194a... → parent: Nav: Home → 24x24
- [ ] I002 [icon] search-md → key: 0a0013... → parent: Nav: Explore → 24x24
- [ ] I003 [icon] bell-01 → key: ea2ea8... → parent: Nav: Notifications → 24x24
- [ ] I004 [icon] user-plus-01 → key: 2acbea... → parent: Nav: Follow → 24x24
- [ ] I005 [icon] message-chat-square → key: 70ae62... → parent: Nav: Chat → 24x24
- [ ] I006 [icon] stars-02 → key: 886edd... → parent: Nav: Grok → 24x24
- [ ] I007 [icon] bookmark → key: 5e553e... → parent: Nav: Bookmarks → 24x24
- [ ] I008 [icon] pencil-line → key: 04d6fb... → parent: Nav: Creator Studio → 24x24
- [ ] I009 [icon] stars-02 → key: 886edd... → parent: Nav: Premium → 24x24
- [ ] I010 [icon] user-01 → key: 1b8e4f... → parent: Nav: Profile → 24x24
- [ ] I011 [icon] dots-horizontal → key: 8bd7cc... → parent: Nav: More → 24x24

### 3b. Composer Toolbar Icons

- [ ] I012 [icon] image-01 → key: 52e13d... → parent: Icon Toolbar → 20x20
- [ ] I013 [icon] gift-01 → key: a8dfa1... → parent: Icon Toolbar → 20x20
- [ ] I014 [icon] bar-chart-01 → key: 075a0c... → parent: Icon Toolbar → 20x20
- [ ] I015 [icon] calendar → key: 6487a0... → parent: Icon Toolbar → 20x20
- [ ] I016 [icon] face-smile → key: cd2890... → parent: Icon Toolbar → 20x20
- [ ] I017 [icon] marker-pin-01 → key: 30d285... → parent: Icon Toolbar → 20x20
- [ ] I018 [icon] flag-01 → key: 39e6fd... → parent: Icon Toolbar → 20x20

### 3c. Tweet Engagement Icons

- [ ] I019 [icon] message-circle-01 → key: cd4296... → parent: Comment counter → 18x18
- [ ] I020 [icon] repeat-01 → key: b4ae3f... → parent: Retweet counter → 18x18
- [ ] I021 [icon] heart-rounded → key: 319db1... → parent: Heart counter → 18x18
- [ ] I022 [icon] bar-chart-01 → key: 075a0c... → parent: Views counter → 18x18
- [ ] I023 [icon] bookmark → key: 5e553e... → parent: Actions → 18x18
- [ ] I024 [icon] share-07 → key: 16f786... → parent: Actions → 18x18

### 3d. Right Sidebar Icons

- [ ] I025 [icon] x-close → key: 5241e4... → parent: News Header → 20x20

- [ ] I026 [check] Count all INSTANCE nodes (components + icons) → expected: 40+

**Gate**: All icons are library instances. Zero frame placeholders remain for icons.

---

## Phase 4: TOKEN-BUILT (Gap Filler)

**Purpose**: Add remaining elements that have no library component match.

### 4a. Text Content

- [ ] T001 [text] "AI Designer" → Semi Bold, text-sm, text-primary → parent: User Text
- [ ] T002 [text] "@aihypedesigner" → Regular, text-sm, text-tertiary → parent: User Text
- [ ] T003 [text] "What's happening?" → Regular, text-lg, text-placeholder → parent: Compose Row
- [ ] T004 [text] "Guri Singh" → Semi Bold, text-sm, text-primary → parent: Tweet Header
- [ ] T005 [text] "@heygurisingh · Apr 4" → Regular, text-sm, text-tertiary → parent: Tweet Header
- [ ] T006 [text] Tweet body (multi-line) → Regular, text-sm, text-primary → parent: Tweet Content
- [ ] T007 [text] "Show more" → Regular, text-sm, text-brand-tertiary → parent: Tweet Content
- [ ] T008 [text] Engagement counters: "103", "485", "4K", "433K" → Regular, text-xs, text-tertiary
- [ ] T009 [text] "Subscribe to Premium" → Bold, text-lg, text-primary → parent: Premium CTA
- [ ] T010 [text] Premium description → Regular, text-sm, text-secondary → parent: Premium CTA
- [ ] T011 [text] News headlines (x3) → Semi Bold, text-sm, text-primary
- [ ] T012 [text] News metadata (x3) → Regular, text-xs, text-tertiary
- [ ] T013 [text] "Today's News" → Bold, text-lg, text-primary
- [ ] T014 [text] "What's happening" → Bold, text-lg, text-primary
- [ ] T015 [text] Trending items (titles + categories) → Semi Bold/Regular, text-sm/text-xs

### 4b. Custom Frames

- [ ] T016 [frame] X Logo placeholder → 28x28, fg-primary fill, radius-xs
- [ ] T017 [frame] 11 nav item rows → HORIZONTAL, icon + text, itemSpacing: spacing-lg
- [ ] T018 [frame] Tweet image placeholder → FILL width, 280px height, bg-tertiary, radius-xl
- [ ] T019 [frame] Engagement row → HORIZONTAL, SPACE_BETWEEN
- [ ] T020 [frame] Counter pairs (x4) → HORIZONTAL, icon + text, itemSpacing: spacing-xs
- [ ] T021 [frame] Premium CTA card → border, radius-2xl, padding: spacing-xl
- [ ] T022 [frame] Today's News card → border, radius-2xl, padding: spacing-xl
- [ ] T023 [frame] What's happening card → border, radius-2xl, padding: spacing-xl
- [ ] T024 [frame] Search bar container (if Input field replaces this, skip)

### 4c. Token Binding Verification

- [ ] T025 [check] Walk all FRAME nodes → verify padding/gap use setBoundVariable (no hardcoded px)
- [ ] T026 [check] Walk all TEXT nodes → verify fontSize/lineHeight/fill are token-bound

**Gate**: All content visible. No placeholder text remains.

---

## Phase 5: VALIDATE

- [ ] V001 [check] Component coverage: count INSTANCE / (INSTANCE + FRAME + TEXT) → report %
- [ ] V002 [check] Text check: no "Olivia Rhye", "Label", "Button CTA", "Lorem ipsum"
- [ ] V003 [check] Property overrides: all Buttons have Icon leading=false, all Inputs have Label=false
- [ ] V004 [check] Token binding: zero hardcoded padding/gap/fill values
- [ ] V005 [check] Visual check: screenshot matches original brief
- [ ] V006 [check] Present coverage stats and final screenshot to user

---

## Dependencies & Execution Order

```
Phase 1 (SCAFFOLD) → must complete before Phase 2
Phase 2 (COMPONENTS) → must complete before Phase 3
Phase 3 (ICONS) → must complete before Phase 4
Phase 4 (TOKEN-BUILT) → must complete before Phase 5
Phase 5 (VALIDATE) → gates final presentation
```

Within each phase, tasks marked with the same parent can often be batched
into a single `figma_execute` call.

## Coverage Projection

| Category | Count | Type |
|---|---|---|
| Library components | 15 | INSTANCE |
| Icons | 25 | INSTANCE |
| Token-built frames | 20 | FRAME |
| Token-built text | 25 | TEXT |
| **Total** | **85** | |
| **Projected coverage** | **(15+25)/85 = 47%** | |
