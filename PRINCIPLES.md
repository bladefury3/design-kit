# Design Principles

Shared design principles referenced by all design-kit skills. Each skill pulls
from the relevant sections — this is the "design brain" that runs across everything.

## Nielsen's 10 Usability Heuristics

Used by: `/audit-frames`, `/brainstorm`, `/revision`, `/design-flow`

| # | Heuristic | What to check |
|---|---|---|
| 1 | **Visibility of system status** | Progress indicators, loading states, save confirmations, sync status |
| 2 | **Match between system and real world** | Labels use user language? Units make sense? Icons recognizable? |
| 3 | **User control and freedom** | Undo available? Back/cancel present? Destructive actions have confirmation? |
| 4 | **Consistency and standards** | Same component for same function? Platform conventions followed? |
| 5 | **Error prevention** | Validation present? Confirmation before destructive actions? Constraints prevent invalid input? |
| 6 | **Recognition rather than recall** | Navigation visible? Key actions exposed? No hidden-only features? |
| 7 | **Flexibility and efficiency of use** | Keyboard shortcuts? Bulk actions? Customizable views? |
| 8 | **Aesthetic and minimalist design** | Every element earns its pixels? Signal-to-noise ratio high? |
| 9 | **Help users recover from errors** | Error states designed? Clear next action? No dead ends? |
| 10 | **Help and documentation** | Tooltips? Onboarding for first-time users? Empty state guidance? |

### Scoring

Rate each heuristic 0-10 with specific evidence:
- **9-10**: Exemplary. Could be used as a reference for this pattern.
- **7-8**: Solid. Minor improvements possible but no usability risk.
- **5-6**: Adequate. Users can complete tasks but with friction.
- **3-4**: Problematic. Users will struggle or make errors.
- **0-2**: Broken. Users cannot complete the intended task.

Always cite the specific element, location, and why it scored that way.

## Gestalt Principles

Used by: `/audit-frames`, `/plan-design`, `/brainstorm`

- **Proximity** — Elements near each other are perceived as related. Group related
  controls; separate unrelated sections with whitespace.

- **Similarity** — Elements that look similar are perceived as having similar function.
  Same visual treatment = same behavior.

- **Continuity** — The eye follows lines and curves. Maintain alignment lines across
  sections. Break alignment only to create emphasis.

- **Closure** — The mind completes incomplete shapes. Cards, containers, and borders
  create containment even with gaps.

- **Figure-ground** — Clear distinction between foreground content and background.
  Modals, drawers, and overlays need obvious layering.

- **Common region** — Elements within a boundary are perceived as grouped. Use cards
  and sections to create logical groupings.

### Application

