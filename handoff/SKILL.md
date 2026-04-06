---
name: handoff
description: |
  Annotate Figma frames with developer specs that Dev Mode doesn't show: token
  names, interaction states, conditional logic, content rules, focus order, and
  animation. Creates a spec section next to the design — not JSON files, not
  comments. Use when a design is ready for engineering.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_generate_component_doc
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_capture_screenshot
  - mcp__figma-console__figma_get_variables
  - mcp__figma-console__figma_get_token_values
  - mcp__figma-console__figma_get_styles
  - mcp__figma-console__figma_get_component
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_get_component_for_development
  - mcp__figma-console__figma_get_component_for_development_deep
  - mcp__figma-console__figma_get_component_image
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_generate_component_doc
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_get_annotations
  - mcp__figma-console__figma_set_annotations
  - mcp__figma-console__figma_get_annotation_categories
  - mcp__figma-console__figma_get_design_system_summary
  - mcp__figma-console__figma_check_design_parity
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_navigate
  - mcp__figma-console__figma_create_child
  - mcp__figma-console__figma_set_fills
  - mcp__figma-console__figma_set_text
  - mcp__figma-console__figma_rename_node
  - mcp__figma-console__figma_resize_node
  - mcp__figma-console__figma_move_node
  - mcp__figma-console__figma_clone_node
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Developer Handoff

You annotate Figma frames with the information developers actually need — the
things Figma's Dev Mode doesn't show. You don't duplicate what Dev Mode already
provides. You don't bloat the canvas with obvious specs.

## What Dev Mode already gives developers (DO NOT annotate)

- Spacing values in pixels
- Color values (hex, RGB, HSL)
- Typography properties (font family, size, weight, line-height)
- Component name and current variant
- Auto-layout properties (direction, gap, padding)
- Dimensions, border radius, shadows, opacity
- CSS / iOS / Android code snippets

**If Dev Mode shows it, you don't annotate it.** Your job is to fill the gaps.

## What Dev Mode does NOT show (annotate ONLY these)

| Category | What to annotate | Example |
|---|---|---|
| **Token names** | Design system variable name for each value | "This 16px is `spacing-xl`, not a magic number" |
| **Interaction states** | What happens on hover, focus, press, disabled (see PRINCIPLES.md screen plan "Interaction states" table) | "Hover: background darkens 10%. Focus: 2px brand ring" |
| **Conditional logic** | When elements show/hide, enable/disable | "Disable submit until all required fields valid" |
| **Content rules** | Max length, truncation, overflow behavior | "Max 50 chars, truncate with ellipsis" |
| **Focus order** | Tab sequence for keyboard navigation | "Tab: Name → Email → Password → Submit" |
| **Animation** | Transition timing and easing | "150ms ease-out on background-color" |
| **Data binding** | What API field maps to each element | "user.displayName, falls back to user.email" |

**Most frames need only 2-3 of these categories.** A simple card might only need
token names. A form needs interaction states + focus order + content rules. A
dashboard might need nothing beyond what Dev Mode shows.

## Before you begin

1. **Confirm Figma is connected.**

2. **Load design system data** for token name lookups:
   - `design-system/tokens.json` — token names and resolved values
   - `design-system/components/index.json` — component catalog
   - `design-system/relationships.json` — composition patterns

   If missing, try `figma_get_design_system_kit` as fallback. If that also fails,
   proceed without token names — annotate interaction states and logic instead.

3. **Get the target frame** from selection or user specification.

4. **Determine what needs annotation.** Analyze the frame and identify which of
   the 7 categories are relevant. AskUserQuestion ONLY if genuinely unclear:

   > Preparing developer handoff for **[frame name]**.
   >
   > Based on what I see, I'll annotate:
   > - Token names (this frame uses 12 unique tokens)
   > - Interaction states (4 interactive components)
   > - Focus order (form with 6 inputs)
   >
   > Anything else developers usually ask about for this kind of screen?
   >
   > RECOMMENDATION: Start with these 3. I can add more after you review.
   >
   > A) These 3 are good — go
   > B) Also add content rules (I have max-length constraints)
   > C) Also add animation specs
   > D) Skip token names — our devs know the system. Just states + focus.

   Default to the detected categories and proceed. One question max.

## Step 1: Analyze the frame

Read the frame structure using `figma_get_file_data` and `figma_get_selection`.
For each element, determine:

- Is it a library component? (Check `design-system/components/index.json`)
- What tokens are bound? (Check bound variables via `figma_execute`)
- Is it interactive? (Buttons, inputs, links, toggles, checkboxes)
- Does it contain dynamic text? (User names, dates, numbers, generated content)

Use `figma_analyze_component_set` on interactive components to get their state
machines — this tells you exactly what changes between default, hover, focus,
and disabled states.

### Determine annotation density

Not every element needs annotation. Apply this filter:

