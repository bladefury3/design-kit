# Component Build Tasks: [COMPONENT NAME]

**Input**: `plans/components/[name].md`, `design-system/tokens.json`, `design-system/components/index.json`
**Variant matrix**: [N Types] x [N Sizes] x [N States] = [TOTAL] variants
**Props**: [N boolean] + [N text] + [N instance swap] = [TOTAL] props

## Format: `[ID] [Phase] [Type] Description`

- **Phase**: VALIDATE | SCAFFOLD | VARIANT | SUBCOMP | TEXT | COMBINE | PROPS | ARRANGE | VERIFY
- **Type**: check | frame | component | library | text | api | screenshot

---

## Phase 1: PRE-VALIDATE (no Figma calls)

**Purpose**: Verify the plan is buildable before touching Figma.

- [ ] PV01 [check] Read `plans/components/[name].md` — extract variant matrix, anatomy, tokens, props
- [ ] PV02 [check] Verify all figmaKey values are 40-char hex hashes (no path-style keys)
- [ ] PV03 [check] Verify variant count: [axes] produce [N] combinations = matches plan
- [ ] PV04 [check] Verify sub-component variantKeys exist in `components/index.json`
- [ ] PV05 [check] Verify icon keys exist in `icons.json` (for instance swap defaults)
- [ ] PV06 [check] Print manifest:

```
COMPONENT MANIFEST: [Name]
  Variants: [N] ([axis1] x [axis2] x [axis3])
  Tokens needed: [N] unique figmaKeys
  Sub-components: [list with variantKeys]
  Icons: [list with componentKeys]
  Props: [list with types and defaults]
  Anatomy layers per variant: [count]
```

**Gate**: All keys valid. Variant count matches. Manifest printed.

---

## Phase 2: SCAFFOLD (1 figma_execute call)

**Purpose**: Find canvas space. Prepare token map.

- [ ] SC01 [frame] Run canvasScan() → store originX, originY
- [ ] SC02 [check] Import all token variables into a flat map (1 importTokens call)

**Gate**: Canvas position stored. Token map ready.

---

## Phase 3: VARIANTS (2-4 figma_execute calls)

**Purpose**: Create one figma.createComponent() per variant combination.
Build anatomy (layer tree) inside each.

### 3a. Create all variant components

For each variant in the matrix, one `figma.createComponent()` with:
- Name: "Type=info, Size=md, State=Default" (from plan axis values)
- Auto-layout: direction, sizing from plan anatomy
- Token bindings: padding, gap, radius, fills, strokes from plan

- [ ] V001 [component] Create variant: Type=X, Size=Y, State=Z → bind tokens
- [ ] V002 [component] Create variant: Type=X, Size=Y, State=Z → bind tokens
- [ ] ... (one entry per variant)
- [ ] V00N [component] Create variant: (last combination)

### 3b. Build anatomy inside each variant

For each variant, create the internal layer tree from the plan's anatomy:

- [ ] VA01 [frame] Build anatomy layers in variant 1: [icon] [text-container [title] [description]] [close-button]
- [ ] VA02 [frame] Build anatomy layers in variant 2: (same structure, different token values)
- [ ] ... (one entry per variant — batch into 2-4 figma_execute calls)

**Gate**: All variant components exist. Count figma.createComponent() nodes = [TOTAL].

---

## Phase 4: SUB-COMPONENTS (figma_instantiate_component calls)

**Purpose**: Place library component instances inside variant frames.

For each sub-component reference in the plan:

- [ ] SUB01 [library] Instantiate [SubComponent] → variantKey: [key] → parent: variant 1 [slot name]
  - Set sizing: [FILL/HUG/FIXED]
  - Set overrides: [property=value, ...]
- [ ] SUB02 [library] Instantiate [SubComponent] → variantKey: [key] → parent: variant 2 [slot name]
- [ ] ... (one per sub-component per variant that needs it)

Icons for instance swap slots:

