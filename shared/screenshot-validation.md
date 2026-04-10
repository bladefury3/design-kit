# Screenshot Validation

Standard workflow for visual validation after creating or modifying Figma content.

## Which screenshot tool to use

The MCP has two screenshot tools. Using the right one avoids wasted tokens and latency.

| Tool | How it works | Best for |
|---|---|---|
| `figma_take_screenshot` | REST API. Supports up to 4x scale, PNG/JPG/SVG/PDF. Requires `nodeId` or captures viewport. | **Validation after building.** Pass the root frame or section `nodeId` to capture exactly what you built. |
| `figma_capture_screenshot` | Desktop Bridge (Plugin API). AI-optimized: 1x PNG, auto-caps at 1568px width. | **Analysis during planning.** Lighter weight, faster, good for capturing existing designs to analyze. |

**Default**: Use `figma_take_screenshot` for build validation (you have the nodeId).
Use `figma_capture_screenshot` for exploratory captures (analyzing existing designs).

## The loop

After creating or modifying ANY visual element:

1. **Screenshot**: `figma_take_screenshot` with `nodeId` of the root frame or section
2. **Check**: Analyze the screenshot for issues (see checklist below)
3. **Fix**: If issues found, fix immediately — don't move to the next section
4. **Re-screenshot**: Verify the fix worked
5. **Max 3 iterations**: If still broken after 3 attempts, flag it and move on

## When to screenshot

| After... | Screenshot... |
|---|---|
| Building a section | The section frame |
| Instantiating components | The parent section |
| Setting property overrides | The affected component |
| Final build completion | The entire root frame |

**One section at a time.** Build sidebar -> screenshot -> fix. Then feed ->
screenshot -> fix. Not all at once.

## Checklist

Every screenshot must be checked for:

- [ ] **Phantom heights**: Any frame stuck at 100px (created with `resize(w, 100)` instead of `resize(w, 1)`)
- [ ] **Unwanted labels**: Library components showing default "Label", "Hint text", or "Supporting text" (missing property overrides)
- [ ] **Placeholder text**: "Olivia Rhye", "Lorem ipsum", "UX review presentations", or any UI kit defaults
- [ ] **Icon placeholders**: Circle or square shapes where icons should be (missing icon instantiation)
- [ ] **Emoji icons**: Any emoji character used as an icon substitute
- [ ] **Clipped content**: Text or elements cut off by container bounds (`clipsContent` not set to `false`)
- [ ] **Overlapping content**: New frames placed on top of existing content (canvas positioning not applied)
- [ ] **Visual balance**: Spacing looks consistent, alignment lines maintained, hierarchy clear

## Common fixes

| Issue | Fix |
|---|---|
| 100px phantom height | `frame.resize(width, 1)` — auto-layout HUG expands it |
| Unwanted labels showing | `figma_set_instance_properties` with `{ "Label": false, "Hint text": false }` |
| Default placeholder text | `figma_set_instance_properties` or tree walk with `sweepText()` |
| Content clipped | `frame.clipsContent = false` on every frame |
| Overlapping existing content | Reposition using `canvasScan()` from `shared/canvas-positioning.md` |