| Element type | Annotate? | Why |
|---|---|---|
| Library component in default state | **No** | Dev Mode shows everything needed |
| Library component with state changes | **Token names + states** | States aren't visible |
| Token-built frame | **Token names** | Dev can't see which tokens were used |
| Form inputs | **States + focus order + content rules** | Critical for implementation |
| Conditional elements (show/hide) | **Conditional logic** | Not visible in static frame |
| Animated transitions | **Animation specs** | Static frame can't show motion |
| Data-driven text | **Data binding + content rules** | Devs need the field name |
| Static text, images, dividers | **No** | Nothing to add beyond Dev Mode |

**Target: annotate 30-50% of elements.** If you're annotating everything, you're
duplicating Dev Mode. If you're annotating nothing, the handoff is incomplete.

## Step 2: Create the spec section in Figma

Create a **spec section** next to the design frame — NOT overlaying it.

```javascript
// Create a section next to the design frame
const designFrame = figma.currentPage.selection[0];
const section = figma.createSection();
section.name = "📐 Dev Specs: " + designFrame.name;
section.x = designFrame.x + designFrame.width + 100; // 100px gap to the right
section.y = designFrame.y;
```

The spec section contains annotation cards organized by category. Each card is
a small frame with a title and spec content.

### Annotation card structure

```javascript
// Each annotation card
const card = figma.createFrame();
card.name = "Spec: [Element Name]";
card.layoutMode = 'VERTICAL';
card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 12;
card.itemSpacing = 8;
card.cornerRadius = 8;
card.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.97, b: 0.98 } }]; // Light gray
card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.87, b: 0.9 } }];
card.strokeWeight = 1;
```

### Category-specific annotation formats

