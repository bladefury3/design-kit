# Test Checklist — Review Changes

## Test file

**Figma**: https://www.figma.com/design/PPvZgY6JlxWE48iABJZQyc/Design-Kit-Test?node-id=166-17219
**File key**: `PPvZgY6JlxWE48iABJZQyc`
**Eval Page node**: `166:17219`
**Library**: Untitled UI PRO (file key `JhsFSqLI1lWfDZq5I4crsQ` — 145 component sets, 5868 variants, 531 icons)

**Existing content on Eval Page** (8 frames — tests must not overlap these):
- `169:37312` School Feed (x=0, 1440x1848)
- `175:39833` Social Feed (x=1717, 1440x1804)
- `183:40765` Facebook Feed (x=3230, 1440x1335)
- `185:40998` Tech News (x=4796, 1440x980)
- `187:41132` GitHub Repo (x=6536, 1440x790)
- `196:41414` X Feed Page (x=8078, 1440x864)
- `206:26487` Wikipedia — Duffield Memorial (x=9818, 1280x2183)
- `206:26859` Wikipedia — Duffield Memorial (Raw) (x=11298, 1280x3145)

**Extracted design-system data** (already cached in repo):
- `design-system/tokens.json` — 6 collections (Color modes, Radius, Spacing, Widths, Containers, Typography), Light/Dark modes
- `design-system/components/index.json` — 145 component sets, 5868 variants
- `design-system/icons.json` — 531 icons across 21 categories

**Requires**: Figma Desktop with Console MCP plugin running, the test file open.

---

## 1. Lint Script (no Figma needed)

- [ ] Run `./lint-skills.sh` from repo root
- [ ] Verify: 21 skills checked, 0 failures
- [ ] Verify: output shows PASS for frontmatter, tool refs, shared refs, structure
- [ ] Try breaking a SKILL.md (remove `name:` from frontmatter) — verify lint catches it
- [ ] Restore the SKILL.md after testing

## 2. Shared References Load Correctly

Test that skills can find and read the shared/ files. Use the Design-Kit-Test file.

**Test**: Run `/plan` with prompt:
> plan a user profile settings page with sidebar navigation, account details section, and notification preferences

- [ ] Verify: the AI reads `design-system/tokens.json` first (Tier 1 from `shared/design-system-loading.md`)
- [ ] Verify: the AI reads `design-system/components/index.json`
- [ ] Verify: it does NOT call `figma_get_design_system_kit` since local data exists
- [ ] Verify: it reads `shared/tool-selection.md` (mentioned near top of skill)

## 3. Tool Selection Decision Tree (build)

After the plan from test 2 is created, run `/build`.

- [ ] Verify: library components (e.g., Page header, Input field, Button, Avatar label group) use `figma_instantiate_component`
- [ ] Verify: `figma_execute` is used ONLY for multi-step frame creation with token bindings (not for individual component placement)
- [ ] Verify: text on instances uses `figma_set_instance_properties` (not a tree walk via `figma_execute`)
- [ ] Verify: the plan's `build.json` has `variantKey` (40-char hex) on library-component nodes, NOT `figmaKey`

## 4. variantKey vs figmaKey (build)

During the build from test 3:

- [ ] Check a specific component — e.g., Button. Its `defaultVariantKey` in components/index.json should be different from its `figmaKey`
- [ ] Verify: `figma_instantiate_component` receives the variant-level key
- [ ] Verify: the built component is the correct variant (e.g., Desktop/Primary/Default, not a random mobile variant)

## 5. Property Name Matching (plan)

In the plan from test 2:

- [ ] Verify: `propertyOverrides` on Input field nodes use `"Label": false, "Hint text": false` (exact names)
- [ ] Verify: `propertyOverrides` on Button nodes use `"Icon leading": false, "Icon trailing": false`
- [ ] Verify: `propertyOverrides` on Page header nodes use `"Search": false, "Actions": false` (if applicable)
- [ ] After build: screenshot and verify no unwanted "Label", "Hint text", or trailing icons are visible

## 6. Icon Resolution Gate (plan)

**Test**: Run `/plan` with prompt:
> plan a dashboard sidebar with navigation items: Home, Analytics, Users, Settings, Help, and Log out — each with an icon

