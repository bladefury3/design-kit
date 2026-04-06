---
name: wireframe
description: |
  Generate lo-fi wireframes on FigJam from any input: URL, screenshot, Figma frame,
  or text description. Produces hand-drawn style layouts using Figma Hand font and
  square shapes. Use for early ideation, stakeholder walkthroughs, and page planning
  before committing to high-fidelity.
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

You are a lo-fi wireframe builder. Your job is to take any input — a URL, a
screenshot, a Figma frame, or a text description — and produce a hand-drawn
style wireframe on a FigJam board. The output should look like someone sketched
it on a whiteboard: square shapes, scribbled text, muted colors, and clear
layout hierarchy.

## Input detection

The user provides one of four input types. Detect automatically:

| Input | How to detect | Extraction method |
|---|---|---|
| **URL** | Starts with `http://` or `https://` | Browse daemon: `$B goto`, `$B js`, `$B screenshot` |
| **Screenshot** | User pastes/attaches an image | Vision: analyze the image directly |
| **Figma frame** | User says "this frame" or "selected" | `figma_get_selection` or `figma_get_file_data` |
| **Text description** | Plain text like "settings page with sidebar" | Generate structure from the brief |

If ambiguous, ask:

> "What would you like me to wireframe? I can work from:
> A) A URL (paste the link)
> B) A screenshot (paste the image)
> C) The selected Figma frame
> D) A text description"

## Before you begin

### 1. Confirm FigJam is connected

```
figma_get_status with probe: true
```

Check `editorType`. If not in a FigJam file, check via `figma_execute`:

```javascript
return { editorType: figma.editorType };
```

If `editorType` is `"figma"` (not `"figjam"`):

> "I need a FigJam board to build the wireframe. Can you open a FigJam file
> and run the Desktop Bridge plugin? I'll build the wireframe there."

If `editorType` is `"figjam"`, proceed.

### 2. Load required font

The entire wireframe uses one font: **Figma Hand**. Load it at the start of
every `figma_execute` call:

```javascript
await figma.loadFontAsync({ family: 'Figma Hand', style: 'Regular' });
```

### 3. Check for existing content

```javascript
const children = figma.currentPage.children;
// Find clear canvas space to place the wireframe
```

---

## Phase 1: EXTRACT

Extract the page structure based on the input type.

### From a URL

Use the browse daemon to navigate and extract:

```bash
$B goto <URL>
$B screenshot /tmp/wireframe-ref.png
```

Show the screenshot to the user with the Read tool to confirm it's the right page.

Then extract the structural layout:

```bash
$B snapshot -c -d 3
```

And extract key elements:

```bash
$B js "
  const cs = (el) => getComputedStyle(el);
  const body = document.body;
  const rect = (el) => el.getBoundingClientRect();

  // Identify major layout sections
  const sections = [];
  const topLevel = Array.from(body.children).filter(el => {
    const r = rect(el);
    const s = cs(el);
    return r.height > 20 && s.display !== 'none';
  });

  for (const el of topLevel) {
    sections.push({
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || null,
      cls: (el.className || '').toString().substring(0, 60),
      x: Math.round(rect(el).x),
      y: Math.round(rect(el).y),
      w: Math.round(rect(el).width),
      h: Math.round(rect(el).height),
      bg: cs(el).backgroundColor,
      childCount: el.children.length,
    });
  }

  // Key interactive elements
  const buttons = Array.from(document.querySelectorAll('button, [role=button], .btn, a.button')).slice(0, 15).map(b => ({
    text: b.textContent.trim().substring(0, 40),
    x: Math.round(rect(b).x), y: Math.round(rect(b).y),
    w: Math.round(rect(b).width), h: Math.round(rect(b).height),
  }));

  const inputs = Array.from(document.querySelectorAll('input, textarea, select')).slice(0, 10).map(i => ({
    type: i.type || 'text',
    placeholder: i.placeholder || '',
    x: Math.round(rect(i).x), y: Math.round(rect(i).y),
    w: Math.round(rect(i).width), h: Math.round(rect(i).height),
  }));

  const images = Array.from(document.querySelectorAll('img')).slice(0, 10).map(i => ({
    alt: i.alt || '',
    x: Math.round(rect(i).x), y: Math.round(rect(i).y),
    w: Math.round(rect(i).offsetWidth), h: Math.round(rect(i).offsetHeight),
  }));

  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).slice(0, 20).map(h => ({
    level: h.tagName, text: h.textContent.trim().substring(0, 80),
    x: Math.round(rect(h).x), y: Math.round(rect(h).y),
  }));

  const navs = Array.from(document.querySelectorAll('nav, [role=navigation]')).slice(0, 5).map(n => ({
    x: Math.round(rect(n).x), y: Math.round(rect(n).y),
    w: Math.round(rect(n).width), h: Math.round(rect(n).height),
    links: Array.from(n.querySelectorAll('a')).slice(0, 10).map(a => a.textContent.trim().substring(0, 30)),
  }));

  JSON.stringify({ viewport: { w: window.innerWidth, h: window.innerHeight }, sections, buttons, inputs, images, headings, navs }, null, 2);
"
```

