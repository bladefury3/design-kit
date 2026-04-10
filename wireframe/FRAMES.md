# Device Frames

Every wireframe is wrapped in a device chrome frame that communicates
"this is a web page" or "this is a mobile app." The frame is drawn in
the same hand-drawn aesthetic as the wireframe content — Figma Hand font,
grayscale, sketchy shapes.

The frame is the outermost element. Page content (from the component
vocabulary) goes inside it.

## Frame Selection

| Context | Frame | Default width |
|---|---|---|
| Web page, SaaS, dashboard | `compBrowserFrame` | 1440px |
| Mobile app, responsive mobile | `compMobileFrame` | 390px |
| Tablet layout | `compTabletFrame` | 820px (portrait) / 1080px (landscape) |
| No device context needed | `compPlainFrame` | User-specified |

**Auto-detection**: If the input is a URL, default to `compBrowserFrame`.
If the description mentions "mobile app" or "iOS/Android", use
`compMobileFrame`. If ambiguous, ask.

---

## compBrowserFrame(x, y, w, pageHeight, url)

Sketchy browser window chrome. The most common frame — use for any web content.

### Structure

```
┌──────────────────────────────────────────────┐
│  ● ● ●     [ URL bar                      ] │  ← Title bar (36px)
├──────────────────────────────────────────────┤
│                                              │
│              Page content                    │  ← Content area (pageHeight)
│              goes here                       │
│                                              │
└──────────────────────────────────────────────┘
```

### Construction

1. **Outer frame**: SQUARE (w × titleBarHeight + pageHeight), black stroke
   3px, white fill.
2. **Title bar**: SQUARE (w × 36px, vlight fill, no separate stroke — shares
   top edge with outer frame). Bottom edge: 1px light LINE divider.
3. **Traffic lights**: 3 ELLIPSES (8×8) at left of title bar, 12px from left
   edge, spaced 10px apart. All mid-gray fill, no stroke.
4. **URL bar**: Outlined SQUARE (60% of w × 20px, 1px border, white fill),
   centered horizontally in title bar.
5. **Content area**: The region below the title bar where page components
   are placed.

### Per-level detail

| Element | Zones | Sketch | Wireframe | Detailed |
|---|---|---|---|---|
| Traffic lights | 3 mid-gray circles | 3 mid-gray circles | 3 mid-gray circles | 3 circles (subtle CA.red / CA.amber / CA.green fills) |
| URL bar | Empty outlined box | Empty outlined box | Figma Hand path text: "/settings" (10px, light) | Full URL: "app.company.com/settings" (10px, light) |
| Tab indicators | — | — | 1 tab shape above URL bar (dark, "Settings") | 2-3 tab shapes ("Settings" active dark, others light) |
| Viewport label | — | — | — | Figma Hand below frame: "1440 × 900" (9px, light) |

### Code pattern

```javascript
// Browser frame — draw before page content
const TITLE_H = 36;

// Outer shell
const shell = figma.createShapeWithText();
shell.shapeType = 'SQUARE';
shell.resize(w, TITLE_H + pageHeight);
shell.fills = [{ type: 'SOLID', color: C.white }];
shell.strokes = [{ type: 'SOLID', color: C.black }];
shell.strokeWeight = 3;
sec.appendChild(shell);
shell.x = x; shell.y = y;

// Title bar background
const titleBar = figma.createShapeWithText();
titleBar.shapeType = 'SQUARE';
titleBar.resize(w - 6, TITLE_H);  // inset for stroke
titleBar.fills = [{ type: 'SOLID', color: C.vlight }];
titleBar.strokes = [];
sec.appendChild(titleBar);
titleBar.x = x + 3; titleBar.y = y + 3;

// Traffic lights
for (let i = 0; i < 3; i++) {
  const dot = figma.createEllipse();
  dot.resize(8, 8);
  dot.fills = [{ type: 'SOLID', color: C.mid }];
  dot.strokes = [];
  sec.appendChild(dot);
  dot.x = x + 14 + i * 14;
  dot.y = y + 14;
}

// URL bar
const urlBar = figma.createShapeWithText();
urlBar.shapeType = 'SQUARE';
const urlW = Math.round(w * 0.6);
urlBar.resize(urlW, 20);
urlBar.fills = [{ type: 'SOLID', color: C.white }];
urlBar.strokes = [{ type: 'SOLID', color: C.border }];
urlBar.strokeWeight = 1;
sec.appendChild(urlBar);
urlBar.x = x + Math.round((w - urlW) / 2);
urlBar.y = y + 8;

// Divider between title bar and content
const divider = figma.createLine();
divider.resize(w - 6, 0);
divider.strokes = [{ type: 'SOLID', color: C.light }];
divider.strokeWeight = 1;
sec.appendChild(divider);
divider.x = x + 3;
divider.y = y + TITLE_H;

// Content origin for page components:
// contentX = x + 3, contentY = y + TITLE_H + 1
```

