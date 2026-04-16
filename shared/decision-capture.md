# Decision Capture

Append-only log of meaningful design decisions. The designer never runs a
separate command — capture happens as a byproduct of skills that make choices.
The log is the project's long-term memory for AI: future sessions read it to
understand *why* the design is the way it is.

## The file

`design-system/decisions.md` — one file, grouped by topic, append-only.

Loaded automatically as Tier 0 alongside `product.json` and `content-guide.md`.

## Format

```markdown
# Design Decisions

## Layout & IA
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Components
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Tokens & visual
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Content & voice
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Accessibility
- YYYY-MM-DD [/skill scope] Decision — one-line rationale
```

Rules:
- One line per decision. No multi-paragraph entries.
- `[/skill scope]` = the skill that made the decision and what it was working on.
  Examples: `[/plan settings]`, `[/revise notifications]`, `[/plan-component toast]`.
- Rationale is short (≤120 chars) — what tradeoff was made.
- Date is absolute (YYYY-MM-DD), never relative.
- Group under the existing top-level headings. Don't invent new ones unless none fit.
- Newest entries at the **bottom** of each section (chronological, easy diff).

## When to capture (which skills should append)

Only capture **decisions that future sessions need to know about**. Not every
tiny choice — the meaningful ones that constrain future work.

| Skill | Capture when… |
|---|---|
| `/plan` | Picking a layout archetype, nav pattern, primary CTA placement, or rejecting an obvious alternative |
| `/plan-component` | Choosing variant taxonomy, default state, anatomy split, or skipping a duplicate |
| `/design` | Routing single vs multi-screen, approving a phase output that overrode a default |
| `/revise` | Applying a fix that contradicts an earlier pattern, or sets a new convention |
| `/audit` | User accepts a fix that creates a new rule (e.g., "raise body text to 16px going forward") |
| `/setup-product` | Recording the foundational product/voice/IA decisions on first run |

**Do NOT capture:**
- Token swaps that don't change the system
- Component instantiations
- Routine renames or layout nudges
- Anything trivially derivable from the design files themselves
- Per-build implementation details (those live in `plans/<feature>/context.md`)

## How to append (every skill that captures)

1. Read `design-system/decisions.md`. If it doesn't exist, create with the
   template headings above.
2. Find the right section heading (Layout & IA / Components / Tokens & visual
   / Content & voice / Accessibility). Use existing section even if imperfect.
3. Append one line at the **bottom of that section** in the format above.
4. Do not delete or modify prior entries. The log is append-only.
5. Do not interrupt the user to confirm. Capture happens silently.

## How to read (every skill that loads design system data)

Loaded as part of Tier 0 (see `shared/design-system-loading.md`).

Use it to:
- Avoid re-litigating decisions ("we already decided sidebar nav for settings")
- Apply established conventions to new work ("body text is 16px per a prior decision")
- Cite prior context when proposing a change ("on 2026-04-10 we picked toast over
  banner — this work overrides that because…")

## Tone

Write entries the way a thoughtful colleague would write a one-line note to
their future self. Specific, sourced, uneditorialized. Not "we made the right
call here" — just what was chosen and the tradeoff.
