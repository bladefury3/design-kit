# Component Vocabulary

Element library for the wireframe skill. Each component renders differently
based on the active fidelity level. All components share the hand-drawn
aesthetic — Figma Hand font, grayscale base, sketchy shapes — across every level.

## How levels affect rendering

The fidelity level is set once per session via flags:
`--zones`, `--sketch` (default), `--wireframe`, `--detailed`

| Aspect | Zones | Sketch | Wireframe | Detailed |
|---|---|---|---|---|
| **Text** | Zone labels only | Squiggle LINE nodes | Real placeholder text | Real text + edge case annotations |
| **Images** | — | ✕-box | ✕-box + purpose label | ✕-box + label + dimensions |
| **Interactive** | — | Outlined shapes | Shapes + labels | Shapes + labels + state annotations |
| **Data** | — | Dark/light bars | Realistic values | Values + empty/overflow notes |
| **Color** | Grayscale (4 values) | Grayscale (7 values) | Grayscale + blue | Grayscale + blue/red/green/amber |
| **Annotations** | 1-2 yellow stickies | 2-3 yellow stickies | Yellow + blue stickies | Yellow + blue stickies + inline red |

## Palettes

### Base palette (all levels)

```javascript
const C = {
  black:  { r: 0.14, g: 0.14, b: 0.16 },  // page frame, key labels
  dark:   { r: 0.35, g: 0.35, b: 0.38 },  // heading bars, CTAs, table headers
  mid:    { r: 0.58, g: 0.58, b: 0.61 },  // body text lines
  light:  { r: 0.75, g: 0.75, b: 0.78 },  // secondary text, nav items, captions
  vlight: { r: 0.88, g: 0.88, b: 0.89 },  // image fills, subtle backgrounds
  border: { r: 0.7, g: 0.7, b: 0.72 },    // container outlines
  white:  { r: 1, g: 1, b: 1 },            // page background
};
```

At **Zones** level, use only: black, mid, vlight, white.

### Accent palette (wireframe + detailed only)

```javascript
const CA = {
  blue:   { r: 0.24, g: 0.47, b: 0.85 },  // links, focused inputs, interactive
  red:    { r: 0.85, g: 0.24, b: 0.24 },  // errors, required, destructive actions
  green:  { r: 0.24, g: 0.72, b: 0.44 },  // success, active toggles, positive
  amber:  { r: 0.90, g: 0.68, b: 0.15 },  // warnings, attention needed
};
```

Use accents sparingly. They mark semantic meaning, not decoration. A wireframe
with more than 5-6 colored elements has too many.

---

## Zones Level

At `--zones`, the entire page is rendered using ONLY `compZone`. Every
component below is subsumed into its parent zone.

### compZone(x, y, w, h, label)

A major page region. White-filled SQUARE with 2px black stroke. Centered
Figma Hand label in mid-gray, 14px. Zones are arranged proportionally to
match the real page's spatial structure (Rule 6).

Typical zone labels: "Navigation", "Hero", "Sidebar", "Main Content",
"Feed", "Filters", "Footer", "Form", "Data Table", "Actions".

**Hierarchy through fill**: Primary zones get white fill. Secondary zones
get vlight fill. This creates a 2-level depth without adding detail.

**Spacing**: 4-6px gap between adjacent zones. No overlap.

---

## Component Catalog

Components below render at **Sketch**, **Wireframe**, and **Detailed** levels.
At Zones level, they are all represented by their parent `compZone`.

Shape type is SQUARE for all containers unless noted otherwise. Font is
Figma Hand everywhere. Stroke weights follow the line weight hierarchy
defined in SKILL.md.

---

### Core

These are the foundational components. Updated from the original 12 to be
level-aware.

#### compHeader(x, y, w)

App-level navigation bar. The page's own header — distinct from the device
chrome frame.

- **Sketch**: Outlined SQUARE (w × 44px, border 1px). Left: dark SQUARE blob
  (60×10) for logo. Right: 2-4 LINE bars (50px wide, light, 3px stroke) spaced
  evenly as nav items. Far right: outlined SQUARE (80×22, border 1px) with thin
  light LINE inside for search.
