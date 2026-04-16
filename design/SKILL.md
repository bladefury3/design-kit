---
name: design
description: |
  End-to-end autonomous design workflow. Takes a brief, gathers context, plans,
  builds in Figma, generates states, audits, revises, stress-tests, and prepares
  handoff — all in one pipeline with quality gates. Use for hands-off design execution.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_get_design_system_summary
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_capture_screenshot
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_get_component_for_development
  - mcp__figma-console__figma_get_component_for_development_deep
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_instantiate_component
  - mcp__figma-console__figma_set_fills
  - mcp__figma-console__figma_set_strokes
  - mcp__figma-console__figma_set_text
  - mcp__figma-console__figma_set_instance_properties
  - mcp__figma-console__figma_resize_node
  - mcp__figma-console__figma_move_node
  - mcp__figma-console__figma_create_child
  - mcp__figma-console__figma_clone_node
  - mcp__figma-console__figma_rename_node
  - mcp__figma-console__figma_delete_node
  - mcp__figma-console__figma_get_variables
  - mcp__figma-console__figma_get_token_values
  - mcp__figma-console__figma_get_styles
  - mcp__figma-console__figma_get_text_styles
  - mcp__figma-console__figma_get_annotations
  - mcp__figma-console__figma_set_annotations
  - mcp__figma-console__figma_get_annotation_categories
  - mcp__figma-console__figma_lint_design
  - mcp__figma-console__figma_check_design_parity
  - mcp__figma-console__figma_generate_component_doc
  - mcp__figma-console__figma_scan_code_accessibility
  - mcp__figma-console__figma_post_comment
  - mcp__figma-console__figma_get_comments
  - mcp__figma-console__figma_delete_comment
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_navigate
  - WebSearch
  - WebFetch
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Autonomous Design

You are an end-to-end design engine. You take a brief — anywhere from "design the
settings page" to a detailed spec — and produce a complete, audited, stress-tested
design in Figma with developer handoff specs.

**This skill is an orchestrator.** It sequences the existing standalone skills
(`/plan`, `/build`, `/audit`, `/revise`, `/stress-test`, `/handoff`) into an
autonomous pipeline with quality gates. It does NOT re-implement those skills —
it reads and follows their SKILL.md files at each phase.

For multi-screen flows, it also reads `flow/SKILL.md` for flow planning
(topology, cross-screen consistency, edge screens) and delegates building
to `/build` per screen. One entry point for single screens and flows.

Read `shared/tool-selection.md` for the decision tree on which MCP tool to use.
Read `shared/error-recovery.md` for error handling and retry patterns.
Read `shared/screenshot-validation.md` for visual validation workflow.
Read `shared/canvas-positioning.md` for placing frames on the canvas.
Read `shared/decision-capture.md` — when the pipeline routes single vs multi-screen, or a phase output overrides a sensible default, append a one-liner to `design-system/decisions.md` (the autonomous workflow log lives in `plans/<feature>/workflow-log.md`; cross-feature decisions belong in `decisions.md`).

See `PRINCIPLES.md` for Nielsen heuristics, Gestalt principles, and design frameworks.

## The Pipeline

```
ROUTE → CONTEXT → PLAN → BUILD → STATES → AUDIT → REVISE → STRESS-TEST → HANDOFF
  │        │        │       │       │        │       │          │           │
  │        │      gate 1  gate 2  gate 3  gate 4  gate 5    gate 6      done
  │        │      ≥75%    5/5     Empty+   ≥7.0   ≥7.0      ≥B
  │        │      comp.   checks  Error    score  after fix  grade
  │        │      coverage        required
  │        │
  │        └── if missing: inline setup-product logic
  │
  ├── single screen: PLAN uses plan/SKILL.md, BUILD uses build/SKILL.md
  └── multi-screen:  PLAN uses flow/SKILL.md Steps 1-4, BUILD uses build/SKILL.md per screen
```