- [ ] Verify: Step 5.5 resolution pass runs
- [ ] Verify: each icon (home-line, bar-chart-01, users-01, settings-01, help-circle, log-out-01) is resolved to a component key from `design-system/icons.json`
- [ ] Verify: the resolution gate blocks presentation until all icons have keys
- [ ] Verify: zero emoji substitutes in the plan output
- [ ] Verify: build.json has `"type": "library-component"` entries for each icon (not `"type": "token-built"`)

## 7. Error Recovery (build)

**Test**: Temporarily corrupt a `variantKey` in a build.json to test error handling.

- [ ] Change one component's `variantKey` to `"0000000000000000000000000000000000000000"` (invalid)
- [ ] Run `/build` — verify it detects the failure
- [ ] Verify: it searches by component name via `figma_search_components` (not silently skipping)
- [ ] Verify: it presents candidates to the user or creates a labeled placeholder `[Missing: Component Name]`
- [ ] Restore the original build.json after testing

## 8. Screenshot Validation (shared)

During the build from test 3:

- [ ] Verify: screenshots happen after EACH section (sidebar built → screenshot → main content built → screenshot)
- [ ] Verify: the tool used is `figma_take_screenshot` with the section or root frame nodeId
- [ ] Verify: the AI checks each screenshot for: phantom 100px heights, placeholder text ("Olivia Rhye", "Label"), unwanted icons, clipped content
- [ ] Verify: if placeholder text is found, it's fixed before proceeding to the next section

## 9. Typography Extraction (setup-tokens)

**Test**: Run `/setup-tokens` on the Design-Kit-Test file.

- [ ] Verify: it calls `figma_get_text_styles`
- [ ] Verify: output mentions text styles separately from variable-based typography tokens
- [ ] Verify: `design-system/tokens.json` gains a `typography.textStyles` section (or similar)
- [ ] Verify: each text style entry has `$extensions.figma.styleId` for downstream binding
- [ ] Verify: the extraction report distinguishes "N typography variable tokens" from "M text styles"

**Note**: This file uses Untitled UI's published text styles. If `figma_get_text_styles` returns empty (no local text styles), the test still passes if the skill attempts the call.

## 10. State Machine Enrichment (setup-components)

**Test**: Run `/setup-components` on the Design-Kit-Test file. The file has 3 local component sets:
- **Combo box** (56 variants — Type × State × Size, has hover/focus/disabled states)
- **Table filter bar** (6 variants — State × Size)
- **Column manager** (3 variants — State)

- [ ] Verify: it calls `figma_analyze_component_set` on each component set
- [ ] Verify: the Combo box per-component JSON includes a `stateMachine` key
- [ ] Verify: `stateMachine.axes` contains `State: [Placeholder, Hover, Focused, Filled, Open, ...]`
- [ ] Verify: `stateMachine.cssMapping` maps hover→`:hover`, focus→`:focus-visible`, disabled→`:disabled`
- [ ] Verify: `stateMachine.diffFromDefault` shows what changes per state (fills, strokes, opacity, etc.)

## 11. Audit Comment Cleanup (audit)

**Test**: Run `/audit` on the School Feed frame (`169:37312`).

- [ ] Verify: findings are posted as Figma comments with `[Audit]` prefix
- [ ] Verify: the audit produces a score and category breakdown
- [ ] Run `/audit` again on the same frame
- [ ] Verify: old `[Audit]` comments are deleted via `figma_delete_comment` before new ones are posted
- [ ] Verify: only ONE set of audit comments exists (no duplicates)

## 12. Review Component Comment Cleanup (review-component)

**Test**: Run `/review-component` on the Combo box component set (`125:32638`).

- [ ] Verify: the review scores 9 quality dimensions
- [ ] Choose option C (post as comments)
- [ ] Verify: comments are prefixed with `[Review]`
- [ ] Run `/review-component` again on the same component
- [ ] Verify: old `[Review]` comments are cleaned up via `figma_delete_comment`

## 13. Re-verification in Revise (revise)

**Test**: After audit from test 11 finds issues, run `/revise` on the School Feed frame.