- **Wireframe**: Same structure. Logo: Figma Hand "Logo" (light). Nav items:
  Figma Hand labels ("Home", "Products", "About"). Search: Figma Hand
  "Search..." (light) inside box. Far right: compAvatar (24px).
- **Detailed**: Same as Wireframe. Active nav item gets 2px underline in CA.blue.
  Notification indicator: 6px dark circle near bell area. User dropdown chevron
  after avatar. Annotation: "Collapses to hamburger below 768px".

#### compHeading(x, y, text, sz)

Section heading or page title. Real Figma Hand text at every level above Zones.

- **Sketch**: Figma Hand text in dark or black. sz controls font size: "lg" = 18px,
  "md" = 14px, "sm" = 12px. No surrounding box.
- **Wireframe**: Same. Text is the actual heading content ("Account Settings",
  "Recent Orders"). Black for page titles, dark for section headings.
- **Detailed**: Same as Wireframe. Optional subheading LINE (1px, light) below for
  descriptions. If the heading relates to a count, show: "Recent Orders (24)".

#### compTextBlock(x, y, w, lines)

Body copy zone. Represents "text lives here" without specifying content.

- **Sketch**: [lines] LINE nodes (1.5px stroke, mid gray) at 10-12px vertical
  spacing. Widths vary 50-100% of w. NO real text.
- **Wireframe**: Figma Hand text block. Real placeholder sentences in light gray,
  10px font. Lines wrap naturally within w. Content is realistic but generic
  ("Manage your account settings and preferences below.").
- **Detailed**: Same as Wireframe. If the block has a character limit, annotate:
  "Max 280 chars". If it can be empty, annotate: "Empty: 'No description provided'".

#### compButton(x, y, text)

Primary action. Dark-filled rectangle with label.

- **Sketch**: Dark-filled SQUARE (auto-width + 16px padding × 28px). No text label.
  Secondary buttons: outlined SQUARE (border 1px, no fill) same size.
- **Wireframe**: Dark-filled SQUARE + white Figma Hand label (e.g., "Add to Cart",
  "Save Changes"). Secondary: outlined SQUARE + dark Figma Hand label. Tertiary:
  no box, just dark Figma Hand text (link-style).
- **Detailed**: Same as Wireframe. Destructive buttons use CA.red fill. Disabled
  buttons use vlight fill + light text. Loading state annotation: "Spinner replaces
  label on submit". If link-style, use CA.blue text.

#### compInput(x, y, w, label)

Text input field. Single-line form field.

- **Sketch**: Outlined SQUARE (w × 28px, border 2px). Thin light LINE inside
  (60% width) as placeholder hint.
- **Wireframe**: Outlined SQUARE. Figma Hand label above ("Email address", 10px,
  dark). Figma Hand placeholder inside ("jane@example.com", 10px, light).
- **Detailed**: Same as Wireframe. Required field: red asterisk after label.
  Helper text below: Figma Hand "We'll never share your email" (10px, light).
  Error state: border in CA.red + Figma Hand error message below in CA.red
  ("Enter a valid email address"). Focus state: border in CA.blue.

#### compCard(x, y, w, h)

Content card. Image above, text below.

- **Sketch**: Outlined SQUARE (w × h, border 1px). Top half: compImage (✕-box,
  vlight fill). Bottom half: 2-3 LINE nodes (mid, 1.5px, 60-90% width).
- **Wireframe**: Same structure. Image: ✕-box + Figma Hand label ("Product Photo").
  Title: Figma Hand dark ("Wireless Headphones"). Subtitle/price: Figma Hand
  dark ("$129.99"). 1-2 LINE nodes for description. Optional compButton below.
- **Detailed**: Same as Wireframe. Add: compBadge ("In Stock", green) or
  compBadge ("Sold Out", red). compRating if applicable. Action icon (bookmark,
  share) in top-right corner as small SQUARE (vlight). Annotation: "Hover:
  shadow elevation. Empty: 'Coming Soon' overlay".