When auditing or planning, check each section of the design:
1. Are related elements grouped by proximity?
2. Do visually similar elements behave the same way?
3. Are alignment lines consistent across sections?
4. Is the visual layering clear (what's foreground vs. background)?

## Cognitive Load Laws

Used by: `/audit-frames`, `/design-flow`, `/responsive-adapt`, `/brainstorm`

### Hick's Law
Decision time increases logarithmically with the number of choices.
- **Threshold**: >7 options without grouping = flag for review
- **Fix**: Group, categorize, progressive disclosure, smart defaults

### Miller's Law
Working memory holds 5-9 chunks of information.
- **Threshold**: >9 items in a flat list without structure = flag
- **Fix**: Chunk into groups of 3-5, use hierarchy, paginate

### Fitts's Law
Time to reach a target depends on distance and size.
- **Threshold**: Interactive targets < 44px = flag
- **Fix**: Increase target size, reduce distance between related actions
- **Corollary**: Primary actions should be large and close; destructive actions small and distant

### Severity Thresholds

Use these thresholds when auditing:

| Law | Warning | Critical |
|---|---|---|
| **Hick's Law** | >7 ungrouped choices | >12 ungrouped choices |
| **Miller's Law** | >9 unchunked items | >15 unchunked items |
| **Fitts's Law** | Interactive target <44px | Interactive target <36px |
| **Von Restorff** | Primary CTA not visually distinct | Multiple competing CTAs |

### Jakob's Law
Users spend most of their time on OTHER sites. They prefer your site to work
the same way as all the other sites they already know.
- **Check**: Does navigation follow platform conventions? Are common patterns recognizable?

### Aesthetic-Usability Effect
Users perceive aesthetically pleasing designs as more usable.
- Not an excuse for style over function — but a reminder that visual polish
  increases user trust and tolerance for minor friction.

### Von Restorff Effect (Isolation Effect)
An item that stands out from its peers is more likely to be remembered.
- Use for primary CTAs, important alerts, key metrics
- **Danger**: If everything stands out, nothing does

### Doherty Threshold
Productivity soars when a computer and its users interact at a pace (<400ms)
that ensures neither has to wait on the other.
- Loading states should appear immediately, content within 400ms
- Skeleton screens > spinners > blank loading

## SCAMPER Framework

Used by: `/brainstorm`

A structured technique for generating design variations:

| Lens | Question | Design Application |
|---|---|---|
| **Substitute** | What can be replaced? | Swap component types: table → cards, tabs → accordion, sidebar → top nav |
| **Combine** | What can be merged? | Merge sections: stats + chart in one card, filter + search in one bar |
| **Adapt** | What can be borrowed? | Borrow patterns: email inbox for notifications, Kanban for tasks |
| **Modify** | What can be emphasized/de-emphasized? | Change hierarchy: data-first vs. action-first vs. navigation-first |
| **Put to other use** | What else could this serve? | Reframe: dashboard as command center vs. status board vs. launch pad |
| **Eliminate** | What can be removed? | Radical subtraction: cut 50% of elements. What still works? |
| **Reverse** | What can be inverted? | Flip hierarchy: action-first vs. context-first, detail-first vs. summary-first |

### Generating variations

Apply 3-5 SCAMPER lenses per brainstorm session. Each lens produces ONE variation.
The variation should be a complete, buildable design — not a half-thought.

For each variation, state:
1. Which SCAMPER lens was applied
2. What specifically changed
3. Who this variation serves best (which user job)
4. What you gain and what you trade off

## Jobs-to-be-Done Framework

Used by: `/brainstorm`, `/design-flow`

Every screen serves a user job. Common product design jobs:

| Job | User mindset | Design emphasis |
|---|---|---|
| **Monitor** | "Is everything OK?" | Status indicators, dashboards, alerts, at-a-glance metrics |
| **Investigate** | "Why did this happen?" | Data tables, filters, drill-down, comparisons, timelines |
| **Act** | "I need to do something" | Forms, CTAs, wizards, confirmation flows, bulk operations |
| **Configure** | "I need to set this up" | Settings, preferences, toggles, defaults, import/export |
| **Learn** | "How does this work?" | Onboarding, documentation, tooltips, empty state guidance |
| **Decide** | "Which option should I pick?" | Comparisons, pricing tables, feature matrices, recommendations |

### Application

When brainstorming or planning flows:
1. Identify the PRIMARY job for this screen
2. Identify SECONDARY jobs (what else might the user need?)
3. Design for the primary job first — secondary jobs support, not compete
4. If a screen tries to serve 3+ jobs equally, it needs to be split

## Responsive Design Patterns

Used by: `/responsive-adapt`

### Layout Patterns (Luke Wroblewski)

| Pattern | Description | When to use |
|---|---|---|
| **Reflow** | Multi-column → single column | Default for most content |
| **Reveal/Hide** | Summary on mobile, detail on desktop | Complex data, secondary info |
| **Off-canvas** | Sidebar → drawer/sheet | Navigation, filters, panels |
| **Priority+** | Show top items, "more" for rest | Navigation with many items |
| **Morph** | Component changes form entirely | Table → card list, tabs → accordion |

### Touch-First Principles

- Tap targets ≥ 44pt (iOS HIG) / 48dp (Material Design)
- Thumb zone awareness: primary actions in bottom 1/3 of screen
- Swipe for common actions (dismiss, delete, archive)
- Bottom sheet instead of modal on mobile
- No hover-only interactions — everything must work with tap
- Long press is a power-user feature, never required

### Content Choreography

Content should be prioritized differently per viewport:
1. **Essential** — visible at every size (primary action, key data)
2. **Useful** — collapse/accordion on mobile, visible on desktop (secondary data, filters)
3. **Supplementary** — hide on mobile entirely, or "View on desktop" link

### Breakpoint Strategy

| Breakpoint | Viewport | Typical layout |
|---|---|---|
| Mobile | < 640px | Single column, bottom nav, stacked cards |
| Tablet | 640-1024px | 2-column, side nav or top nav, grid |
| Desktop | > 1024px | Multi-column, sidebar, full tables, expanded panels |

Don't design for breakpoints — design for content. Break when the content breaks.

## Flow Design Principles

Used by: `/design-flow`

### Screen Architecture
- **One primary action** per screen — if you can't name it, the screen has no job
- **One escape hatch** (back, cancel, close) always visible and reachable
- **Progress indication** for multi-step flows (steps, progress bar, breadcrumb)
- **State persistence** — what survives if the user leaves mid-flow and returns?

### Error Recovery
- Every error state has a clear next action ("Try again", "Go back", "Contact support")
- Never a dead end — always a path forward or a path out
- Inline validation > submission validation > page-level error
- Destructive errors are recoverable (undo, draft auto-save, confirmation)

### Cognitive Load Management
- Progressive disclosure: reveal complexity only when needed
- Don't show step 4's complexity on step 1
- Each step should be completable in under 30 seconds of focused attention
- Complex steps should be breakable into sub-steps
- Pre-fill what you can: defaults, carried-forward data, smart suggestions

### Completion Momentum
- Show progress: "Step 2 of 4" or percentage
- Celebrate micro-wins: checkmarks, success animations, encouraging copy
- Front-load easy steps: build momentum before asking for hard things
- End with a clear "what's next" — never drop the user after completion

### Flow Topology

| Pattern | Structure | When to use |
|---|---|---|
| **Linear** | A → B → C → Done | Simple processes: checkout, onboarding |
| **Branching** | A → B1 or B2 → C | Conditional paths: different user types |
| **Hub-and-spoke** | Hub ↔ A, Hub ↔ B, Hub ↔ C | Settings, dashboards with sub-views |
| **Wizard** | A → B → C with back/skip | Complex setup, guided configuration |
| **Loop** | A → B → C → A | Iterative: review/edit cycles, feed browsing |

## Edge Case Taxonomy

Used by: `/content-stress`, `/design-flow`, `/plan-design`

### Content Extremes

| Dimension | Test cases |
|---|---|
| **Length** | 1 char, 20 chars, 50 chars, 100 chars, 500 chars |
| **Volume** | 0 items, 1 item, 3 items, 10 items, 100 items, 10,000 items |
| **Format** | Numbers with commas, currencies, dates, percentages, negative values |
| **Identity** | Long names (Wolfeschlegelsteinhausenbergerdorff), non-Latin scripts (日本語, العربية), RTL, emoji in names |
| **Time** | "Just now", "2h ago", "March 2019", timezone edges, expired/overdue |
| **Permissions** | Admin, editor, viewer, guest — what's hidden vs. disabled vs. shown? |
| **State** | New user (empty), power user (full), churned (stale data), error (broken data) |

### Priority Order

Not all edge cases matter equally. Test in this order:
1. **Empty state** — Most common first-time experience. If this is bad, nothing else matters.
2. **Overflow** — Long text, many items. This WILL happen in production.
3. **Error state** — Users will encounter errors. Design for recovery.
4. **Permissions** — Different users see different things. Test each role.
5. **Extreme values** — Unusual but possible: very large numbers, unusual characters.
6. **Temporal** — Time-based edge cases: expired, future-dated, cross-timezone.

### Inclusive Design Checks
- Screen reader text flow makes logical sense
- High contrast mode doesn't break layout
- Reduced motion preferences are respected (no essential animation)
- 200% browser zoom maintains usability
- Color is never the only indicator (icons + text for status)
- Touch targets meet minimum sizes across all breakpoints

## Feedback Classification

Used by: `/revision`

| Type | How to handle | Example |
|---|---|---|
| **Principle-based** | Redesign using Gestalt/Nielsen | "The hierarchy is wrong" |
| **Preference-based** | Ask: brand decision or personal taste? | "I don't like blue" |
| **Usability-based** | Apply relevant cognitive law | "Users can't find the save button" |
| **Content-based** | Rewrite, test readability | "The copy is too technical" |
| **Scope change** | Flag as addition, plan separately | "Can we add a filter?" |
| **Bug report** | Fix directly, verify with screenshot | "This overlaps on mobile" |

### Processing feedback

1. **Classify** each piece of feedback into a type
2. **Prioritize**: Usability > Principle > Content > Bug > Preference > Scope
3. **Apply** changes for types 1-4 directly
4. **Flag** preference-based feedback — ask the user before acting on taste
5. **Separate** scope changes — these become new plan-design tasks, not revisions

## AskUserQuestion Format

Used by: `/brainstorm`, `/responsive-adapt`, `/design-flow`, `/revision`, `/plan-design`, `/content-stress`, `/audit-frames`

**ALWAYS follow this structure for every AskUserQuestion call:**

1. **Re-ground:** State what you're planning and where you are in the process. (1 sentence)
2. **Simplify:** Explain the design decision in plain English. No Figma jargon, no variant key hashes. Say what the user will SEE, not what the system calls it.
3. **Recommend:** `RECOMMENDATION: Choose [X] because [one-line reason]`
4. **Options:** Lettered options: `A) ... B) ... C) ...`

Assume the user hasn't looked at this window in 20 minutes. If you'd need to open
Figma to understand your own question, it's too complex.

### Critical Rules

- **One decision = one AskUserQuestion.** Never combine multiple design choices into one question.
- **STOP after each question.** Do NOT proceed until the user responds.
- **Escape hatch:** If a decision has an obvious answer, state what you'll do and move on. Only ask when there is a genuine design choice with meaningful tradeoffs.
- **Connect to user outcomes.** "This matters because your PM will see a blank screen with no guidance on what to do next."

## AI Slop Check

Used by: `/brainstorm`, `/plan-design`, `/build-design`, `/revision`, `/design-flow`

Before finalizing any design output, check for these common AI design traps:

- **Generic card grid** as the primary layout — every dashboard does not need a 3-column card grid
- **Centered everything** with uniform spacing — real designs have intentional asymmetry and hierarchy
- **Dashboard-widget mosaic** with no hierarchy — if everything is a card, nothing stands out
- **Cookie-cutter section rhythm** (hero → cards → table → CTA) — break the pattern when content demands it
- **"Clean modern"** as a design direction — this is not a decision, it's a non-answer
- **Equal visual weight** on all elements — hierarchy means some things are bigger, bolder, or more colorful

If the output falls into any of these traps, fix it before presenting. State what you changed and why.

## Design System Maturity Model

Used by: `/diff-system`

### Maturity Levels

| Level | Name | Characteristics |
|---|---|---|
| 1 | **Inconsistent** | No shared tokens, components rebuilt per project |
| 2 | **Emerging** | Some shared tokens and components, adoption spotty |
| 3 | **Consistent** | Full token system, component library, 70%+ adoption |
| 4 | **Integrated** | Design-to-code parity, automated auditing, version tracking |
| 5 | **Optimized** | Usage analytics drive evolution, components serve measured needs |

### Health Metrics

- **Token adoption**: % of values bound to variables vs. hardcoded
- **Component coverage**: % of UI elements from library vs. custom-built
- **Consistency score**: Variance in usage patterns for same component
- **Drift rate**: How quickly designs diverge from the system after initial build
- **Staleness**: How many extracted specs are outdated vs. current Figma state

### Diff Categories

When comparing current state against extracted data:

| Category | Severity | Action |
|---|---|---|
| **Token value changed** | Medium | Re-extract, check downstream impact |
| **Token added** | Low | Re-extract, document new token |
| **Token removed** | High | Flag — designs using it will break |
| **Component variant added** | Low | Re-extract component JSON |
| **Component variant removed** | High | Flag — instances will detach |
| **Component props changed** | Medium | Re-extract, update handoff docs |
| **New component** | Low | Add to index, extract on demand |
| **Component removed** | Critical | Flag — all instances will break |
