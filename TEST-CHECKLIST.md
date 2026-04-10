# Test Checklist — Review Changes

Testing guide for changes from commits `887c067`, `df0dbc3`, and `a332f0d`.
Requires: Figma Desktop with Console MCP plugin running, a design file with
a published component library (e.g., Untitled UI).

## 1. Lint Script (no Figma needed)

- [ ] Run `./lint-skills.sh` from repo root
- [ ] Verify: 21 skills checked, 0 failures
- [ ] Verify: output shows PASS for frontmatter, tool refs, shared refs, structure
- [ ] Try breaking a SKILL.md (remove `name:` from frontmatter) — verify lint catches it
- [ ] Restore the SKILL.md after testing

## 2. Shared References Load Correctly

Test that skills can find and read the shared/ files.

- [ ] Run `/build` in a conversation — verify it mentions "shared/tool-selection.md" or follows its guidance (uses `figma_instantiate_component` for library components, not `figma_execute`)
- [ ] Run `/plan` in a conversation — verify it follows the 3-tier design system loading from `shared/design-system-loading.md` (reads local JSONs first, falls back to MCP kit)
- [ ] Run `/flow` — verify canvas positioning doesn't overlap existing content
- [ ] Run `/brainstorm` — verify it doesn't inline the old 20-line fallback chain

## 3. Tool Selection Decision Tree (build)

- [ ] Run `/plan` then `/build` for a simple screen (e.g., "settings page with sidebar")
- [ ] Verify: library components use `figma_instantiate_component` (not `figma_execute`)
- [ ] Verify: text on instances uses `figma_set_instance_properties` (not tree walk)
- [ ] Verify: the plan's `build.json` has `variantKey` on library-component nodes
- [ ] Verify: property overrides are applied (no "Label", "Hint text" showing)

## 4. variantKey vs figmaKey (build)

- [ ] In build, check that `figma_instantiate_component` receives a variant-level key
- [ ] Verify: the key matches `defaultVariantKey` from `design-system/components/index.json`, NOT `figmaKey`
- [ ] If using a stale components/index.json — verify the error recovery section triggers (re-search via `figma_search_components`)

## 5. Property Name Matching (plan)

- [ ] Run `/plan` for a screen with input fields
- [ ] Verify: `propertyOverrides` in build.json use correct property names ("Label", "Hint text", etc.)
- [ ] Verify: the plan mentions the property name matching warning (case-sensitive)

## 6. Icon Resolution Gate (plan)

- [ ] Run `/plan` for a screen that needs icons (e.g., "sidebar nav with home, settings, users icons")
- [ ] Verify: Step 5.5 resolution pass runs and resolves every icon to a component key
- [ ] Verify: the plan does NOT present until the resolution gate passes
- [ ] Verify: no emoji are used as icon substitutes in the plan

## 7. Error Recovery (build)

- [ ] If a component instantiation fails during `/build` — verify the error recovery section triggers
- [ ] Verify: it suggests re-searching via `figma_search_components`, not silently skipping
- [ ] If a token binding fails — verify it falls back to hardcoded value AND flags it

## 8. Screenshot Validation (shared)

- [ ] Run `/build` — verify it screenshots after each section (not all at once)
- [ ] Verify: uses `figma_take_screenshot` (not `figma_capture_screenshot`) for validation
- [ ] Verify: checks for phantom 100px heights, placeholder text, unwanted labels

## 9. Typography Extraction (setup-tokens)

- [ ] Run `/setup-tokens` on a file with text styles
- [ ] Verify: it calls `figma_get_text_styles` in addition to `figma_get_styles`
- [ ] Verify: `design-system/tokens.json` has a `typography.textStyles` section
- [ ] Verify: each text style has `$extensions.figma.styleId`

## 10. State Machine Enrichment (setup-components)

- [ ] Run `/setup-components` on a file with component sets that have state variants (hover, focus, disabled)
- [ ] Verify: it calls `figma_analyze_component_set` on component sets
- [ ] Verify: per-component JSONs in `design-system/components/<name>.json` have a `stateMachine` key
- [ ] Verify: `stateMachine` contains `axes`, `cssMapping`, `diffFromDefault`

## 11. Audit Comment Cleanup (audit)

- [ ] Run `/audit` on a frame — verify findings are posted as Figma comments with `[Audit]` prefix
- [ ] Run `/audit` again on the same frame — verify old `[Audit]` comments are deleted before new ones are posted
- [ ] Verify: no duplicate audit comments accumulate

## 12. Review Component Comment Cleanup (review-component)

- [ ] Run `/review-component` on a component — choose option C (post as comments)
- [ ] Verify: comments are prefixed with `[Review]`
- [ ] Run again — verify old `[Review]` comments are cleaned up

## 13. Re-verification in Revise (revise)

- [ ] Run `/audit` to find issues, then `/revise` to fix them
- [ ] After revisions, verify it offers re-verification options (A/B/C)
- [ ] Choose A — verify it re-checks only the specific items that were fixed

## 14. Image Fill in Capture (capture)

- [ ] Run `/capture` on a URL with images (e.g., a blog post with hero image)
- [ ] Verify: raw replica uses `figma_set_image_fill` for image elements
- [ ] Verify: mapped version uses token-bound placeholder fills (not image fills)

## 15. Canvas Positioning (all build skills)

- [ ] Have existing content on the Figma page
- [ ] Run `/build` — verify new content is placed 300px to the right, not overlapping
- [ ] Run `/build-component` — verify same positioning behavior
- [ ] Run `/brainstorm` — verify variations don't overlap

## 16. JSON Schemas (manual validation)

- [ ] After running `/setup-tokens`, validate `design-system/tokens.json` against `schemas/tokens.schema.json`
- [ ] After running `/setup-components`, validate `design-system/components/index.json` against `schemas/components-index.schema.json`
- [ ] After running `/setup-icons`, validate `design-system/icons.json` against `schemas/icons.schema.json`
- [ ] Validation can be done with any JSON Schema validator (e.g., `npx ajv validate -s schemas/tokens.schema.json -d design-system/tokens.json`)

## 17. Build-Helpers Canonical Source

- [ ] Read `build-helpers/figma-helpers.js` — verify header says "CANONICAL SOURCE"
- [ ] Compare `mkF`, `mkT`, `bf`, `bs` functions between `build-helpers/figma-helpers.js` and `build/SKILL.md` — verify they match
- [ ] Verify `build/SKILL.md` references "Canonical source: `build-helpers/figma-helpers.js`"

## Quick Smoke Test (covers most changes in ~10 minutes)

1. [ ] `./lint-skills.sh` — all pass
2. [ ] `/setup-tokens` on a real file — check for typography.textStyles in output
3. [ ] `/plan` a simple screen — check variantKey, propertyOverrides, icon resolution
4. [ ] `/build` the plan — check tool selection (instantiate vs execute), canvas positioning, screenshots
5. [ ] `/audit` the result — check [Audit] prefix on comments
6. [ ] `/audit` again — check old comments cleaned up