All decisions and gate results are logged to `plans/<feature>/workflow-log.md`.

---

## Pipeline Rules (read before starting any phase)

### Rule 1: ALL phases are mandatory
Every phase must execute. Stress-test and handoff are lightweight — 3-4 tool calls
combined. There is no valid reason to skip them. If you finish the audit and feel
"done," you are NOT done. Continue through stress-test, handoff, then present.

### Rule 2: Context budget
Build fix iterations are capped at **2 per section**. After 2 fix attempts on a
section, accept the result and move on. Spending excessive context on perfecting one
section starves later phases (states, stress-test, handoff). A design with all
phases completed at 80% quality > one with 3 phases at 95% quality.

### Rule 3: State minimums
States MUST include at minimum: **Empty + Error**. These two are mandatory even if
context is running low. Loading and Success are optional. Two well-designed states >
four skipped ones.

### Rule 4: No user prompts between phases
Run autonomously. Do NOT ask the user for approval between phases. Report progress
at milestones but keep executing. The only hard stop is if context is completely
missing (no product.json AND the user gave a one-word brief with no URL).

### Rule 5: Read skill files at each phase
For each phase that maps to a standalone skill, **read that skill's SKILL.md** and
follow its instructions. This ensures improvements to individual skills automatically
flow into the pipeline. Do not rely on remembered instructions — read the file fresh.

---

## Phase 0: ROUTE

Parse the brief before starting any phase. Determine if this is a single-screen
or multi-screen request.

**Multi-screen signals:** "flow", "onboarding", "checkout", "wizard", "steps",
"sequence", "journey", "all screens", "dashboard to confirmation", "start to finish",
or any brief that describes 2+ connected pages with transitions between them.

**Single-screen signals:** "page", "screen", "settings", "dashboard" (alone),
"modal", "dialog", or any brief describing a single view.

### If multi-screen:

1. Log to workflow-log.md: "Brief describes a multi-screen flow. Routing to flow planning."
2. Run Phase 1 (CONTEXT) as normal — load product.json, tokens, components.
3. For Phase 2 (PLAN): read `flow/SKILL.md` and follow Steps 1-4 only
   (flow mapping, per-screen planning, edge screens, context.md).
   Skip Steps 5-6 (build + present) — those are handled below.
4. For Phase 3 (BUILD): build ONE screen at a time using `build/SKILL.md`.
   Between screens, enforce `context.md` shared decisions and replay shared
   component customizations. Position screens per flow layout rules
   (200px horizontal gap, edge screens in Row 2). Add flow annotation pills.
   Cap at 4 screens per session — present progress and continue if more needed.
5. Resume Phase 4 (AUDIT) through Phase 7 (HANDOFF) on the primary screen
   (the most complex happy-path screen in the flow).

### If single screen:

Proceed to Phase 1 (CONTEXT) as normal. No changes to existing pipeline.

### If ambiguous:

Default to single screen. The user can say "make it a flow" to trigger re-routing.

---

## Phase 1: CONTEXT

This phase is unique to `/design` — no standalone skill handles it.

### 1a. Product context

Read from the project directory:
- `design-system/product.json` — product identity, users, IA, terminology
- `design-system/content-guide.md` — voice, tone, content patterns
- `design-system/layout-patterns.json` — page archetypes for pattern matching

**If `product.json` is missing:**
1. Ask the user: "Tell me about this product in a sentence, and what page you
   want designed. If you have a live URL, share it."
2. From their answer + the brief, infer: product type, primary users, domain,
   terminology. Don't write product.json — hold the context for this session.
3. Log: "Product context: inferred (consider running /setup-product for persistence)."

### 1b. Design system data

Follow `shared/design-system-loading.md` for the full fallback:
- `design-system/tokens.json`
- `design-system/components/index.json`
- `design-system/relationships.json`
- `design-system/icons.json` (optional)

### 1c. Prior screen context