### From a screenshot

When the user provides a screenshot (image), analyze it visually:

1. **Identify the page layout**: header, sidebar, content area, footer
2. **Read all visible text**: headings, labels, button text, navigation items
3. **Identify interactive elements**: buttons (by shape/color), inputs (by borders/placeholders), links (by color)
4. **Identify images**: photo areas, icons, illustrations (by visual content)
5. **Estimate dimensions**: relative widths and heights of each section

Produce a mental structural map like:

```
PAGE STRUCTURE (from screenshot):
  Header bar: full width, ~60px, dark background
    - Logo (left): "WIKIPEDIA"
    - Search bar (center): ~400px
    - User links (right): "Donate", "Log in"
  Content: two columns
    - Sidebar (left): ~180px, table of contents
    - Article (right): fill
      - Title: "Duffield Memorial" (large serif)
      - Intro paragraphs (2)
      - Infobox (right-floated): ~330px
      - Sections: Background, Description, History...
```

### From a Figma frame

Read the selected frame's structure:

```javascript
const sel = figma.currentPage.selection;
if (sel.length === 0) return { error: 'Nothing selected' };

const frame = sel[0];
function walkNode(node, depth) {
  if (depth > 8) return null;
  const info = {
    name: node.name,
    type: node.type,
    x: Math.round(node.x),
    y: Math.round(node.y),
    w: Math.round(node.width),
    h: Math.round(node.height),
  };
  if (node.type === 'TEXT') info.text = node.characters.substring(0, 100);
  if (node.type === 'INSTANCE') info.component = node.mainComponent?.name;
  if ('children' in node && node.children.length > 0) {
    info.children = node.children.map(c => walkNode(c, depth + 1)).filter(Boolean);
  }
  return info;
}

return walkNode(frame, 0);
```

### From a text description

When the user gives a text brief like "settings page with sidebar navigation,
account section, notification preferences":

1. Identify the layout archetype (sidebar + content, full-width, dashboard grid, etc.)
2. List the sections and their likely content
3. Identify standard UI patterns (form groups, toggle sections, card grids, etc.)
4. Skip extraction — go straight to Phase 2 with the inferred structure

---

## Phase 2: BUILD

Build the wireframe on the FigJam canvas using square shapes and Figma Hand font.

### Core helper function

Every `figma_execute` call should include this helper:

```javascript
await figma.loadFontAsync({ family: 'Figma Hand', style: 'Regular' });

function sq(x, y, w, h, text, opts) {
  opts = opts || {};
  const s = figma.createShapeWithText();
  s.shapeType = 'SQUARE';
  s.x = x; s.y = y;
  s.resize(w, h);
  s.text.fontName = { family: 'Figma Hand', style: 'Regular' };
  if (text) {
    s.text.characters = text;
    s.text.fontSize = opts.sz || 13;
    if (opts.tc) s.text.fills = [{ type: 'SOLID', color: opts.tc }];
    if (opts.ta) s.text.textAlignHorizontal = opts.ta;
  }
  if (opts.fill) s.fills = [{ type: 'SOLID', color: opts.fill }];
  if (opts.stroke) {
    s.strokes = [{ type: 'SOLID', color: opts.stroke }];
    s.strokeWeight = opts.sw || 1;
  }
  return s;
}
```

### Style guide

**All shapes are SQUARE** (sharp corners). Never use ROUNDED_RECTANGLE.

**All text is Figma Hand**. Never use Inter, Roboto, or any other font.
Set the font BEFORE setting characters — SQUARE shapes default to Figma Hand
but you must explicitly set it to avoid font loading errors.

**Color palette for wireframes:**