#### compImage(x, y, w, h, label)

Crossed-box image placeholder (Rule 5).

- **Sketch**: SQUARE (w × h, vlight fill, 1px light stroke). Centered "✕"
  character in light gray. No label.
- **Wireframe**: Same ✕-box. One-word Figma Hand label below or centered:
  "Hero", "Avatar", "Map", "Thumbnail", "Cover" (10px, light).
- **Detailed**: Same as Wireframe. Dimension annotation: "(1200×600)" or
  "(1:1)" below label. Alt text note if relevant: "Alt: Team photo".

#### compSidebar(x, y, w, h, items)

Sidebar navigation panel.

- **Sketch**: Outlined SQUARE (w × h, border 1px). Heading bar: dark SQUARE
  (w-16 × 8px) near top. Below: [items] light LINE bars (varying widths,
  3px stroke) stacked at 8-10px spacing.
- **Wireframe**: Same structure. Heading: Figma Hand label ("Navigation", dark).
  Items: Figma Hand labels ("Dashboard", "Settings", "Team", "Billing") in
  light gray. Active item: dark text + 2px left border bar (dark).
- **Detailed**: Same as Wireframe. Active item left border in CA.blue. Badge
  counts after items: "(3)" for notifications. Collapsed state annotation:
  "Icons only at < 1024px". Section dividers between groups.

#### compSection(x, y, w, title, contentLines)

Content section with heading and text.

- **Sketch**: Thin LINE divider (0.5px, vlight) at top. compHeading (dark, "md")
  below. Then [contentLines] LINE nodes (1.5px, mid) as body text.