Check for `plans/<feature>/context.md`. If this screen is part of an existing flow,
enforce all shared decisions (header, nav, spacing, typography).

### 1d. Start workflow log

Create `plans/<feature>/workflow-log.md`:

```markdown
# Workflow Log — [feature name]

**Brief**: [original user brief]
**Started**: [date]
**Product context**: [loaded | inferred | missing]
**Design system**: [loaded | partial | fallback]

## Phases
```

---

## Phase 2: PLAN

**Read and follow `plan/SKILL.md`.**

This phase produces `plans/<feature>/plan.md` and `plans/<feature>/build.json`.

Autonomous-mode overrides:
- Skip user approval prompts — proceed directly after writing plan files
- Use the brief from Phase 1 as the input (don't re-ask the user)
- Apply product.json and content-guide.md loaded in Phase 1

### Gate 1: Component coverage ≥ 75%

Count: `library components / total UI elements`. If below 75%, search for
additional components. If still below, log and proceed with reduced fidelity.

Log to workflow-log.md:
```markdown
### Phase 2: PLAN
- Archetype matched: [pattern name]
- Sections: [count]
- Components: [library count] / [total count] = [percentage]%
- Content inventory: [complete | partial]
- **Gate 1**: [PASS | WARN] — component coverage [percentage]%
```

---

## Phase 3: BUILD

**Read and follow `build/SKILL.md`.**

Feed it the `plans/<feature>/build.json` created in Phase 2.

Autonomous-mode overrides:
- Skip user approval prompts
- Max **2 fix iterations** per section (Rule 2 — preserve context for later phases)
- After build completes, generate states immediately (Phase 6 of build/SKILL.md)

### Gate 2: Build validation (5 checks)

1. **Coverage**: Every manifest item created
2. **Text**: No placeholder or Lorem ipsum
3. **Properties**: Boolean props set correctly
4. **Token binding**: Colors/spacing use tokens
5. **Visual**: Screenshot shows correct alignment

Log to workflow-log.md:
```markdown
### Phase 3: BUILD
- Root frame: [nodeId] ([width]x[height])
- Components instantiated: [count]
- Token-built elements: [count]
- Component probe: [PASS | timed out → token-built-only]
- Validation: coverage [✓|✗], text [✓|✗], properties [✓|✗], tokens [✓|✗], visual [✓|✗]
- **Gate 2**: [PASS | FAIL — fixed N issues]
```

### Gate 3: State generation (MANDATORY: Empty + Error)

After build + states, verify at minimum Empty and Error states were generated.
Loading and Success are optional.

Log to workflow-log.md:
```markdown
### Phase 4: STATES
- States generated: [list with node IDs]
- States skipped: [list + reason]
- **Gate 3**: [PASS | PARTIAL]
```

**Progress: Phases 1-3 complete (build + states). Remaining: AUDIT → REVISE (conditional) → STRESS-TEST → HANDOFF. Continue.**

---

## Phase 4: AUDIT

**Read and follow `audit/SKILL.md`.**

Run the audit on the primary frame from Phase 3.

Autonomous-mode overrides:
- Skip user approval prompts
- Use the primary frame node ID from the build phase
- If this screen is part of a flow (context.md exists), include cross-screen checks

### Gate 4: Audit score ≥ 7.0

If score ≥ 7.0: skip REVISE, proceed to stress-test.
If score < 7.0: proceed to REVISE.

Log to workflow-log.md:
```markdown
### Phase 5: AUDIT
- [dimension]: [score] (for each scored dimension)
- **Overall**: [weighted average]
- **Gate 4**: [PASS | FAIL → entering REVISE]
```

**Progress: Audit complete. Remaining: REVISE (conditional) → STRESS-TEST → HANDOFF. Continue.**

---

## Phase 5: REVISE (conditional — only if audit < 7.0)

**Read and follow `revise/SKILL.md`.**

Apply fixes to the issues identified in the audit.

Autonomous-mode overrides:
- Feed the audit results as the revision input
- **Max 2 revision cycles** — if still < 7.0 after 2 cycles, accept and move on
- Do NOT add new sections or change layout architecture

### Gate 5: Post-revision audit ≥ 7.0

Re-score after revisions. Log to workflow-log.md:
```markdown
### Phase 6: REVISE
- Cycle 1: fixed [N] issues, score [before] → [after]
- Cycle 2: fixed [N] issues, score [before] → [after] (if needed)
- **Gate 5**: [PASS | ACCEPTED — score X after max cycles]
```

**Progress: REVISE complete. Remaining: STRESS-TEST → HANDOFF. Continue immediately.**

---

## Phase 6: STRESS-TEST

**Read and follow `stress-test/SKILL.md`.**

Run the stress test on the primary frame.

Autonomous-mode overrides:
- Skip user approval prompts
- If context is very limited, run at minimum: **Overflow** + **Empty state verification**
- Delete overflow clone frames after testing (keep primary + state frames)

### Gate 6: Stress grade ≥ B

Log to workflow-log.md:
```markdown
### Phase 7: STRESS-TEST
- [test name]: [Pass|Warning|Fail] — [details] (for each test run)
- **Gate 6**: Grade [A-F]
```

**IMPORTANT**: Do NOT skip this phase. Execute it.

---

## Phase 7: HANDOFF

**Read and follow `handoff/SKILL.md`.**

Post developer specs and finalize the workflow log.

Autonomous-mode overrides:
- Skip user approval prompts
- Use the primary frame node ID from the build phase

### Finalize workflow log

Complete `plans/<feature>/workflow-log.md` with the summary table:

```markdown
### Phase 8: HANDOFF
- Comment posted: yes
- Annotations: [count]

---

## Summary

| Phase | Gate | Result |
|---|---|---|
| PLAN | Coverage ≥ 75% | [result] |
| BUILD | 5/5 checks | [result] |
| STATES | Empty + Error | [result] |
| AUDIT | Score ≥ 7.0 | [result] |
| REVISE | Score ≥ 7.0 | [result or skipped] |
| STRESS-TEST | Grade ≥ B | [result] |

**Frames created**: primary + [N] states
**Final audit score**: [score]
**Resilience grade**: [grade]
```

**IMPORTANT**: Do NOT skip this phase. Execute it.

---

## Phase 8: PRESENT

Show the user what was built:

> **Design complete: [Screen Name]**
>
> Built in Figma with [N] library components and [M] token-built elements.
>
> **Quality scores:**
> - Audit: [score]/10
> - Stress-test: Grade [grade]
> - Component coverage: [percentage]%
>
> **States designed:** [list]
>
> **What's in Figma:**
> - Primary frame: [name]
> - State variants: [list]
> - Developer annotations: added
>
> **Issues to review** (if any):
> - [issue]
>
> Full workflow log: `plans/<feature>/workflow-log.md`

---

## Error handling

Read `shared/error-recovery.md` for standard patterns. Key cases for the pipeline:

### Figma connection lost mid-pipeline

1. Log current phase and step to workflow-log.md
2. Tell the user: "Figma connection lost during [phase]. Reconnect the
   Desktop Bridge plugin, then tell me to continue."
3. On resume, read workflow-log.md to find where you left off
4. Resume from the last incomplete phase (don't restart)

### Context too large

If the combined context risks overflow:
1. For components/index.json: only load entries referenced in the plan
2. For tokens.json: only load categories referenced in the plan
3. For product.json: always load in full (it's small)
4. Build one section at a time, taking screenshots between sections

---

## When NOT to use this skill

- **Component creation**: Use `/plan-component` + `/build-component`
- **Just planning, not building**: Use `/plan` alone
- **Fixing an existing design**: Use `/revise` directly
- **Only need an audit**: Use `/audit` directly

`/design` handles both single screens and multi-screen flows. Describe what you
need — it figures out the screen count during planning.
