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
| Existing content -> new content | 300px |
| Sibling frames (within a skill) | 80-100px |
| Row 1 -> Row 2 (multi-row flows) | 200px vertical |

## Per-skill application

| Skill | What gets offset |
|---|---|
| `/build` | Root frame x position |
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