- **Wireframe**: Same structure. Heading: real Figma Hand title ("Notification
  Preferences"). Body: Figma Hand text with realistic content or component
  children (inputs, toggles, etc.).
- **Detailed**: Same as Wireframe. Optional description line below heading
  (Figma Hand, light, 10px). Collapsible indicator (chevron) if applicable.

#### compTabs(x, y, labels)

Tab navigation strip.

- **Sketch**: [labels.length] dark LINE bars (40-60px, 3px stroke) spaced
  horizontally at 12px gaps. Thin LINE (1px, light) spanning full width below.
  First bar is dark, rest are light.
- **Wireframe**: Figma Hand labels for each tab ("Overview", "Activity",
  "Settings"). Active tab: dark text + 2px underline bar (dark). Inactive
  tabs: light text.
- **Detailed**: Same as Wireframe. Active tab underline in CA.blue. Badge count
  after tab labels where applicable: "Activity (12)". Disabled tab: vlight text.
  Annotation: "Swipeable on mobile".

#### compInfobox(x, y, w)

Structured data card with key-value pairs, small tables, or mixed content.

- **Sketch**: Outlined SQUARE (w × auto, border 1px). compHeading inside ("sm").
  compImage (small, 40×40) left-aligned. 2-3 pairs of LINE nodes: left LINE
  (light, 40px) + right LINE (mid, 60px) for key-value pairs.
- **Wireframe**: Same structure. Heading: Figma Hand ("Order Summary"). Key-value
  pairs: Figma Hand labels ("Subtotal" / "$89.99", "Shipping" / "Free"). Small
  image: ✕-box with label.
- **Detailed**: Same as Wireframe. Total row: bolder text (dark). Status badge
  (compBadge). Expandable detail annotation if complex.

#### compAvatar(x, y, size)

User avatar placeholder.

- **Sketch**: SQUARE (size × size, vlight fill, 1px border stroke) with "✕".
  Not a circle — intentional imperfection (Rule 4).
- **Wireframe**: Same ✕-square. Figma Hand name LINE beside it if in a label
  context (10px, dark, "Jane Cooper").
- **Detailed**: Same as Wireframe. Status indicator: small 6px circle
  (green = online, vlight = offline) at bottom-right corner. Role/title text
  below name in light.

---

### Navigation

#### compBreadcrumbs(x, y, items)

Hierarchical path indicator. Shows where the user is in the site structure.

- **Sketch**: Horizontal row of light LINE bars (30-50px, 1px stroke) separated
  by small ">" characters (Figma Hand, light, 10px). 3-4 items.
- **Wireframe**: Figma Hand labels for each level ("Home", "Settings", "Profile")
  in light, separated by ">" in light. Last item in dark (current page).
- **Detailed**: Same as Wireframe. Clickable items in CA.blue (except last).
  Truncation: if > 4 levels, middle items collapse to "..." with annotation
  "Dropdown shows full path".

#### compPagination(x, y, totalPages, currentPage)

Page navigation for lists and tables.

- **Sketch**: Horizontal row: small outlined SQUARE (◀), 3-4 small SQUARE
  shapes (16×16, vlight fill), small outlined SQUARE (▶). First inner square
  is dark fill (active page).
- **Wireframe**: Figma Hand labels: "◀" "1" "2" "3" "..." "12" "▶". Current
  page (dark fill, white text). Others (outlined, dark text). Result count
  left: "Showing 1-10 of 248".
- **Detailed**: Same as Wireframe. Disabled prev arrow when on page 1 (vlight).
  "Items per page" dropdown right-aligned. Keyboard annotation: "Arrow keys
  navigate pages".

#### compMenu(x, y, w, items)

Dropdown or context menu. Floating overlay element.

- **Sketch**: Outlined SQUARE (w × auto, border 1px, white fill). [items]
  LINE bars (mid, 1.5px, 80% width) stacked at 8px spacing. 1 vlight
  divider LINE between groups.
- **Wireframe**: Same structure. Figma Hand labels for each item ("Edit",
  "Duplicate", "Move to...", "Delete"). Divider between action groups.
  Icons: small vlight SQUARE (10×10) before each label.
- **Detailed**: Same as Wireframe. Destructive items ("Delete") in CA.red.
  Keyboard shortcuts right-aligned in light ("⌘E", "⌘D"). Disabled items in
  vlight with annotation. Hover state: vlight background fill on hovered item.

---

### Input

#### compDropdown(x, y, w, label)

Select menu / combo box. Input with a dropdown indicator.

- **Sketch**: Outlined SQUARE (w × 28px, border 2px). Thin light LINE inside
  (40% width) as placeholder. Small dark triangle (▼, 6px) right-aligned.
- **Wireframe**: Outlined SQUARE. Figma Hand label above ("Country", 10px, dark).
  Figma Hand selected value inside ("United States", 10px, dark). ▼ chevron.
- **Detailed**: Same as Wireframe. Open state: compMenu appended below with
  3-5 option items. Search variant: compSearch inside dropdown header.
  Error state: border CA.red. Required: red asterisk.

#### compCheckbox(x, y, label)

Binary choice. Square check box with label.

- **Sketch**: Small outlined SQUARE (12×12, border 1.5px) + LINE node (light,
  60-80px) for label text.
- **Wireframe**: Outlined SQUARE (12×12). Figma Hand label beside ("Remember me",
  10px, dark). Checked variant: dark-filled SQUARE with "✓" in white.
- **Detailed**: Same as Wireframe. Three states shown if relevant:
  unchecked / checked / indeterminate (dash). Disabled: vlight fill + light text.
  If part of a group, show compHeading ("sm") above: "Notification Preferences".

#### compRadio(x, y, label)

Mutually exclusive choice. Circle with label.

- **Sketch**: Small ELLIPSE (12×12, border 1.5px, no fill) + LINE node (light,
  60-80px) for label.
- **Wireframe**: ELLIPSE (12×12). Figma Hand label beside ("Monthly billing",
  10px, dark). Selected: ELLIPSE with smaller dark ELLIPSE (6×6) centered inside.
- **Detailed**: Same as Wireframe. Radio group: 3-4 options stacked vertically
  with one selected. Price/description after label: "Monthly — $9/mo". Disabled
  option: vlight + light text.

#### compToggle(x, y, label)

On/off switch. Pill-shaped toggle with label.

- **Sketch**: Rounded SQUARE (32×16, border 1.5px) with small dark circle (10×10)
  inside left (off) or right (on). LINE node (light, 60px) for label.
- **Wireframe**: Same shape. Figma Hand label ("Email notifications", 10px, dark).
  On state: dark fill with white circle right. Off state: vlight fill with dark
  circle left.
- **Detailed**: Same as Wireframe. On state fill uses CA.green. Description text
  below label: "Receive email for new messages" (Figma Hand, 10px, light).
  Annotation: "Changes save immediately (no submit button)".

#### compTextarea(x, y, w, h, label)

Multi-line text input. Taller input box.

- **Sketch**: Outlined SQUARE (w × h, border 2px, min h: 60px). 2-3 thin light
  LINE nodes inside (stacked, 50-80% width) as placeholder. Small grip indicator
  (3 diagonal lines) at bottom-right corner.
- **Wireframe**: Outlined SQUARE. Figma Hand label above ("Description", 10px,
  dark). Figma Hand placeholder inside ("Tell us about your project...", 10px,
  light). Character count right below: "0/500".
- **Detailed**: Same as Wireframe. Character count updates: "342/500".
  Auto-resize annotation: "Grows to max 200px". Error at limit: CA.red count.
  Markdown support note if applicable.

#### compSearch(x, y, w)

Standalone search input with magnifying glass.

- **Sketch**: Outlined SQUARE (w × 28px, border 2px). Small dark circle (8×8)
  + diagonal LINE (4px) at left for magnifying glass icon. Thin light LINE
  (50% width) for placeholder.
- **Wireframe**: Same structure. Figma Hand "Search users..." (10px, light)
  inside. Optional filter badge after search box.
- **Detailed**: Same as Wireframe. Recent searches dropdown annotation.
  Keyboard shortcut hint: "⌘K". Result count: "24 results for 'design'".
  Clear ✕ button when has input.

---

### Display

#### compTable(x, y, w, rows, cols)

Data grid. Header row + data rows with column dividers.

- **Sketch**: Outlined SQUARE (w × auto, border 1px). Top: dark-filled SQUARE
  bar (full width × 28px) for header. Below: [rows] pairs of LINE nodes
  (mid, 1.5px) at 12px row spacing. Thin vlight dividers (0.5px) between rows.
  [cols-1] vertical vlight divider LINEs for columns.
- **Wireframe**: Same structure. Header cells: Figma Hand labels in white on
  dark ("Name", "Email", "Role", "Status"). Data rows: Figma Hand with
  realistic content ("Jane Cooper", "jane@co.com", "Admin"). Sort indicator:
  ▼ after one header. Alternating row fill: every other row gets vlight
  background (optional).
- **Detailed**: Same as Wireframe. compCheckbox column left for row selection.
  Above table: compSearch + compDropdown ("All roles ▾"). Below table:
  compPagination. Row hover: vlight fill annotation. Bulk action bar: "3
  selected — Delete | Export". Empty state: "No users match your filters".
  Loading: "Skeleton rows replace content".

#### compList(x, y, w, items, ordered)

Ordered or unordered list.

- **Sketch**: [items] rows of: bullet (small dark ELLIPSE 4×4) or number +
  LINE node (mid, 1.5px, 60-90% width). Vertical spacing 8-10px.
- **Wireframe**: Same structure. Bullet or "1." / "2." / "3." prefix in dark
  Figma Hand. Content: Figma Hand text ("Review pull request #342", 10px, dark).
- **Detailed**: Same as Wireframe. Nested list support (indented 16px).
  Interactive items: checkbox prefix (task list). Annotation for long lists:
  "Truncated at 10, 'Show all (47)' link".

#### compBadge(x, y, text, color)

Small status indicator or count label.

- **Sketch**: Small SQUARE (auto-width × 14px, dark fill, 4px corner radius).
  No text — just a dark pill shape.
- **Wireframe**: Small SQUARE (auto-width + 8px padding × 16px). Figma Hand
  label inside (text, 9px, white on dark fill). Examples: "Active", "Draft",
  "3", "New".
- **Detailed**: Same as Wireframe. Color-coded fills: CA.green for success/active,
  CA.red for error/critical, CA.amber for warning/pending, dark for neutral.
  Text color: white on dark fills, dark on light fills.

#### compTag(x, y, text)

Category label or filter chip. Outlined, optionally dismissible.

- **Sketch**: Small outlined SQUARE (auto-width × 18px, border 1px, vlight fill).
  No text.
- **Wireframe**: Outlined SQUARE. Figma Hand label inside ("Design", "Frontend",
  9px, dark). Optional small "✕" at right for dismissible tags.
- **Detailed**: Same as Wireframe. Selected state: dark fill + white text.
  Group context: row of 3-5 tags. "+ Add tag" link after last tag in CA.blue.

#### compAccordion(x, y, w, items)

Collapsible content sections. Only one expanded at a time.

- **Sketch**: [items] stacked rows: outlined SQUARE bar (w × 28px, border 1px)
  with small dark triangle (▶ or ▼) left-aligned. First item expanded: bar +
  2-3 LINE nodes (mid, 1.5px) below. Rest collapsed: bar only.
- **Wireframe**: Same structure. Figma Hand labels on each bar ("Shipping Policy",
  "Return Policy", "Size Guide"). Expanded section: Figma Hand body text or
  compTextBlock with real content. Chevron: ▼ for open, ▶ for closed.
- **Detailed**: Same as Wireframe. Annotation: "Default: first item open, rest
  collapsed". "Multi-expand: no — opening one closes others". Transition:
  "150ms ease slide".

#### compProgressBar(x, y, w, percent)

Linear progress indicator.

- **Sketch**: Outlined SQUARE bar (w × 6px, vlight fill, 1px border). Dark-filled
  SQUARE inside (percent% of width × 6px) for progress.
- **Wireframe**: Same structure. Figma Hand label above ("Storage used", 10px,
  dark). Figma Hand value right-aligned ("7.2 GB of 10 GB", 10px, light).
- **Detailed**: Same as Wireframe. Fill color: CA.green under 70%, CA.amber
  70-89%, CA.red 90%+. Annotation: "Animate on load, 300ms ease". Warning
  threshold: "Show upgrade prompt at 90%".

#### compChart(x, y, w, h, type)

Data visualization placeholder. Shows the chart type without real data.

- **Sketch**: Outlined SQUARE (w × h, border 1px). Inside: sketchy axis lines
  (L-shaped, 1px dark) at bottom-left. For bar chart: 3-5 dark SQUARE bars
  of varying heights. For line chart: jagged LINE (1.5px, dark) across width.
  For pie/donut: ELLIPSE with 2-3 divider lines through center.
- **Wireframe**: Same structure. Axis labels: Figma Hand ("Jan", "Feb", "Mar"
  along x-axis, "$0", "$50K", "$100K" along y-axis). Chart title: compHeading
  above ("Revenue by Month", "sm"). Legend: 2-3 small SQUARE (8×8) + Figma Hand
  labels ("This year", "Last year").
- **Detailed**: Same as Wireframe. Tooltip annotation: "Hover shows exact value".
  Data point count: "247 data points". Interaction: "Click bar to drill down".
  Empty state: "No data for this period — adjust date range".

#### compRating(x, y, maxStars, filled)

Star rating indicator.

- **Sketch**: [maxStars] small outlined SQUARE shapes (10×10) in a row. First
  [filled] are dark-filled, rest are vlight.
- **Wireframe**: Same but ★ characters (Figma Hand, 12px). Filled stars dark,
  empty stars light. Count after: "(42 reviews)" in light.
- **Detailed**: Same as Wireframe. Half-star support: "★★★★½". Interactive
  annotation: "Click to rate (if editable)". Distribution: "5★: 28, 4★: 10,
  3★: 3, 2★: 1, 1★: 0".

#### compMapPlaceholder(x, y, w, h)

Geographic map area. Distinct from generic image placeholder.

- **Sketch**: SQUARE (w × h, vlight fill, 1px border). Centered "✕" plus thin
  crosshair LINEs (0.5px, light) dividing into quadrants. Figma Hand "Map"
  centered (10px, light).
- **Wireframe**: Same ✕-box + crosshairs. Figma Hand label: "Map — San Francisco,
  CA". Pin indicator: small dark ELLIPSE (6×6) at center.
- **Detailed**: Same as Wireframe. Zoom controls: "+"/"-" small SQUAREs at
  top-right corner. Annotation: "Interactive — pinch to zoom, drag to pan".
  "Fallback: static image if JS disabled".

#### compVideoPlaceholder(x, y, w, h)

Video or media embed. Distinct from generic image.

- **Sketch**: SQUARE (w × h, vlight fill, 1px border). Centered "✕" plus
  dark triangle (▶, 16×16) centered for play button.
- **Wireframe**: Same ✕-box + ▶. Figma Hand label below: "Product Demo — 2:34".
  Bottom bar: thin dark SQUARE (full width × 4px) with vlight fill for
  scrubber/progress.
- **Detailed**: Same as Wireframe. Controls: ▶/⏸ + volume + fullscreen +
  captions indicators (small dark shapes). Annotation: "Autoplay: no. Captions:
  available. Fallback: thumbnail + play button".

---

### Feedback

#### compAlert(x, y, w, type)

Full-width system message. Banner-style notification.

- **Sketch**: Outlined SQUARE (w × 36px, border 1px, vlight fill). Small dark
  SQUARE (12×12) left for icon. 2 LINE nodes (mid, 1.5px) for message text.
  Small "✕" (Figma Hand, 10px) right-aligned for dismiss.
- **Wireframe**: Same structure. Icon area labeled by type: "i" for info, "!"
  for warning, "✓" for success, "✕" for error. Figma Hand message: "Your
  trial expires in 3 days. Upgrade to keep access." Dismiss "✕" right-aligned.
  compButton at right: "Upgrade".
- **Detailed**: Same as Wireframe. Border-left accent: CA.blue (info), CA.amber
  (warning), CA.green (success), CA.red (error). Dismissible annotation:
  "Persists until dismissed, saves preference". Non-dismissible variant:
  no ✕, cannot be closed.

#### compModal(x, y, w, h)

Dialog overlay. Floating panel over dimmed background.

- **Sketch**: Outlined SQUARE (w × h, border 2px, white fill). Dark SQUARE bar
  (top, full width × 28px) for header. 2-3 LINE nodes for body content. Bottom
  row: 2 small SQUAREs (outlined + dark-filled) for cancel/confirm buttons.
- **Wireframe**: Same structure. Header: Figma Hand title ("Delete Project?",
  dark) + "✕" dismiss right-aligned. Body: Figma Hand text ("This action
  cannot be undone. All data will be permanently removed."). Buttons: compButton
  "Cancel" (outlined) + compButton "Delete" (dark filled).
- **Detailed**: Same as Wireframe. Background: note "Dimmed backdrop, click
  outside to close". Destructive confirm button: CA.red fill. Keyboard: "Esc
  to close, Enter to confirm". Focus trap annotation. Input variant: form
  fields in body.

#### compToast(x, y, w)

Temporary notification. Small floating message.

- **Sketch**: Small outlined SQUARE (w × 32px, border 1px, white fill) positioned
  at top-right or bottom-right of page frame. Small dark SQUARE (10×10) left for
  icon. 1-2 LINE nodes (mid, 1.5px).
- **Wireframe**: Same structure. Icon: "✓" or "!" or "i". Figma Hand message:
  "Changes saved successfully". Dismiss "✕" right-aligned. Optional
  compButton: "Undo".
- **Detailed**: Same as Wireframe. Success icon in CA.green. Error in CA.red.
  Duration: "Auto-dismiss after 5s". Stack behavior: "Max 3, oldest dismisses
  first". Position annotation: "Bottom-right, 16px margin".

#### compSpinner(x, y, size)

Loading indicator. Circular dashed line.

- **Sketch**: Dashed ELLIPSE (size × size, 2px stroke, dark, 270° arc —
  leave gap).
- **Wireframe**: Same dashed arc. Optional Figma Hand label below:
  "Loading..." (10px, light).
- **Detailed**: Same as Wireframe. Size variants noted: "sm (16px) inline,
  md (24px) button, lg (40px) page". Annotation: "Replaces content during
  load. Timeout: show error after 10s".

#### compSkeleton(x, y, w, layout)

Content loading placeholder. Mimics the shape of the content it replaces.

- **Sketch**: Not rendered at sketch level.
- **Wireframe**: Not rendered at wireframe level.
- **Detailed**: Dashed-border SQUAREs and LINEs mimicking the layout of the
  component they replace. For a card: dashed ✕-image area + 3 dashed LINE
  nodes. For a table row: dashed LINE nodes matching column widths. Label:
  "Loading skeleton" (Figma Hand, 9px, light). Annotation: "Pulse animation,
  200ms stagger per element".

---

### Structure

#### compStepper(x, y, steps, current)

Multi-step progress indicator. Numbered circles connected by lines.

- **Sketch**: [steps] small ELLIPSES (16×16) connected by thin LINEs (1px, light).
  Current step: dark fill. Completed steps: dark fill. Future steps: vlight fill.
- **Wireframe**: Same circles. Figma Hand labels below each: ("Account", "Profile",
  "Confirm"). Current step number inside circle (white on dark). Completed:
  "✓" inside. Line between completed steps: dark. Line to future: light.
- **Detailed**: Same as Wireframe. Current step label in dark, others in light.
  Progress: "Step 2 of 4". Annotation: "Click completed steps to go back.
  Cannot skip forward." Error state: CA.red circle for step with validation
  errors.

#### compDivider(x, y, w, label)

Horizontal separator line. Optionally with centered label.

- **Sketch**: LINE node (w, 0.5px stroke, vlight).
- **Wireframe**: Same LINE. If labeled: Figma Hand text centered ("or", "More
  options") with LINE segments on each side.
- **Detailed**: Same as Wireframe. Vertical variant: 0.5px vlight LINE,
  full height. Spacing: "24px above, 24px below".

#### compEmptyState(x, y, w, h)

Zero-content placeholder. Shown when a section has no data.

- **Sketch**: Not rendered at sketch level.
- **Wireframe**: Dashed-border SQUARE (w × h, 1px dashed, vlight). Centered
  Figma Hand text: "No projects yet" (14px, light). compButton below:
  "Create Project".
- **Detailed**: Same as Wireframe. Illustration area: compImage (80×60,
  "Illustration") above text. Description: "Create your first project to get
  started. You can import from GitHub or start from scratch." (Figma Hand,
  10px, light). Secondary action: "Learn more" in CA.blue. Annotation:
  "First-time user sees this. Guide toward first action."

---

## Common Compositions

These are frequently occurring patterns showing how components combine.
Use these as starting points, not rigid templates.

### Login form
compHeading ("Sign In") + compInput ("Email") + compInput ("Password") +
compButton ("Sign In") + compDivider ("or") + compButton ("Continue with
Google", outlined)

### Settings section
compSection ("Notifications") containing: 3× [compToggle + description text].
compButton ("Save Changes") at bottom.

### Data page
compHeader + compBreadcrumbs + compHeading + compSearch + compDropdown (filter) +
compTable (with compPagination) + compEmptyState (when no results)

### Profile header
compImage (cover, full-width × 120px) + compAvatar (64px, overlapping) +
compHeading (name) + compTextBlock (bio) + compButton ("Edit Profile") +
compBadge ("Pro")

### Dashboard
compHeader + 4× compInfobox (metric cards, horizontal row) + compChart
(main visualization) + compTable (recent activity) + compSidebar (navigation)

### Modal confirmation
compModal containing: compHeading ("Delete?") + compTextBlock (warning) +
compButton ("Cancel", outlined) + compButton ("Delete", destructive)
