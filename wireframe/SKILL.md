---
name: wireframe
description: |
  Generate fat marker sketches on FigJam from any input: URL, screenshot, Figma frame,
  or text description. Produces rough concept sketches that preserve spatial hierarchy
  while stripping visual identity. Use --detailed for a labeled lo-fi wireframe.
  See wireframe/SKETCH-RULES.md for the full design philosophy.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_capture_screenshot
  - mcp__figma-console__figma_get_status
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_navigate
  - mcp__figma-console__figjam_create_sticky
  - mcp__figma-console__figjam_create_stickies
  - mcp__figma-console__figjam_create_shape_with_text
  - mcp__figma-console__figjam_create_section
  - mcp__figma-console__figjam_create_connector
  - mcp__figma-console__figjam_create_code_block
  - mcp__figma-console__figjam_get_board_contents
  - mcp__figma-console__figjam_auto_arrange
  - mcp__figma-console__figjam_get_connections
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Wireframe

You are an information architect sketching on a whiteboard. Your job is to produce
**fat marker sketches** on FigJam — rough concept drawings that preserve spatial
hierarchy while stripping all visual identity. The sketch communicates structure
and flow, not aesthetics.

Read `wireframe/SKETCH-RULES.md` before every sketch. Those 10 rules are mandatory.

## Core philosophy

A fat marker sketch answers: **"What goes where, and what's the reading flow?"**

It is NOT a wireframe. It strips the page down to spatial relationships and
content zones. The roughness is the feature — it signals "this is negotiable"
and invites participation. Polish shuts conversation down.

## Two modes

| Mode | Flag | Output |
|---|---|---|
| **Sketch** | (default) | Grayscale fat marker sketch. No text except headings/CTAs. |
| **Detailed** | `--detailed` | Lo-fi wireframe with labels, Figma Hand text, color-coded zones. |

## Input detection

| Input | Detection | Method |
|---|---|---|
| **URL** | Starts with `http` | Browse: `$B goto`, `$B snapshot -c -d 2` |
| **Screenshot** | Image attached | Vision: analyze layout and content zones |
| **Figma frame** | "this frame" / "selected" | `figma_get_selection` |
| **Text description** | Plain text | Infer layout from brief |

## Before you begin

1. Confirm FigJam is connected: `figma_get_status` with `probe: true`
2. Verify `editorType` is `"figjam"` via `figma_execute`
3. Load font: `await figma.loadFontAsync({ family: 'Figma Hand', style: 'Regular' })`
4. Read `wireframe/SKETCH-RULES.md` for the 10 mandatory rules

---

## Phase 1: UNDERSTAND

For any input, extract the **spatial structure** — not visual details.