---

## compMobileFrame(x, y, w, pageHeight)

Sketchy smartphone outline. Use for mobile apps and responsive mobile views.

### Structure

```
╭──────────────────╮
│   9:41     ▐█▌   │  ← Status bar (24px)
│ ─────────────── │  ← Notch/island
├──────────────────┤
│                  │
│   Page content   │  ← Content area (pageHeight)
│                  │
├──────────────────┤
│     ───────      │  ← Home indicator (20px)
╰──────────────────╯
```

### Construction

1. **Outer frame**: SQUARE (w × statusBarH + pageHeight + homeBarH), black
   stroke 3px, white fill, 20px corner radius (intentionally imperfect —
   use rounded rectangle for this one exception).
2. **Status bar**: 24px tall region at top. Content varies by level.
3. **Notch/island**: Small SQUARE (80×20, dark fill, 10px radius) centered
   at top, overlapping status bar slightly. Or dynamic island: smaller SQUARE
   (40×14). Use island style as default (modern).
4. **Home indicator**: 20px tall region at bottom. Centered SQUARE bar
   (100×4, dark fill, 2px radius).
5. **Content area**: Between status bar and home indicator.

### Per-level detail

| Element | Zones | Sketch | Wireframe | Detailed |
|---|---|---|---|---|
| Status bar | — | Dark LINE bar (light, 60%) | Figma Hand "9:41" left, battery shape right | "9:41" + carrier + signal bars + battery % |
| Dynamic island | — | Small dark pill shape | Small dark pill | Dark pill + annotation: "Expands for calls/music" |
| Home indicator | — | Short dark bar | Short dark bar | Dark bar + annotation: "Swipe up to go home" |
| Device label | — | — | — | Figma Hand below: "390 × 844 (iPhone 15)" (9px, light) |

### Code pattern

```javascript
const STATUS_H = 24;
const HOME_H = 20;
const CORNER_R = 20;

// For mobile, use figma.createRectangle() for rounded corners
const shell = figma.createRectangle();
shell.resize(w, STATUS_H + pageHeight + HOME_H);
shell.fills = [{ type: 'SOLID', color: C.white }];
shell.strokes = [{ type: 'SOLID', color: C.black }];
shell.strokeWeight = 3;
shell.cornerRadius = CORNER_R;
sec.appendChild(shell);
shell.x = x; shell.y = y;

// Dynamic island
const island = figma.createRectangle();
island.resize(40, 14);
island.fills = [{ type: 'SOLID', color: C.dark }];
island.strokes = [];
island.cornerRadius = 7;
sec.appendChild(island);
island.x = x + Math.round((w - 40) / 2);
island.y = y + 6;

// Status bar text (wireframe level+)
// Left: "9:41", Right: battery/signal shapes

// Home indicator
const homeBar = figma.createRectangle();
homeBar.resize(100, 4);
homeBar.fills = [{ type: 'SOLID', color: C.dark }];
homeBar.strokes = [];
homeBar.cornerRadius = 2;
sec.appendChild(homeBar);
homeBar.x = x + Math.round((w - 100) / 2);
homeBar.y = y + STATUS_H + pageHeight + 8;

// Content origin:
// contentX = x + 3, contentY = y + STATUS_H
```