- [ ] Verify: it classifies feedback by type (principle-based, usability, content, etc.)
- [ ] Verify: it clones the frame as "[School Feed] [Original]" and works on "[School Feed] [Revised]"
- [ ] Verify: after applying fixes, it offers re-verification:
  > A) Re-check the specific items I just fixed
  > B) Run a full /audit
  > C) Skip
- [ ] Choose A — verify it re-checks only the fixed items (not a full audit)

## 14. Image Fill in Capture (capture)

**Test**: Run `/capture https://news.ycombinator.com` (simple page with no auth).

- [ ] Verify: `figma_set_image_fill` is available in the skill's allowed-tools
- [ ] Verify: raw replica attempts to use image fills for any image elements on the page
- [ ] Verify: mapped version uses token-bound placeholder fills (not image fills)
- [ ] Verify: new frames are placed to the RIGHT of existing content (canvas positioning)

## 15. Canvas Positioning (all build skills)

The Eval Page has 8 frames. The rightmost is Wikipedia Raw at x=11298, width=1280 (right edge at x=12578).

- [ ] Run `/build` — verify the new root frame's x position is ≥12578+300 = ≥12878
- [ ] Verify: `canvasScan()` or equivalent runs in the first `figma_execute` call
- [ ] Verify: nothing overlaps the existing 8 frames
- [ ] Run `/brainstorm` — verify each variation is also positioned right of existing content

## 16. JSON Schemas (no Figma needed)

```bash
# Install a validator if needed: npm install -g ajv-cli
npx ajv validate -s schemas/tokens.schema.json -d design-system/tokens.json
npx ajv validate -s schemas/components-index.schema.json -d design-system/components/index.json
npx ajv validate -s schemas/icons.schema.json -d design-system/icons.json
```

- [ ] `tokens.json` validates against `schemas/tokens.schema.json`
- [ ] `components/index.json` validates against `schemas/components-index.schema.json`
- [ ] `icons.json` validates against `schemas/icons.schema.json`
- [ ] All three schemas are valid JSON (parseable without errors)

## 17. Build-Helpers Canonical Source (no Figma needed)

- [ ] Verify `build-helpers/figma-helpers.js` header says "CANONICAL SOURCE"
- [ ] Verify `build/SKILL.md` says "Canonical source: `build-helpers/figma-helpers.js`"
- [ ] Verify helper function logic matches between both files (names differ: `mkFrame` vs `mkF` etc., but behavior is equivalent)

## 18. Cross-Tool Compatibility (Cursor install)

**Test**: Run `./setup --cursor` to install skills for Cursor.

- [ ] Verify: `.cursor/skills/shared/` directory is created with all 6 shared files
- [ ] Verify: `.cursor/skills/PRINCIPLES.md` is copied
- [ ] Verify: `.cursor/skills/ETHOS.md` is copied
- [ ] Verify: `.cursor/skills/build-helpers/` is copied with all helper files
- [ ] Verify: `.cursor/skills/wireframe/SKETCH-RULES.md` is copied (companion file)
- [ ] Verify: skill SKILL.md files are also installed (e.g., `.cursor/skills/build/SKILL.md`)
- [ ] Test in Cursor: invoke `/build` — verify it can read `shared/tool-selection.md`

---

## Quick Smoke Test (~10 minutes, covers critical path)

All against the Design-Kit-Test file (`PPvZgY6JlxWE48iABJZQyc`).

1. [ ] `./lint-skills.sh` — 21 skills, 0 failures
2. [ ] `/setup-tokens` — check it calls `figma_get_text_styles`
3. [ ] `/plan` a settings page — check: variantKey used (not figmaKey), propertyOverrides with correct names, icon resolution gate passes, no emoji icons
4. [ ] `/build` the plan — check: `figma_instantiate_component` for library components, `figma_set_instance_properties` for text/overrides, canvas positioned right of existing 8 frames, screenshots per section
5. [ ] `/audit` the School Feed frame (`169:37312`) — check: `[Audit]` prefix on comments
6. [ ] `/audit` again — check: old comments deleted before new ones posted
7. [ ] `./setup --cursor` — check: shared/, PRINCIPLES.md, build-helpers/ all copied