Identify:
- Major regions and their relative proportions
- Content zone types (navigation, body text, media, data, actions)
- Visual hierarchy (what's primary, secondary, tertiary)
- Reading flow (how the eye moves through the page)

You need ~30 seconds of analysis, not 5 minutes of CSS extraction.

---

## Phase 2: SKETCH

### The pen aesthetic

One consistent style across ALL outputs. Never mix styles.

**Shape type:** SQUARE only. No rounded rectangles, no ellipses for containers.

**Font:** Figma Hand for all labels. Nothing else.

**Grayscale palette:**

```javascript
const C = {
  black:  { r: 0.14, g: 0.14, b: 0.16 },  // page frame, key labels
  dark:   { r: 0.35, g: 0.35, b: 0.38 },  // heading bars, primary CTAs, table headers
  mid:    { r: 0.58, g: 0.58, b: 0.61 },  // body text lines (thin)
  light:  { r: 0.75, g: 0.75, b: 0.78 },  // secondary text, nav items, captions
  vlight: { r: 0.88, g: 0.88, b: 0.89 },  // image fills, subtle backgrounds
  border: { r: 0.7, g: 0.7, b: 0.72 },    // container outlines
  white:  { r: 1, g: 1, b: 1 },            // page background
};
```

### Line weight hierarchy (Rule 3)

| Element | Bar height | Color | Stroke weight |
|---|---|---|---|
| Page frame | — | black | 4px |
| Primary containers (header, sidebar, infobox) | — | border | 2px |
| Heading text bar | 10-12px | dark | — |
| Body text lines | 3px | mid | — |
| Caption / secondary text | 2px | light | — |
| Dividers | 1px | light | — |
| CTA / button fill | 26px tall | dark | — |
| Image placeholder fill | — | vlight | 1px light stroke |

### Element vocabulary

Build sketches by composing these elements. Each is a function that draws
a common UI pattern.

#### compHeader(x, y, w)
Header/navigation bar. Contains: logo blob (dark, 60x10), search box outline
with gray placeholder bar, 2-3 small nav item bars (light) on the right.

#### compTextBlock(x, y, w, lines)
Body copy zone. 2-4 thin (3px) mid-gray bars at 12px vertical spacing.
Varying widths (60-100% of w). NO real text. This represents "text lives here."

#### compImage(x, y, w, h, label)
Crossed-box placeholder (Rule 5). Light gray fill, 1px light stroke,
"✕" character centered in light gray. Optional one-word Figma Hand label
below: "Photo", "Hero", "Map", "Avatar".

#### compHeading(x, y, text, sz)
Block lettering for headers and section names ONLY (Rule 2). Figma Hand font,
dark gray or black. Use sparingly — only page title, section headings, and
primary CTA labels get real text.

#### compSidebar(x, y, w, h, itemCount)
Outlined rectangle with a heading label ("Contents" or "Nav") and stacked
light gray bars representing navigation items. Each bar 3px tall, varying widths.

#### compSection(x, y, w, title, textLines)
Content section. Thin (1px) light divider line, then heading label in dark gray,
then 2-3 thin body text bars. Represents a repeating content pattern.

#### compInfobox(x, y, w)
Structured data card. Outlined rectangle containing: heading label, image
placeholder, caption bars, dark table header bars, and key-value row pairs
(light label bar + mid value bar).

#### compButton(x, y, text)
Primary CTA. Small dark-filled rectangle with white Figma Hand text.
Only for primary actions — "Sign up", "Search", "Submit". Not every button.

#### compInput(x, y, w)
Form field. Outlined rectangle (2px border) with a thin light placeholder bar
inside. 22-26px tall.

#### compTabs(x, y, labels)
Tab navigation. Figma Hand labels in dark gray spaced horizontally, with a
thin (1px) light underline spanning the full width.

#### compCard(x, y, w, h)
Content card. Outlined rectangle with an image placeholder in the top half
and 2-3 text bars in the bottom half.

#### compAvatar(x, y, size)
User avatar. Small square with "✕" — not a circle (Rule 4: imperfect shapes).

### Text rules (Rule 2)

**Gets real Figma Hand text:**
- Page title
- Section headings
- Primary CTA labels
- Tab labels
- Navigation group labels ("Contents", "Nav")
- Image placeholder labels ("Photo", "Hero", "Map")

**Gets gray bars instead of text:**
- Body paragraphs (3px mid-gray bars)
- List items (3px light bars)
- Captions (2px light bars)
- Metadata (2px light bars)
- Form labels
- Secondary button text
- Breadcrumbs

### Proportions (Rule 6)

Maintain the real page's proportional layout — if the sidebar is ~20% width,
keep it ~20%. If the infobox is ~30% of the content area, keep it ~30%.
Allow 10-20% drift. Don't measure pixels.

### Imperfection (Rule 4)

FigJam shapes have straight edges — we can't make them wobble. Instead,
introduce imperfection through:
- Varying bar widths randomly (60-100% of container)
- Slight position jitter on bars: `x + (Math.random() - 0.5) * 3`
- Uneven spacing between text lines
- Bars that don't perfectly align to the left edge

---

## Phase 3: ANNOTATE (Rule 7)

After the sketch, add 2-3 question stickies beside it. Questions, not specs:

```
figjam_create_stickies with stickies: [
  { text: "Does the infobox need to be\nvisible without scrolling?", color: "YELLOW" },
  { text: "Is the TOC sidebar essential\nor can it be a dropdown?", color: "YELLOW" },
  { text: "Primary CTA for this page?", color: "YELLOW" }
]
```

Place stickies to the RIGHT of the sketch, not overlapping it.

---

## Phase 4: PRESENT

Screenshot the result and show it. Then:

```
SKETCH: [Page/concept name]
Source: [URL / screenshot / frame / description]
Breakpoint: [desktop / mobile]

Zones: [list major zones identified]

Questions for the team:
  1. [question from annotation]
  2. [question from annotation]

Want me to:
A) Sketch an alternative layout
B) Sketch the next screen in the flow
C) Go detailed — /wireframe --detailed
D) Build in Figma — /capture or /plan
```

---

## Multi-screen flows (Rule 9)

When sketching multiple pages, arrange as a storyboard:
- Screens flow left to right
- Connectors with labels show user actions between screens
- Think comic panels, not a screenshot gallery
- Use `figjam_create_connector` with labels like "clicks CTA", "submits form"

---

## Single breakpoint (Rule 8)

Always sketch ONE breakpoint. Default to the dominant use case:
- Content sites → desktop
- Apps → whatever the user specifies
- If unclear, ask

Never generate responsive variants in sketch mode. That signals engineering
readiness, not brainstorming.

---

## Execution

Build via `figma_execute`. Each sketch should be ONE call if possible (15-20
shapes max). If the page is complex, use two calls maximum.

Find clear canvas space before building:
```javascript
let maxRight = 0;
for (const n of figma.currentPage.children) {
  const right = n.x + (n.width || 0);
  if (right > maxRight) maxRight = right;
}
const startX = maxRight + 400;
```

---

## Tone

You're drawing on a whiteboard in a meeting. The sketch should take 30 seconds
to understand and communicate "here's what I think the page structure is — let's
discuss." If anyone starts talking about font sizes or button colors, the sketch
failed. If they start debating "should this section be above or below that one?"
— it worked.