---

## compTabletFrame(x, y, w, pageHeight, orientation)

Sketchy tablet outline. Larger than mobile, can be portrait or landscape.

### Structure

Portrait is the same as compMobileFrame but wider and taller. Landscape
rotates: status bar stays at top, home indicator at bottom, but proportions
shift.

| Orientation | Width | Typical pageHeight |
|---|---|---|
| Portrait | 820px | 1080px |
| Landscape | 1080px | 720px |

### Construction

Same as compMobileFrame with adjusted dimensions:
- Corner radius: 16px
- Dynamic island: 50×16 (slightly larger)
- Home indicator bar: 120×4
- Status bar height: 24px

### Per-level detail

Same as compMobileFrame. At Detailed level, label below frame reads:
"820 × 1180 (iPad Air, portrait)" or "1080 × 810 (iPad Air, landscape)".

---

## compPlainFrame(x, y, w, pageHeight)

Minimal frame. Just a bordered rectangle with no device chrome. Use when
the device context doesn't matter or when sketching abstract layouts.

### Structure

```
┌──────────────────────────────────────────────┐
│                                              │
│              Page content                    │
│              goes here                       │
│                                              │
└──────────────────────────────────────────────┘
```

### Construction

1. **Frame**: SQUARE (w × pageHeight), black stroke 3px, white fill.
2. No additional chrome — content starts immediately inside.

This is the current wireframe behavior. It remains the fallback when no
device context is specified and the user doesn't have a preference.

### Per-level detail

| Element | Zones | Sketch | Wireframe | Detailed |
|---|---|---|---|---|
| Frame border | 3px black | 3px black | 3px black | 3px black |
| Page title | — | — | Figma Hand above frame: "Settings Page" (12px, dark) | Title + viewport: "Settings Page — 1440px" (12px, dark) |

---

## Frame + Section Integration

Every wireframe is wrapped in a FigJam section. The hierarchy is:

```
FigJam Section ("Settings — Sketch")
  └── Device Frame (compBrowserFrame / compMobileFrame / ...)
       └── Page Content (components from VOCABULARY.md)
  └── Annotation Stickies (positioned to the right)
```

### Section naming convention

`"{Page Name} — {Level}"`

Examples:
- "Settings — Zones"
- "Dashboard — Sketch"
- "Checkout Flow — Wireframe"
- "Profile — Detailed"

For multi-screen flows, each screen gets its own section:
- "Signup Flow: Step 1 — Wireframe"
- "Signup Flow: Step 2 — Wireframe"

### Section sizing

The section wraps the device frame with 40px padding on all sides, plus
additional width on the right for annotation stickies (200px).

```javascript
const sectionW = frameW + 40 + 40 + 200;  // left pad + right pad + sticky space
const sectionH = frameH + 40 + 40;
sec.resizeWithoutConstraints(sectionW, sectionH);
```

### Sticky placement

Annotation stickies go inside the section, to the right of the device frame:

```javascript
const stickyX = frameX + frameW + 30;  // 30px gap from frame edge
const stickyY = frameY;                // align top with frame
// Stack stickies vertically with 12px gaps
```

---

## Frame Selection by Level

The frame choice is independent of fidelity level — you can have a browser
frame at Zones level or a mobile frame at Detailed level. The level affects
what the frame SHOWS (URL text, status bar details), not whether a frame
is used.

However, at **Zones** level, the frame is simplified:
- Browser: title bar with dots only, no URL text
- Mobile: outline only, no status bar content
- Tablet: same as mobile
- Plain: just the rectangle

This keeps the Zones output maximally abstract — the frame communicates
"this is a web page" without adding detail that distracts from the zone layout.