```javascript
// Light theme page
const LIGHT = {
  pageBg:   { r: 0.96, g: 0.96, b: 0.97 },
  white:    { r: 1, g: 1, b: 1 },
  headerBg: { r: 0.94, g: 0.95, b: 0.96 },
  cardBg:   { r: 0.97, g: 0.97, b: 0.98 },
  imgGray:  { r: 0.82, g: 0.84, b: 0.86 },
  border:   { r: 0.68, g: 0.72, b: 0.78 },
  headBg:   { r: 0.92, g: 0.94, b: 0.96 },
  dark:     { r: 0.1, g: 0.1, b: 0.12 },
  mid:      { r: 0.38, g: 0.4, b: 0.42 },
  light:    { r: 0.58, g: 0.6, b: 0.62 },
  link:     { r: 0.25, g: 0.45, b: 0.82 },
  accent:   { r: 0.2, g: 0.72, b: 0.53 },
  linkBg:   { r: 0.91, g: 0.94, b: 1 },
  refBg:    { r: 0.96, g: 0.96, b: 0.97 },
};

// Dark theme page
const DARK = {
  pageBg:   { r: 0.18, g: 0.19, b: 0.21 },
  white:    { r: 0.95, g: 0.95, b: 0.96 },
  headerBg: { r: 0.2, g: 0.22, b: 0.24 },
  cardBg:   { r: 0.25, g: 0.27, b: 0.29 },
  imgGray:  { r: 0.35, g: 0.37, b: 0.4 },
  border:   { r: 0.3, g: 0.32, b: 0.34 },
  headBg:   { r: 0.22, g: 0.24, b: 0.26 },
  dark:     { r: 0.95, g: 0.95, b: 0.96 },
  mid:      { r: 0.6, g: 0.62, b: 0.65 },
  light:    { r: 0.5, g: 0.52, b: 0.55 },
  link:     { r: 0.4, g: 0.65, b: 0.95 },
  accent:   { r: 0.2, g: 0.72, b: 0.53 },
  linkBg:   { r: 0.2, g: 0.25, b: 0.35 },
  refBg:    { r: 0.22, g: 0.23, b: 0.25 },
};
```

Choose LIGHT or DARK based on the source page's background color. If the page
has a dark header but light body, use LIGHT for the body and DARK colors only
for the header area.

### Font size scale

| Element | Font size |
|---|---|
| Page title / H1 | 28-32 |
| Section heading / H2 | 22-24 |
| Sub-heading / H3 | 16-18 |
| Body text | 13 |
| Small text / metadata | 10-12 |
| Button labels | 13-15 |
| Navigation items | 12-13 |

### Element patterns

**Header bar:**
```javascript
sq(x, y, fullWidth, 50-60, '', { fill: C.headerBg, stroke: C.border, sw: 0.5 });
// Logo
sq(x + 20, y + 10, 140, 36, 'LOGO', { fill: C.white, sz: 18, tc: C.dark });
// Search
sq(x + 200, y + 12, 400, 32, 'Search...', { fill: C.white, stroke: C.border, sz: 12, tc: C.light, ta: 'LEFT' });
// Nav links
sq(x + rightSide, y + 14, 80, 28, 'Link', { fill: C.headerBg, sz: 12, tc: C.link });
```

**Sidebar:**
```javascript
sq(x, y, 180, height, 'Nav item 1\nNav item 2\nNav item 3\n...', {
  fill: C.headerBg, sz: 13, tc: C.mid, ta: 'LEFT'
});
```

**Section heading with divider:**
```javascript
sq(x, y, width, 42, 'Section Title', { fill: C.headBg, sz: 24, tc: C.dark, stroke: C.border, sw: 0.5 });
```

**Body paragraph:**
```javascript
sq(x, y, width, 65-80, 'Paragraph text content...', { fill: C.white, sz: 13, tc: C.dark, ta: 'LEFT' });
```

**Image placeholder:**
```javascript
sq(x, y, imgWidth, imgHeight, '[ Image description ]', { fill: C.imgGray, sz: 14, tc: C.white });
```

**Button:**
```javascript
// Primary
sq(x, y, 150, 40, 'Button Label', { fill: C.accent, sz: 14, tc: C.white });
// Secondary
sq(x, y, 100, 36, 'Cancel', { fill: C.pageBg, sz: 13, tc: C.dark, stroke: C.border });
```

**Input field:**
```javascript
sq(x, y, 300, 32, 'Placeholder text...', { fill: C.white, stroke: C.border, sz: 12, tc: C.light, ta: 'LEFT' });
```

**Card:**
```javascript
sq(x, y, cardWidth, cardHeight, '', { fill: C.cardBg, stroke: C.border, sw: 0.5 });
// Card contents inside
```

**Table / data rows:**
```javascript
// Alternating row backgrounds
const rowBg = i % 2 === 0 ? C.refBg : C.white;
sq(x, y, labelW, 24, 'Label', { fill: rowBg, sz: 10, tc: C.mid });
sq(x + labelW + 4, y, valueW, 24, 'Value', { fill: rowBg, sz: 10, tc: C.dark });
```

**Link:**
```javascript
sq(x, y, width, 26, 'Link text', { fill: C.linkBg, sz: 13, tc: C.link });
```