- [ ] ICO01 [icon] Instantiate [icon-name] → key: [key] → parent: variant 1 Icon slot → [size]
- [ ] ICO02 [icon] Instantiate [icon-name] → key: [key] → parent: variant 2 Icon slot → [size]

**Gate**: All sub-component instances placed. No empty slots remain.

---

## Phase 5: TEXT (1-2 figma_execute calls)

**Purpose**: Load fonts. Set text characters. Apply visibility conditions.

- [ ] TXT01 [text] Load all required fonts: Inter Regular, Semi Bold, Medium, Bold
- [ ] TXT02 [text] Set text content on all variants:
  - Title → plan.defaultText.title (per variant type)
  - Description → plan.defaultText.description
  - Button label → per variant type
- [ ] TXT03 [text] Apply visibility conditions:
  - If Closable=false → hide close button layer
  - If ShowDescription=false → hide description layer
  - (one per boolean prop that controls visibility)
- [ ] TXT04 [text] Bind typography tokens: fontSize, lineHeight, fills on all text nodes

**Gate**: All text nodes have content. No "Label" or "Title" defaults remain.

---

## Phase 6: COMBINE (1 figma_execute call)

**Purpose**: Merge variant components into a component set.

- [ ] CMB01 [api] Collect all variant ComponentNode IDs
- [ ] CMB02 [api] `figma.combineAsVariants([allVariants], figma.currentPage)`
- [ ] CMB03 [api] Set component set name: plan.componentName
- [ ] CMB04 [api] Move component set to (originX, originY)

**Gate**: Component set exists. Type is COMPONENT_SET. All variants are children.

---

## Phase 7: PROPS (1 figma_add_component_property call per prop)

**Purpose**: Add boolean, text, and instance swap properties.

- [ ] PR01 [api] Add boolean prop: "[name]" → default: [value] → controls: [layer name]
- [ ] PR02 [api] Add boolean prop: "[name]" → default: [value] → controls: [layer name]
- [ ] PR03 [api] Add text prop: "[name]" → default: "[text]" → linked to: [text node]
- [ ] PR04 [api] Add instance swap prop: "[name]" → default: [componentKey] → slot: [layer name]
- [ ] ... (one per prop from plan)

**Gate**: All props exist. Boolean props toggle visibility correctly.

---

## Phase 8: ARRANGE (1 api call)

**Purpose**: Organize variants into a clean grid.

- [ ] ARR01 [api] `figma_arrange_component_set` → nodeId: component set ID

**Gate**: Variants are in a grid layout.

---

## Phase 9: DESCRIBE (1 api call)

**Purpose**: Set component description for the asset panel.

- [ ] DESC01 [api] `figma_set_description` → description from plan

---

## Phase 10: VERIFY (screenshot + checks)

- [ ] VER01 [screenshot] Take screenshot of the component set
- [ ] VER02 [check] AI Slop Check:
  - [ ] No identical-looking variants
  - [ ] Type variants have visually distinct emphasis
  - [ ] State variants (hover/focus/disabled) have visible changes
  - [ ] Grid is not oversized (< 20 variants, or justified)
  - [ ] No "Label" placeholder text remains
- [ ] VER03 [check] Verify variant count matches plan
- [ ] VER04 [check] Verify all props are accessible in properties panel
- [ ] VER05 [check] Present result with variant count, prop count, MCP call count

---

## Dependencies & Execution Order

```
Phase 1 (PRE-VALIDATE) → blocks all Figma work
Phase 2 (SCAFFOLD) → prepares canvas + tokens
Phase 3 (VARIANTS) → creates component frames → blocks Phase 4
Phase 4 (SUB-COMPONENTS) → adds library instances → blocks Phase 5
Phase 5 (TEXT) → sets content and visibility → blocks Phase 6
Phase 6 (COMBINE) → merges into component set → blocks Phase 7
Phase 7 (PROPS) → adds component properties → blocks Phase 8
Phase 8 (ARRANGE) → organizes grid layout
Phase 9 (DESCRIBE) → adds documentation
Phase 10 (VERIFY) → final quality check
```

Phases 8 and 9 can run in parallel. Everything else is sequential.
