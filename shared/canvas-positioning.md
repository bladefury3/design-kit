# Canvas Positioning

Every skill that places frames on the Figma canvas MUST scan existing content
first. Never assume the page is empty. Never hardcode `(0, 0)`.

## The scan

Run this in the first `figma_execute` call of every build:

```javascript
const children = figma.currentPage.children;
const selection = figma.currentPage.selection;
let originX = 0, originY = 0;

if (selection.length > 0) {
  const sel = selection[0];
  originX = sel.x + sel.width + 300;
  originY = sel.y;
} else if (children.length > 0) {
  let maxRight = -Infinity, minY = Infinity;
  for (const child of children) {
    const right = child.x + child.width;
    if (right > maxRight) maxRight = right;
    if (child.y < minY) minY = child.y;
  }
  originX = maxRight + 300;
  originY = minY >= 0 ? 0 : minY;
}
return { originX, originY, existingCount: children.length };
```

Move the root frame to `(originX, originY)` IMMEDIATELY after creation.

## Gap constants

| Between | Gap |
|---|---|
| Existing content → new content | 300px |
| State frames (Primary → Empty → Error) | 100px horizontal |
| Row 1 → Row 2 (multi-row flows) | 200px vertical |
| Section label → frame | 40px vertical |

## State frame layout

When a skill creates multiple frames (Primary + Empty + Error + Loading), arrange them
in a horizontal row with consistent spacing:

```
┌─────────────┐  100px  ┌─────────────┐  100px  ┌─────────────┐
│   Primary   │ ◄─────► │    Empty    │ ◄─────► │    Error    │
│  (1440×900) │         │  (1440×900) │         │  (1440×900) │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Positioning code

After cloning each state frame, position it relative to the primary:

```javascript
// After cloning: position state frames in a row
const PRIMARY_WIDTH = primaryFrame.width;
const GAP = 100;

// Empty state: immediately right of primary
emptyFrame.x = primaryFrame.x + PRIMARY_WIDTH + GAP;
emptyFrame.y = primaryFrame.y;

// Error state: right of empty
errorFrame.x = emptyFrame.x + PRIMARY_WIDTH + GAP;
errorFrame.y = primaryFrame.y;

// Loading state (optional): right of error
loadingFrame.x = errorFrame.x + PRIMARY_WIDTH + GAP;
loadingFrame.y = primaryFrame.y;
```

### Section labels (optional)

If adding a label above the frame group (e.g., "Workspace Settings"):

```javascript
const label = figma.createText();
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
label.fontName = { family: "Inter", style: "Semi Bold" };
label.fontSize = 24;
label.characters = "Screen Name";
label.x = primaryFrame.x;
label.y = primaryFrame.y - 40 - label.height;
```

## Per-skill application

| Skill | What gets offset |
|---|---|
| `/build` | Root frame x position; state frames arranged horizontally |
| `/design` | Same as build — primary + states in a row |
| `/build-component` | Component set x after `combineAsVariants` |
| `/flow` | Row 1 starting x; all screen positions shift by originX |
| `/brainstorm` | Variation 1 starts at originX |
| `/responsive` | Desktop frame starts at originX |
| `/capture` | Raw replica starts at originX |

## Rules

- **DO NOT** place at `(0, 0)` without scanning first
- **DO NOT** assume the page is empty
- **DO NOT** create sections as positioning wrappers — position the content frame directly
- **DO** screenshot the target page before creating to see existing content