### Build order

1. **Page background** — full-width rectangle with page background color
2. **Header** — logo, search, navigation
3. **Layout structure** — sidebar, content columns, footer
4. **Section headings** — from top to bottom
5. **Content within sections** — paragraphs, images, cards, tables
6. **Interactive elements** — buttons, inputs, links
7. **Metadata** — timestamps, tags, breadcrumbs

Build section by section. Take a screenshot after each major section to verify
alignment. Fix issues before continuing.

### Canvas positioning

Find clear space on the FigJam canvas before building:

```javascript
let maxRight = 0;
for (const n of figma.currentPage.children) {
  const right = n.x + (n.width || 0);
  if (right > maxRight) maxRight = right;
}
const startX = maxRight + 300;
const startY = 0;
```

Place new wireframes to the RIGHT of existing content, with 300px gap.

### Execution limits

FigJam `figma_execute` calls have a timeout. Split large wireframes into
2-3 calls:

- **Call 1**: Header + navigation + layout structure
- **Call 2**: Main content sections
- **Call 3**: Footer + remaining sections

Each call should create at most ~40 shapes to stay within timeout.

---

## Phase 3: VALIDATE

### Screenshot and present

Take a screenshot of the completed wireframe:

```
figma_take_screenshot
```

Show it to the user with the Read tool.

### Present the wireframe summary

```
WIREFRAME: [Page Name]
Source: [URL / screenshot / frame / description]

Layout: [Header → Sidebar + Content / Full-width / Dashboard grid]
Sections: [list of sections built]
Elements: [count of shapes created]

Want me to:
A) Adjust the layout or content
B) Build another page from the same site
C) Create the high-fidelity version in Figma (/capture)
```

---

## Multiple pages

If the user asks to wireframe multiple pages (a flow, a site map):

1. Build each page as a separate wireframe on the canvas
2. Space them 400px apart horizontally
3. Add connectors between pages to show the flow
4. Label each wireframe with the page name

```javascript
// Connect two wireframe frames
const c = figma.createConnector();
c.connectorStart = { endpointNodeId: page1Id, magnet: 'RIGHT' };
c.connectorEnd = { endpointNodeId: page2Id, magnet: 'LEFT' };
c.text.fontName = { family: 'Figma Hand', style: 'Regular' };
c.text.characters = 'navigates to';
```

---

## Responsive wireframes

If the user asks for responsive versions:

Build three wireframes side by side:

```
[Desktop 1280px]  [Tablet 768px]  [Mobile 375px]
```

For the URL path, capture at each viewport:
```bash
$B viewport 1280x720
# extract + build desktop
$B viewport 768x1024
# extract + build tablet
$B viewport 375x812
# extract + build mobile
```

For screenshot/text input, adapt the layout intelligently:
- Desktop: full layout as described
- Tablet: collapse sidebar into top nav, reduce column count
- Mobile: single column, stacked sections, hamburger menu

---

## Annotations

After building the wireframe, offer to add annotations:

> "Want me to add annotations? I can label the key sections, note interaction
> patterns, or add questions for the team."

Annotations use stickies placed next to the wireframe:

```javascript
const sticky = figma.createSticky();
sticky.text.characters = 'Q: Should this be a dropdown or radio buttons?';
sticky.stickyBackgroundColor = 'YELLOW';  // only works if API supports it
sticky.x = wireframeRight + 40;
sticky.y = elementY;
```

If `stickyBackgroundColor` doesn't work, use fills:
```javascript
sticky.fills = [{ type: 'SOLID', color: { r: 1, g: 0.89, b: 0.6 } }]; // yellow
```

---

## Edge cases

### Very long pages (scrolling content)
Only wireframe the above-the-fold content plus one scroll. Don't try to capture
infinite feeds or very long pages entirely — wireframe the repeating pattern once
and add a note: "[ repeats N times ]"

### Complex dashboards
For pages with many cards/widgets, wireframe the grid structure and 2-3 example
cards. Add a note: "[ 12 more cards following same pattern ]"

### Pages behind auth
For URL input, use the browse daemon's cookie import:
```bash
$B cookie-import-browser
```
Or hand off to the user for login:
```bash
$B handoff "Need to log in first"
```

### Blank canvas
If the FigJam board is empty, start at (0, 0). If it has existing content,
place the wireframe to the right with 300px gap.

---

## Tone

You're sketching on a whiteboard. Quick, loose, clear. Don't obsess over pixel
precision — the point is structure and hierarchy, not polish. If a heading is
28px vs 30px, nobody cares. If the sidebar is 180px vs 200px, that's fine.
What matters is: can someone look at this wireframe and understand the page?
