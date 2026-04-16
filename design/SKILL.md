---
name: design
description: |
  Interactive end-to-end design workflow. Asks 3 clarifying questions one at a time
  (use case, constraints, depth), then runs the chosen depth of pipeline — anywhere
  from "plan only" to the full audit + states + handoff. Default depth is plan +
  primary frame. Use --auto for the old hands-off behavior.
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

# Interactive Design

You are an end-to-end design partner. You take a brief — anywhere from "design the
settings page" to a detailed spec — clarify what's needed in 3 questions, then
build to the depth the user picked. Defaults err toward "less, faster" — the user
opts in to states, audits, and handoff.

**This skill is an orchestrator.** It sequences the existing standalone skills
(`/plan`, `/build`, `/audit`, `/revise`, `/stress-test`, `/handoff`) into a
pipeline with checkpoints between major phases. It does NOT re-implement those
skills — it reads and follows their SKILL.md files at each phase.

For multi-screen flows, it also reads `flow/SKILL.md` for flow planning
(topology, cross-screen consistency, edge screens) and delegates building
to `/build` per screen. One entry point for single screens and flows.

**Why interactive by default:** A 30-second clarifying question is cheaper than
a 15-minute build the user didn't want. The previous fully-autonomous default
produced states, audits, and handoff annotations users frequently discarded.
Use `--auto` to preserve that behavior for trusted/repeat tasks.

Read `shared/tool-selection.md` for the decision tree on which MCP tool to use.
Read `shared/error-recovery.md` for error handling and retry patterns.
Read `shared/screenshot-validation.md` for visual validation workflow.
Read `shared/canvas-positioning.md` for placing frames on the canvas.
Read `shared/decision-capture.md` — when the pipeline routes single vs multi-screen, or a phase output overrides a sensible default, append a one-liner to `design-system/decisions.md` (the autonomous workflow log lives in `plans/<feature>/workflow-log.md`; cross-feature decisions belong in `decisions.md`).

See `PRINCIPLES.md` for Nielsen heuristics, Gestalt principles, and design frameworks.

## The Pipeline

```
DISCOVERY → ROUTE → CONTEXT → PLAN → ✋ → BUILD → ✋ → STATES → AUDIT → REVISE → STRESS-TEST → HANDOFF
   │           │       │        │    ck1    │    ck2     │       │       │          │           │
 3 Qs        single             g1         g2          g3      g4      g5         g6
 (use case,  vs flow                       (only if user opted into deeper run)
 constraints,
 depth)

✋ = checkpoint (STOP and confirm before proceeding to next phase). Skipped under --auto.
```

**Depth tiers** (chosen in DISCOVERY Q3):

| Depth | Phases run | Typical time |
|---|---|---|
| **A) Plan only** | DISCOVERY → ROUTE → CONTEXT → PLAN | ~2 min |
| **B) Plan + primary frame** *(default)* | + BUILD | ~4 min |
| **C) + audit** | + AUDIT (and REVISE if <7.0) | ~6 min |
| **D) + states + handoff** | + STATES + STRESS-TEST + HANDOFF | ~10 min |
| **E) Full autonomous (`--auto`)** | All phases, no checkpoints, today's behavior | ~15 min |

All decisions and gate results are logged to `plans/<feature>/workflow-log.md`.

---

## Pipeline Rules (read before starting any phase)

### Rule 1: Phases run only up to chosen depth
Run only the phases included in the depth picked in DISCOVERY (A/B/C/D). After
the last in-scope phase completes, present results and stop. Do NOT continue
into out-of-scope phases. The user can re-invoke `/design --resume <depth>` to
extend an existing plan.

### Rule 2: Context budget
Build fix iterations are capped at **2 per section**. After 2 fix attempts on a
section, accept the result and move on. Spending excessive context on perfecting one
section starves later phases (states, audit, handoff) when those are in-scope.

### Rule 3: States are opt-in, not mandatory
States only run at depth D or `--auto`. When they do run, defaults are
**Empty + Error** unless the screen archetype makes those ill-defined (e.g.,
auth/landing pages). For auth/landing, default substitutes are **Filled + Error**.
Either way, ask once at the STATES checkpoint: "Build [defaults] · pick different
states · skip states."

### Rule 4: Checkpoints are mandatory in interactive mode
Stop and confirm at three points:
- **ck1 — after PLAN**: "Plan ready. Build it as-is, revise the plan, or stop here?"
- **ck2 — after BUILD primary frame**: "Built. Add audit / states / handoff, or stop here?"
- **ck3 — before STATES** (only if depth ≥ D): "Build [Empty+Error / Filled+Error], pick custom, or skip?"