**Token Names** (only when tokens are bound but names aren't obvious from Dev Mode):

```
┌─────────────────────────────────┐
│ 🎨 Token Map                    │
│                                 │
│ Metrics row gap    spacing-3xl  │
│ Card background    bg-secondary │
│ Card radius        radius-xl    │
│ Section gap        spacing-4xl  │
│                                 │
│ Use token names in code, not    │
│ hardcoded values.               │
└─────────────────────────────────┘
```

Only list tokens that a developer might miss. If a button uses `bg-brand-primary`,
Dev Mode shows the color — the developer just needs to know it's `bg-brand-primary`
in the token system. Keep this list to tokens on TOKEN-BUILT elements where the
mapping isn't obvious from the component name.

**Interaction States** (for components with hover/focus/disabled behavior):

```
┌─────────────────────────────────┐
│ 🖱 Interaction States            │
│                                 │
│ Submit Button                   │
│   hover:    bg darkens 10%      │
│   focus:    2px ring, brand     │
│   active:   scale 0.98          │
│   disabled: opacity 50%, no     │
│             pointer events      │
│   loading:  text → "Saving...", │
│             spinner replaces    │
│             icon, disabled      │
│                                 │
│ Search Input                    │
│   focus:    border → brand,     │
│             label floats up     │
│   error:    border → error,     │
│             helper text shows   │
│   disabled: bg → tertiary,      │
│             no interaction      │
└─────────────────────────────────┘
```

Use `figma_analyze_component_set` to get the exact visual diffs between states.
Don't guess — report what the component actually changes.

**Conditional Logic** (when elements depend on data or user actions):

```
┌─────────────────────────────────┐
│ ⚡ Conditional Logic             │
│                                 │
│ Submit button                   │
│   enabled when: all required    │
│   fields pass validation        │
│                                 │
│ Error messages                  │
│   shown when: field loses focus │
│   with invalid value            │
│                                 │
│ "Upgrade" banner                │
│   shown when: user.plan = free  │
│   hidden when: user.plan = pro  │
│                                 │
│ Empty state                     │
│   shown when: items.length = 0  │
│   action: "Create your first    │
│   project" button               │
└─────────────────────────────────┘
```

**Content Rules** (for dynamic text that could overflow):

```
┌─────────────────────────────────┐
│ 📝 Content Rules                 │
│                                 │
│ User name    max 50 chars       │
│              truncate: ellipsis │
│                                 │
│ Description  max 120 chars      │
│              truncate: 2 lines  │
│              + "..." link       │
│                                 │
│ Stat values  format: compact    │
│              1000 → "1K"        │
│              1000000 → "1M"     │
└─────────────────────────────────┘
```

**Focus Order** (for forms and interactive sections):

```
┌─────────────────────────────────┐
│ ⌨️ Focus Order                   │
│                                 │
│ 1. Full Name input              │
│ 2. Email input                  │
│ 3. Password input               │
│    → toggle visibility (Tab)    │
│ 4. Confirm Password input       │
│ 5. Terms checkbox               │
│ 6. Submit button                │
│                                 │
│ Escape: closes modal            │
│ Enter: submits form (from any   │
│ input)                          │
└─────────────────────────────────┘
```

**Animation** (only if the design has motion — most frames don't):

```
┌─────────────────────────────────┐
│ 🎬 Animation                     │
│                                 │
│ Button hover                    │
│   property: background-color    │
│   duration: 150ms               │
│   easing: ease-in-out           │
│                                 │
│ Modal open                      │
│   property: opacity, transform  │
│   duration: 200ms               │
│   easing: ease-out              │
│   transform: translateY(8px)→0  │
└─────────────────────────────────┘
```

## Step 3: Add Figma annotations to interactive elements

Beyond the spec section, use `figma_set_annotations` on specific interactive
elements in the ORIGINAL frame. This puts specs directly in Dev Mode's
annotation panel — developers see them when they inspect the element.

```
Use figma_set_annotations on:
  - Interactive components (buttons, inputs, toggles) → interaction states
  - Conditional elements → show/hide logic
  - Form containers → focus order
```

Keep annotations SHORT — one line per annotation. The spec section has the details.
The element annotation is just a pointer: "See spec section for full state matrix."

**Do NOT annotate:**
- Every element (bloat)
- Spacing values (Dev Mode shows these)
- Color values (Dev Mode shows these)
- Typography (Dev Mode shows these)
- Static, non-interactive elements

## Step 4: Screenshot and verify

Take a screenshot showing the design frame + spec section side by side.

Check:
- Is the spec section readable at normal zoom?
- Does it cover only what Dev Mode doesn't show?
- Are annotation cards organized by category?
- Is annotation density reasonable (30-50% of elements, not 100%)?

## Step 5: Present the handoff

> **Developer handoff ready for [frame name]**
>
> Created spec section "📐 Dev Specs: [frame name]" to the right of the design.
>
> **What's annotated:**
> - [N] token mappings (token-built elements only)
> - [N] interaction state specs (buttons, inputs, toggles)
> - [N] conditional logic rules
> - [N] content rules (max length, truncation)
> - Focus order for [form name]
>
> **What's NOT annotated (Dev Mode handles it):**
> - Spacing, colors, typography, dimensions, component names
>
> The spec section is a Figma section — developers can inspect it alongside
> the design in Dev Mode. Want me to add or remove anything?

## Per-field state documentation (forms)

When handing off forms, document EACH input field individually — not "inputs have
5 states" generically:

| Field | Default | Focused | Filled | Error | Disabled |
|---|---|---|---|---|---|
| Full Name | Gray border, placeholder "Jane Doe" | Blue border, cursor | Black text, value shown | Red border, "Name is required" below | Gray bg, no interaction |
| Email | Gray border, placeholder "jane@company.com" | Blue border, cursor | Black text, value shown | Red border, "Enter a valid email" below | Gray bg, no interaction |

Every error message must be the ACTUAL string, not "shows error."
Every placeholder must be the ACTUAL text, not "placeholder text."

## Interactive sub-features

Document behavior that lives INSIDE a component, not just the component's states:

- **Password visibility toggle**: tap to show/hide, icon changes (eye → eye-off)
- **Password strength indicator**: meter or bar, color thresholds (red/yellow/green), label text per level
- **Autocomplete dropdowns**: trigger (on type vs on focus), result format, selection behavior, empty state
- **Character counters**: position, format ("12/100"), color change at limit
- **Validation timing**: on blur, on change, on submit, or debounced (specify ms)

For each sub-feature, document: trigger, visual change, state transitions, and edge cases.

## Edge cases

- **Frame with no interactive elements**: Only annotate token names for token-built
  elements. If everything is library components, there may be nothing to annotate.
  That's fine — tell the developer: "This frame is 100% library components. Dev Mode
  has everything you need."

- **Very complex frame (50+ elements)**: Don't annotate everything. Focus on the
  elements developers will implement first (primary actions, form inputs, data displays).
  Offer to annotate more sections on request.

- **Frame already has designer annotations**: Read them with `figma_get_annotations`.
  Don't overwrite — add to them. If there's a conflict, defer to the designer's annotation.

- **No design system data**: Skip token names. Focus on interaction states, conditional
  logic, and content rules — these don't need token data.

## What NOT to do

- **Don't create JSON files in a `handoff/` directory.** Developers work in Figma Dev Mode,
  not in their terminal reading JSON.
- **Don't leave Figma comments.** Comments are for design feedback conversations between
  humans, not for specs.
- **Don't annotate spacing values.** Dev Mode shows these with pixel precision.
- **Don't annotate every element.** 30-50% density. If a button is from the library and
  has no special states, skip it.
- **Don't create a full-size redline overlay.** A compact spec section to the side is
  enough. Overlays clutter the canvas.

## Next steps

> "Specs are in Figma. The developer can:
> - Inspect the design in Dev Mode for spacing, colors, typography
> - Check the spec section for states, logic, content rules, focus order
> - Run `/audit` if they want to verify design system compliance"

## Definition of Done

Before presenting the handoff, verify ALL of these:

1. [ ] Spec section created NEXT TO the design (not overlapping)
2. [ ] Token names annotated on non-obvious elements
3. [ ] Interaction states documented (hover, focus, disabled) for interactive elements
4. [ ] Focus order documented for keyboard navigation
5. [ ] Conditional logic documented (show/hide, enable/disable rules)
6. [ ] Content rules documented (max length, truncation, overflow)
7. [ ] No duplication of what Dev Mode already shows (spacing, colors, typography)
8. [ ] Annotation density 30-50% (not over-annotating)

## Tone

You're a senior developer writing specs for yourself. You know what Dev Mode shows.
You know what's missing. You fill the gaps efficiently — no over-documentation,
no redundancy. If a developer could figure it out from Dev Mode alone, you don't
annotate it.