Each checkpoint uses AskUserQuestion with re-ground (1 sentence summary of where
we are), recommend (one option marked RECOMMENDED), and lettered options. Always
include "stop here" as a valid option.

Under `--auto`: skip all checkpoints, run to depth E.

### Rule 5: Clarifying questions are one-at-a-time
DISCOVERY's 3 questions are asked sequentially via AskUserQuestion, each with
re-ground / recommend / lettered options / escape hatch for obvious answers.
Do NOT batch them. Do NOT ask a question if the brief already answers it
(e.g., if the user said "build the settings page", don't ask "what page?").

### Rule 6: Context budget for discovery
DISCOVERY is capped at **3 questions max**. If the brief is rich enough to skip
a question, skip it and log the inferred answer. Never ask more than 3 — if
clarification gaps remain, take a defensible default and note it in the plan.

### Rule 7: Read skill files at each phase
For each phase that maps to a standalone skill, **read that skill's SKILL.md** and
follow its instructions. This ensures improvements to individual skills automatically
flow into the pipeline. Do not rely on remembered instructions — read the file fresh.

---

## Phase 0a: DISCOVERY

Three questions, **one at a time**, each via AskUserQuestion. Skip any question
the brief already answers — but log the inferred answer in the workflow log.

### Q1: Use case + audience

**Skip if:** the brief already names the page, the user, and the goal in one
sentence (e.g., "Settings page for school administrators to manage notification
preferences").

**Otherwise ask:**
> [Re-ground] You want to build [whatever the brief said].
>
> Before I start: **what is this page for, and who's the audience?** I'll use
> this to pick layout patterns and copy that fit.
>
> RECOMMENDATION: Take 10 seconds to type a one-liner — much better output than
> if I guess. If the brief is enough, pick "skip — brief is clear."
>
> A) [User types use case + audience]
> B) Skip — brief is clear, take your best read

### Q2: Constraints

**Skip if:** the brief explicitly listed constraints, or the user said "no
constraints" / "use defaults" earlier in the conversation.

**Otherwise ask:**
> [Re-ground] Building [page] for [audience].
>
> **Any constraints I should know about?** Specific styling, components I must
> include or avoid, copy tone, or things to skip.
>
> RECOMMENDATION: Most pages don't need any. If nothing comes to mind, pick C.
>
> A) [User types constraints]
> B) Use these specific components only: [list]
> C) No constraints — use the design system defaults

### Q3: Depth (always ask, unless `--auto` flag)

> [Re-ground] [Page] for [audience], constraints: [summary].
>
> **How deep should this go?** Each level adds time and adds artifacts.
>
> RECOMMENDATION: B — covers the high-level page in ~4 minutes. You can always
> ask for "more" after seeing it. Past pattern: users frequently discard the
> states/audit/handoff that depth D produces unless they specifically asked.
>
> A) **Plan only** — Write `plans/<feature>/plan.md`, no Figma build. (~2 min)
> B) **Plan + primary frame** — Build the high-level page in Figma. (~4 min) *(default)*
> C) **+ audit** — Add the audit pass and revise once if score < 7.0. (~6 min)
> D) **+ states + handoff** — Full quality pipeline: states, stress, handoff comment. (~10 min)
> E) **Full autonomous** — Same as D but no checkpoints between phases. (~15 min, sets `--auto`)

**Store the depth choice as `chosenDepth` (A/B/C/D/E) for the rest of the run.**

If the user invoked `/design --auto`, skip all 3 questions, set `chosenDepth = E`,
and proceed.

If the user invoked `/design --depth=<X>`, skip Q3, use that depth.

---

## Phase 0b: ROUTE

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

Pipeline overrides (vs. running `/plan` directly):
- Skip `/plan`'s own internal user-approval prompt at the end (the checkpoint
  below replaces it). Under `--auto`, skip *all* user prompts inside `/plan`.
- Use the brief + DISCOVERY answers from Phase 0 as the input.
- Apply product.json and content-guide.md loaded in Phase 1.

### Checkpoint ck1 (skip if `chosenDepth == E`)

After writing `plan.md` and `build.json`, STOP and ask:

> [Re-ground] Plan written: `plans/<feature>/plan.md`. [N] sections, [M]
> components ([X]% library coverage), archetype: [name].
>
> RECOMMENDATION: [B] if the plan looks right — go straight to build.
>
> A) Show me the plan first (I'll print key sections inline)
> B) Build it as-is *(default)*
> C) Revise the plan — what should change?
> D) Stop here — I have what I need

If `chosenDepth == A` (Plan only): skip the checkpoint, present the plan, stop.
If user picks D: present the plan, stop.
If user picks C: ask what to change, revise plan files, re-show checkpoint.

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

Feed it the `plans/<feature>/build.json` created in Phase 2. Build the **primary
frame only** in this phase — states come later (Phase 4) if `chosenDepth >= D`.

Pipeline overrides (vs. running `/build` directly):
- Skip `/build`'s own internal approval prompts under `--auto`. Under interactive
  mode, the ck2 checkpoint below replaces them.
- Max **2 fix iterations** per section.
- Do NOT auto-generate states from build/SKILL.md Phase 6 — that's now Phase 4
  of `/design` and only runs at depth D.

### Checkpoint ck2 (skip if `chosenDepth == E`)

After the build passes Phase 5 validation in `build/SKILL.md`, STOP and ask:

> [Re-ground] Built `[frame name]` ([N] components, [M] token-built elements,
> all [K] validation checks passed). Screenshot above.
>
> RECOMMENDATION: [matches `chosenDepth`]
>
> A) Stop here — design is good as-is
> B) Add audit (~2 min) — score against heuristics + WCAG
> C) Add states + handoff (~6 min) — Empty/Filled + Error + handoff comment
> D) Run revision — something looks off
> E) [Only if depth was originally A or B] Add everything — extend to full pipeline

If `chosenDepth == B`: default RECOMMENDATION is A (stop). User can opt up.
If `chosenDepth == C`: default RECOMMENDATION is B (audit), then stop.
If `chosenDepth == D`: default RECOMMENDATION is C (states + handoff).
If user picks D (revision): ask what's off, run revise/SKILL.md once, re-checkpoint.

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

**At end of Phase 3:** if `chosenDepth == B`, present results and STOP. Do not
continue to AUDIT. The user can re-invoke `/design --resume <depth>` to extend.

---

## Phase 3.5: STATES (only if `chosenDepth >= D`)

**Read `build/SKILL.md` Phase 6 (State Generation).**

### Checkpoint ck3 (skip if `chosenDepth == E`)

Before generating states, ask:

> [Re-ground] Primary frame is built. States show how it behaves under different
> data conditions (empty list, error message, loading skeleton, success toast).
>
> RECOMMENDATION: [defaults below match the screen archetype]
>
> A) Build defaults — [Empty + Error] for content screens, [Filled + Error] for
>    auth/landing pages
> B) Pick custom states — tell me which ones (Empty / Filled / Loading / Error / Success)
> C) Skip states — go straight to AUDIT/HANDOFF

If user picks A: detect archetype from `plan.md` and build the appropriate pair.
If user picks B: ask which states (one prompt, multi-select), then build those.
If user picks C: log "states skipped per user choice" and continue.

For auth/landing/marketing pages, "Empty" is ill-defined (the page IS the
first-time view). Substitute Filled + Error as the default pair.

### Gate 3: States built per user choice

Log to workflow-log.md:
```markdown
### Phase 3.5: STATES
- Archetype: [content | auth/landing | dashboard | other]
- States built: [list with node IDs]
- States skipped: [list + user-chosen reason]
- **Gate 3**: PASS — built [N] states per user direction
```

---

## Phase 4: AUDIT (only if `chosenDepth >= C`)

**Read and follow `audit/SKILL.md`.**

Run the audit on the primary frame from Phase 3.

Pipeline overrides (vs. running `/audit` directly):
- Skip `/audit`'s own internal user-approval prompts under `--auto`
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

**At end of Phase 4:** if `chosenDepth == C`, present audit summary and STOP. Do
not continue to STRESS-TEST or HANDOFF unless audit triggered REVISE (below).

---

## Phase 5: REVISE (only if `chosenDepth >= C` AND audit < 7.0)

**Read and follow `revise/SKILL.md`.**

Apply fixes to the issues identified in the audit.

Pipeline overrides (vs. running `/revise` directly):
- Feed the audit results as the revision input
- **Max 2 revision cycles** — if still < 7.0 after 2 cycles, accept and move on
- Do NOT add new sections or change layout architecture
- After REVISE completes, if `chosenDepth == C`, present and stop. Do not
  continue to STRESS-TEST.

### Gate 5: Post-revision audit ≥ 7.0

Re-score after revisions. Log to workflow-log.md:
```markdown
### Phase 5: REVISE
- Cycle 1: fixed [N] issues, score [before] → [after]
- Cycle 2: fixed [N] issues, score [before] → [after] (if needed)
- **Gate 5**: [PASS | ACCEPTED — score X after max cycles]
```

---

## Phase 6: STRESS-TEST (only if `chosenDepth >= D`)

**Read and follow `stress-test/SKILL.md`.**

Run the stress test on the primary frame.

Pipeline overrides (vs. running `/stress-test` directly):
- Skip `/stress-test`'s own internal user-approval prompts under `--auto`
- If context is very limited, run at minimum: **Overflow** + **Empty state verification**
- Delete overflow clone frames after testing (keep primary + state frames)

### Gate 6: Stress grade ≥ B

Log to workflow-log.md:
```markdown
### Phase 6: STRESS-TEST
- [test name]: [Pass|Warning|Fail] — [details] (for each test run)
- **Gate 6**: Grade [A-F]
```

---

## Phase 7: HANDOFF (only if `chosenDepth >= D`)

**Read and follow `handoff/SKILL.md`.**

Post developer specs and finalize the workflow log.

Pipeline overrides (vs. running `/handoff` directly):
- Skip `/handoff`'s own internal user-approval prompts under `--auto`
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
| DISCOVERY | 3 questions | [answered / skipped count] |
| PLAN | Coverage ≥ 75% | [result] |
| BUILD | 5/5 checks | [result] |
| STATES | Per user choice | [built list / skipped] |
| AUDIT | Score ≥ 7.0 | [result or skipped per depth] |
| REVISE | Score ≥ 7.0 | [result or skipped] |
| STRESS-TEST | Grade ≥ B | [result or skipped per depth] |
| HANDOFF | Comment posted | [result or skipped per depth] |

**Depth chosen**: [A | B | C | D | E]
**Frames created**: primary + [N] states
**Final audit score**: [score or "not audited"]
**Resilience grade**: [grade or "not stress-tested"]
```

---

## Phase 8: PRESENT

Show the user what was built:

Always present, no matter where the run stopped. Tailor the content to the depth
that actually ran.

**Depth A (Plan only):**
> **Plan ready: [Screen Name]**
>
> Wrote `plans/<feature>/plan.md` ([N] sections, [M] components, [X]% library
> coverage). No Figma build yet — run `/design --resume B` to build it, or
> `/build` directly with this plan.

**Depth B (Plan + primary frame):**
> **Built: [Screen Name]**
>
> Built in Figma with [N] library components and [M] token-built elements.
> Plan: `plans/<feature>/plan.md`. No states or audit — run `/design --resume C`
> to add audit, or `--resume D` to add states + handoff.

**Depth C (+ audit):**
> **Built + audited: [Screen Name]**
>
> Audit: [score]/10 ([N] critical · [N] warnings).
> Top issues: [up to 3]. Run `/design --resume D` for states + handoff, or
> `/revise` to fix specific findings.

**Depth D / E (full):**
> **Design complete: [Screen Name]**
>
> [N] library components, [M] token-built elements.
> Audit: [score]/10 · Stress-test: Grade [grade] · Coverage: [percentage]%
> States: [list]. Handoff comment posted on the primary frame.
> Full log: `plans/<feature>/workflow-log.md`

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

## Resuming a previous run

`/design --resume <depth>` extends an existing plan/build to a higher depth
without re-asking the discovery questions.

- `/design --resume B` — build the primary frame from an existing `plan.md`
- `/design --resume C` — add audit (and revise if <7.0) to an existing build
- `/design --resume D` — add states + stress-test + handoff to an existing audit
- `/design --resume E` — run any remaining phases without checkpoints

Reads `plans/<feature>/workflow-log.md` to determine where the previous run
stopped, then continues from there. Asks ONE question at the start: "Resume
`<feature>` at depth <X>?" with the option to redirect.

---

## Flags reference

- `/design "<brief>"` — interactive, default depth B (plan + primary frame)
- `/design --auto "<brief>"` — full autonomous (depth E), no checkpoints
- `/design --depth=<A|B|C|D|E> "<brief>"` — skip Q3, jump to chosen depth
- `/design --resume <A|B|C|D|E>` — extend the most recent plan to higher depth

---

## When NOT to use this skill

- **Component creation**: Use `/plan-component` + `/build-component`
- **Just planning, not building**: Use `/plan` alone (or `/design --depth=A`)
- **Fixing an existing design**: Use `/revise` directly
- **Only need an audit**: Use `/audit` directly

`/design` handles both single screens and multi-screen flows. Describe what you
need — it figures out the screen count during planning.
