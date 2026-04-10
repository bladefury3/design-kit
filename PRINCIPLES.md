# Design Principles

Shared design principles referenced by all design-kit skills. Each skill pulls
from the relevant sections — this is the "design brain" that runs across everything.

## Nielsen's 10 Usability Heuristics

Used by: `/audit`, `/brainstorm`, `/revise`, `/flow`

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

### Per-Heuristic Evidence Rubrics

**H1 — Visibility of system status**
- **9-10**: Every state change has visible feedback (loading skeletons, save confirmations, sync indicators, progress bars). Real-time data shows "last updated".
- **7-8**: Most state changes show feedback; minor gaps (e.g., no skeleton on initial load).
- **5-6**: Some feedback exists but inconsistent across actions.
- **3-4**: Minimal feedback. Actions produce no visible result until page refresh.
- **0-2**: No feedback. User cannot tell if actions succeeded.

**H2 — Match between system and real world**
- **9-10**: All labels use target-user language. Units are contextual. Icons are universally recognizable or paired with text.
- **7-8**: Mostly user-friendly with 1-2 instances of acceptable domain jargon.
- **5-6**: Mixed technical and user-friendly language. Ambiguous icons without text.
- **3-4**: Predominantly developer language ("null", "N/A", unexplained abbreviations).
- **0-2**: Raw database field names or system identifiers shown to users.

**H3 — User control and freedom**
- **9-10**: Undo/redo for destructive actions. Back/cancel on every form. Destructive actions require confirmation. Multi-step flows have "save draft".
- **7-8**: Most destructive actions confirmed; one minor gap (e.g., no undo on bulk delete).
- **5-6**: Cancel/back buttons exist but no undo. Some modals trap the user.
- **3-4**: No undo. Some flows have no exit. Destructive actions fire immediately.
- **0-2**: Users trapped in flows. Irreversible actions with no warning.

**H4 — Consistency and standards**
- **9-10**: Same component for same function everywhere. Platform conventions followed. Visual weight matches action importance.
- **7-8**: Consistent with 1-2 exceptions (e.g., one detached button).
- **5-6**: Mostly consistent with noticeable breaks (different button styles for same action).
- **3-4**: Inconsistent throughout. Same actions look different across sections.
- **0-2**: No visible consistency. Every section appears independently designed.

**H5 — Error prevention**
- **9-10**: Inline validation on all fields. Constraints prevent invalid input. Destructive actions state consequences before confirming. Smart defaults.
- **7-8**: Validation present on most fields. One gap (e.g., free-text where constrained input is better).
- **5-6**: Some validation but inconsistent. No confirmation on at least one destructive action.
- **3-4**: Minimal validation. Errors only discovered after submission.
- **0-2**: No validation. Users can accidentally destroy data with a single click.

**H6 — Recognition rather than recall**
- **9-10**: All navigation visible. Key actions exposed as buttons. Breadcrumbs, recent items, and search reduce memory load. Active context always visible.
- **7-8**: Navigation visible; one action only in "..." overflow menu, or active filters not indicated.
- **5-6**: Main navigation visible but secondary actions require recall. Some missing context.
- **3-4**: Important features behind non-obvious interactions. Users must memorize paths.
- **0-2**: Core features hidden. No visual navigation cues.

**H7 — Flexibility and efficiency of use**
- **9-10**: Keyboard shortcuts, bulk actions, customizable views, search with filters, novice and expert paths.
- **7-8**: Most efficiency features present; missing one (e.g., no keyboard shortcuts).
- **5-6**: Basic functionality but no accelerators. Every action takes same clicks.
- **3-4**: Inefficient for common tasks. No batch alternatives for repetitive actions.
- **0-2**: Single-item operations only. No search, shortcuts, or customization.

**H8 — Aesthetic and minimalist design**
- **9-10**: Every element earns its space. Clear hierarchy with one focal point per section. Intentional whitespace. High signal-to-noise.
- **7-8**: Clean with 1-2 elements that could be removed without losing function.
- **5-6**: Functional but noisy. Some competing elements. Hierarchy unclear in one section.
- **3-4**: Cluttered. Multiple elements compete. No clear hierarchy.
- **0-2**: Overwhelming density. Every element has equal visual weight.

**H9 — Help users recover from errors**
- **9-10**: All error states designed: what went wrong (user language), clear next action, no dead ends. Inline errors clear when fixed. Network errors have retry.
- **7-8**: Most errors designed; one gap (e.g., generic "Something went wrong" without next action).
- **5-6**: Some error states designed but generic. Vague messages. One dead end.
- **3-4**: Raw error messages or codes. No recovery path.
- **0-2**: No error states designed. Errors produce blank screens or infinite spinners.

**H10 — Help and documentation**
- **9-10**: Contextual tooltips, first-time onboarding, empty states with guidance and action, inline help on complex fields.
- **7-8**: Most help present; one complex feature lacks a tooltip, or empty state missing action button.
- **5-6**: Some help (a few tooltips, basic empty states) but spotty. No onboarding.
- **3-4**: No tooltips, no onboarding. Empty states show only "No data".
- **0-2**: No help or documentation anywhere.

## Gestalt Principles

Used by: `/audit`, `/plan`, `/brainstorm`

- **Proximity** — Elements near each other are perceived as related. Group related controls; separate unrelated sections with whitespace.
- **Similarity** — Elements that look similar are perceived as having similar function. Same visual treatment = same behavior.
- **Continuity** — The eye follows lines and curves. Maintain alignment lines across sections. Break alignment only to create emphasis.
- **Closure** — The mind completes incomplete shapes. Cards, containers, and borders create containment even with gaps.
- **Figure-ground** — Clear distinction between foreground content and background. Modals, drawers, and overlays need obvious layering.
- **Common region** — Elements within a boundary are perceived as grouped. Use cards and sections to create logical groupings.

When auditing or planning, check: Are related elements grouped by proximity? Do visually similar elements behave the same? Are alignment lines consistent? Is the visual layering clear?

## Cognitive Load Laws

Used by: `/audit`, `/flow`, `/responsive`, `/brainstorm`

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

### Von Restorff Effect (Isolation Effect)
An item that stands out from its peers is more likely to be remembered.
- Use for primary CTAs, important alerts, key metrics
- **Danger**: If everything stands out, nothing does

### Severity Thresholds

| Law | Warning | Critical |
|---|---|---|
| **Hick's Law** | >7 ungrouped choices | >12 ungrouped choices |
| **Miller's Law** | >9 unchunked items | >15 unchunked items |
| **Fitts's Law** | Interactive target <44px | Interactive target <36px |
| **Von Restorff** | Primary CTA not visually distinct | Multiple competing CTAs |

## SCAMPER Framework

Used by: `/brainstorm`

| Lens | Question | Design Application |
|---|---|---|
| **Substitute** | What can be replaced? | Swap component types: table → cards, tabs → accordion, sidebar → top nav |
| **Combine** | What can be merged? | Merge sections: stats + chart in one card, filter + search in one bar |
| **Adapt** | What can be borrowed? | Borrow patterns: email inbox for notifications, Kanban for tasks |
| **Modify** | What can be emphasized/de-emphasized? | Change hierarchy: data-first vs. action-first vs. navigation-first |
| **Put to other use** | What else could this serve? | Reframe: dashboard as command center vs. status board vs. launch pad |
| **Eliminate** | What can be removed? | Radical subtraction: cut 50% of elements. What still works? |
| **Reverse** | What can be inverted? | Flip hierarchy: action-first vs. context-first, detail-first vs. summary-first |

Apply 3-5 SCAMPER lenses per brainstorm session. Each lens produces ONE complete, buildable variation. For each, state: which lens, what changed, who it serves best, and the gain/tradeoff.

## Jobs-to-be-Done Framework

Used by: `/brainstorm`, `/flow`, `/plan`

| Job | User mindset | Design emphasis |
|---|---|---|
| **Monitor** | "Is everything OK?" | Status indicators, dashboards, alerts, at-a-glance metrics |
| **Investigate** | "Why did this happen?" | Data tables, filters, drill-down, comparisons, timelines |
| **Act** | "I need to do something" | Forms, CTAs, wizards, confirmation flows, bulk operations |
| **Configure** | "I need to set this up" | Settings, preferences, toggles, defaults, import/export |
| **Learn** | "How does this work?" | Onboarding, documentation, tooltips, empty state guidance |
| **Decide** | "Which option should I pick?" | Comparisons, pricing tables, feature matrices, recommendations |

When brainstorming or planning: identify the PRIMARY job (>60% of user time), then SECONDARY jobs. Design for primary first. If a screen serves 3+ jobs equally, split it.

## Information Architecture & Layout Decision Framework

Used by: `/plan`, `/brainstorm`, `/flow`

### Layout Archetypes by User Job

| User Job | Layout Archetype | Structure | Why this shape |
|---|---|---|---|
| **Monitor** | Status dashboard | Status bar top → metric grid → alert/activity list | User scans for anomalies top-to-bottom |
| **Investigate** | Master-detail | Filterable table/list + detail panel (right or drill-down) | User narrows then drills |
| **Act** | Focused form | Progress indicator → form sections → sticky action bar | Minimize distraction |
| **Configure** | Settings panel | Sidebar categories → settings content → save bar | Category navigation is primary |
| **Learn** | Content reader | Sidebar TOC or breadcrumbs → rich content area → contextual help | Navigation aid prevents getting lost |
| **Decide** | Comparison layout | Options side by side → feature/price matrix → CTA per option | Equal weight per option, differentiators highlighted |

When the screen serves multiple jobs: design for the PRIMARY job (>60% of user time). Secondary jobs get smaller sections. 3+ equal jobs = split into separate screens.

### Content-to-Structure Decision Tree

**Collections of similar items:**
- >10 items with sortable/filterable attributes → **Table** (with pagination)
- 3-8 items with distinct visual identity → **Card grid**
- Ordered sequence with timestamps → **Activity feed / Timeline**
- 1-3 key numbers → **Metric row**; 4-6 key numbers → **Metric grid**

**User input:**
- <5 fields → **Inline form**; 5-15 fields → **Single-column form**; >15 fields → **Multi-step wizard**

**Navigation:**
- <7 items → **Top nav / tabs**; 7-15 items → **Sidebar**; >15 items → **Search-first + sidebar tree**

**Data visualization:**
- Single metric → **Stat card**; Trend → **Line chart**; Comparison → **Bar chart**; Part of whole → **Donut chart**; Multiple dimensions → **Table**

**Status / Feedback:**
- System-level → **Banner/Alert**; Item-level → **Badge/Tag**; Action confirmation → **Toast**

### Hierarchy Determination

**Step 1: Identify the user's first question.**

| First question | What goes first | Example |
|---|---|---|
| "Is everything OK?" | Status indicators, health summary | Ops dashboard: status bar at top |
| "Where am I?" | Breadcrumbs, page title, context | Deep settings: breadcrumb + heading |
| "What do I do next?" | Primary CTA, current step | Onboarding: step 2/4 with form |
| "What happened?" | Latest activity, newest data | Activity feed: reverse-chronological |
| "What are my options?" | All options with equal weight | Pricing: plan cards side by side |

**Step 2: Determine the scanning pattern.**

| Pattern | When to use | Hierarchy implication |
|---|---|---|
| **F-pattern** | Content-heavy pages | Key info top-left. Left-edge scanning after first 2 lines. |
| **Z-pattern** | Action-oriented pages | Top-left: context. Top-right: secondary nav. Bottom-right: primary CTA. |
| **Single-column** | Forms, wizards, mobile | Top-to-bottom. Progress at top, action at bottom. |
| **Dashboard** | Monitoring, analytics | Top status bar, then L-to-R metric cards, then detail tables. |

**Step 3: Assign visual weight.**

| Weight | Used for |
|---|---|
| **Primary** (1 per screen) | The answer to the user's first question — largest, highest contrast |
| **Secondary** (2-3 per screen) | Supporting context and secondary actions |
| **Tertiary** (everything else) | Details, metadata, supplementary info |

### Layout Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| **Equal weight everything** | Pick ONE primary section. Make it larger/higher contrast/first. |
| **Navigation as primary** | Sidebar ≤240px. Content area gets the majority. |
| **Data dump** | Summary first. Details behind drill-down. <7 choices per group. |
| **Action graveyard** | One primary CTA (filled). One secondary (outline). Rest in overflow. |
| **Premature detail** | Collapse secondary info. Default = simplest useful view. |
| **Copy-paste sections** | Vary structures: tables for data, metrics for stats, lists for activities. |

## Responsive Design Patterns

Used by: `/responsive`

### Layout Patterns (Luke Wroblewski)

| Pattern | Description | When to use |
|---|---|---|
| **Reflow** | Multi-column → single column | Default for most content |
| **Reveal/Hide** | Summary on mobile, detail on desktop | Complex data, secondary info |
| **Off-canvas** | Sidebar → drawer/sheet | Navigation, filters, panels |
| **Priority+** | Show top items, "more" for rest | Navigation with many items |
| **Morph** | Component changes form entirely | Table → card list, tabs → accordion |

### Touch-First Principles

- Tap targets ≥ 44pt (iOS) / 48dp (Material)
- Thumb zone: primary actions in bottom 1/3 of screen
- Swipe for common actions (dismiss, delete, archive)
- Bottom sheet instead of modal on mobile
- No hover-only interactions — everything works with tap

### Content Choreography

For each section, apply this priority test:

1. **"Can the user complete their primary task without this?"** No → **Essential**
2. **"Would removing it force the user to leave the screen?"** Yes → **Useful**
3. **"Would a power user miss it within 3 sessions?"** Yes → **Useful**, No → **Supplementary**

- **Essential** — visible at every size. Remove this and the screen loses its purpose.
- **Useful** — collapse/accordion on mobile, visible on desktop.
- **Supplementary** — hide on mobile entirely, or "View on desktop" link.

Rule: on a 6-section screen, typically 2 Essential, 2-3 Useful, 1-2 Supplementary. If >60% is Essential, you haven't done choreography.

### Breakpoints

| Breakpoint | Viewport | Typical layout |
|---|---|---|
| Mobile | < 640px | Single column, bottom nav, stacked cards |
| Tablet | 640-1024px | 2-column, side nav or top nav, grid |
| Desktop | > 1024px | Multi-column, sidebar, full tables, expanded panels |

Design for content, not breakpoints. Break when the content breaks.

## Edge Case Taxonomy

Used by: `/stress-test`, `/flow`, `/plan`

### Content Extremes

| Dimension | Test cases |
|---|---|
| **Length** | 1 char, 20 chars, 50 chars, 100 chars, 500 chars |
| **Volume** | 0 items, 1 item, 3 items, 10 items, 100 items, 10,000 items |
| **Format** | Numbers with commas, currencies, dates, percentages, negative values |
| **Identity** | Long names, non-Latin scripts (日本語, العربية), RTL, emoji in names |
| **Time** | "Just now", "2h ago", "March 2019", timezone edges, expired/overdue |
| **Permissions** | Admin, editor, viewer, guest — hidden vs. disabled vs. shown |
| **State** | New user (empty), power user (full), churned (stale), error (broken) |

### Priority Order

1. **Empty state** — Most common first-time experience
2. **Overflow** — Long text, many items. Will happen in production.
3. **Error state** — Design for recovery.
4. **Permissions** — Different users see different things.
5. **Extreme values** — Very large numbers, unusual characters.
6. **Temporal** — Expired, future-dated, cross-timezone.

## Component Coverage Thresholds

Used by: `/plan`, `/build`, `/brainstorm`, `/responsive`, `/audit`

| Level | Threshold | Action |
|---|---|---|
| **Floor** | ≥75% | Plans below this are rejected. Search the component mapping harder. |
| **Warning** | <60% | Rebuilding the design system. Re-examine every token-built element. |
| **Target** | >80% | Healthy. Token-built frames are only structural wrappers. |

**Counting rules:**
- Count visible UI elements (buttons, inputs, cards, tables, headers, badges)
- Do NOT count structural containers (layout frames, spacer frames)
- Each library component instance counts once, even if it contains sub-components
- Token-built elements with a library equivalent count as missed coverage

## UX Writing & Microcopy

Used by: `/plan`, `/build`, `/brainstorm`, `/flow`, `/stress-test`

### Character limits by component type

| Component | Element | Max chars | Why |
|---|---|---|---|
| **Button** | Label | 25 | 2-3 words. Verbs only: "Save changes", not "Click here to save" |
| **Page header** | Title | 40 | Short, scannable |
| **Page header** | Subtitle | 80 | One sentence of context |
| **Metric item** | Label | 20 | Noun or short phrase |
| **Metric item** | Value | 12 | Number + unit |
| **Table header** | Label | 20 | One or two words |
| **Badge / Tag** | Label | 15 | Single status word |
| **Toast / Alert** | Message | 100 | What happened + what to do |
| **Empty state** | Headline | 40 | Warm, not robotic |
| **Empty state** | Body | 120 | What this section does + how to populate it |
| **Error message** | Inline | 80 | What went wrong + how to fix it |
| **Tooltip** | Text | 80 | One sentence of clarification |
| **Input field** | Label | 25 | Noun: "Email address" |
| **Input field** | Placeholder | 35 | Example value |
| **Input field** | Help text | 60 | Constraint or format |

### Button label patterns

| Action type | Good | Bad |
|---|---|---|
| **Create** | "Add project", "Create team" | "Submit", "OK", "New" |
| **Save** | "Save changes", "Update profile" | "Save", "Apply" |
| **Delete** | "Delete project", "Remove member" | "Delete", "Yes" |
| **Navigate** | "View details", "Go to settings" | "Click here", "More" |
| **Cancel** | "Cancel" | "Go back", "Never mind" |
| **Confirm destructive** | "Delete permanently", "Remove access" | "Confirm", "Yes, delete" |

### Error message formula

Every error message: **What happened** + **Why** (if not obvious) + **What to do**.

| Type | Example |
|---|---|
| **Validation** | "Email address is invalid. Check for typos." |
| **Permission** | "You don't have access to billing. Ask your admin." |
| **Network** | "Couldn't save your changes. Check your connection and try again." |
| **Server** | "Something went wrong loading your dashboard. We've been notified. Try refreshing." |
| **Not found** | "This project was deleted or moved. Go back to your projects." |

**Never say**: "Error", "Invalid", "Failed", "Oops", "Error 500", "null", "undefined"

### Tone calibration

| Context | Tone | Example |
|---|---|---|
| **Success** | Brief, confident | "Changes saved." |
| **Error** | Calm, helpful | "Couldn't connect. Try again." |
| **Empty state** | Warm, guiding | "No projects yet" |
| **Destructive** | Clear, serious | "This will permanently delete 3 projects." |
| **Loading** | Silent or minimal | Skeleton screens. No "Please wait..." |
| **Onboarding** | Encouraging | "Great start! Next, invite your team." |

## Feedback Classification

Used by: `/revise`

| Type | How to handle | Example |
|---|---|---|
| **Principle-based** | Redesign using Gestalt/Nielsen | "The hierarchy is wrong" |
| **Preference-based** | Ask: brand decision or personal taste? | "I don't like blue" |
| **Usability-based** | Apply relevant cognitive law | "Users can't find the save button" |
| **Content-based** | Rewrite, test readability | "The copy is too technical" |
| **Scope change** | Flag as addition, plan separately | "Can we add a filter?" |
| **Bug report** | Fix directly, verify with screenshot | "This overlaps on mobile" |

Priority: Usability > Principle > Content > Bug > Preference > Scope.
Flag preference-based feedback — ask the user before acting on taste.
Separate scope changes — these become new /plan tasks, not revisions.

## Placeholder Content Detection

Used by: `/plan`, `/build`, `/brainstorm`, `/stress-test`, `/revise`

Flag and replace ANY text matching these patterns:

**Named person placeholders** (from common UI kits):
- "Olivia Rhye", "Phoenix Baker", "Lana Steiner", "Candice Wu", "Natali Craig"
- "olivia@untitledui.com", "phoenix@untitledui.com", etc.
- Any name + email + job title triplet from a UI kit

**Generic content placeholders**:
- "Lorem ipsum" or any Latin filler text
- "[Title]", "[Description]", "[Subtitle]" — bracket placeholders
- "Heading", "Subheading", "Body text" — style names used as content
- "Text", "Label", "Value" — property names used as content

**UI kit default data**:
- "Home", "Dashboard", "Projects", "Tasks", "Reporting", "Users" (when all appear together as default sidebar nav)
- "100", "$100.00", "1,234" — round placeholder numbers
- "Used space" / "Upgrade plan" notifications in sidebars

**When acceptable**: During `/setup-components` extraction and `typicalOverrides` documentation only. Never in final `/plan` or `/build` output.

## AskUserQuestion Format

Used by: all skills

**ALWAYS follow this structure:**

1. **Re-ground:** State what you're planning and where you are. (1 sentence)
2. **Simplify:** Explain the decision in plain English. No Figma jargon or variant key hashes. Say what the user will SEE.
3. **Recommend:** `RECOMMENDATION: Choose [X] because [one-line reason]`
4. **Options:** Lettered: `A) ... B) ... C) ...`

### Rules

- **One decision = one question.** Never combine multiple choices.
- **STOP after each question.** Do NOT proceed until the user responds.
- **Escape hatch:** If obvious answer, state what you'll do and move on.
- **Connect to outcomes.** "This matters because your PM will see a blank screen with no guidance."

## AI Slop Check

Used by: `/brainstorm`, `/plan`, `/build`, `/build-component`, `/revise`, `/flow`, `/responsive`

Before finalizing any design output, check for these common AI design traps:

- **Generic card grid** as primary layout — not every dashboard needs a 3-column card grid
- **Centered everything** with uniform spacing — real designs have intentional asymmetry
- **Dashboard-widget mosaic** with no hierarchy — if everything is a card, nothing stands out
- **Cookie-cutter section rhythm** (hero → cards → table → CTA) — break when content demands it
- **"Clean modern"** as a design direction — this is not a decision
- **Equal visual weight** on all elements — hierarchy means some things are bigger/bolder

Fix before presenting. State what you changed and why.

## Component Design Principles

Used by: `/plan-component`, `/build-component`, `/review-component`

### The Duplicate Problem

Before creating ANY new component:
1. Search by **function** (what it does), not name
2. Check if an existing component could be extended with a new variant
3. Check if the need is a **composition** of existing components
4. Only create new when no existing component serves the job

### Variant Architecture

| Mechanism | When to use | Example |
|---|---|---|
| **Variant property** | Discrete visual modes | Size: sm/md/lg |
| **Boolean property** | Show/hide an optional element | Show icon: true/false |
| **Text property** | Editable text content | Label: "Submit" |
| **Instance swap** | Slot where different components plug in | Icon slot: any icon |

**Rules:**
- 2 values where one is "off" → boolean, not variant
- Accepts any component → instance swap, not variants-per-icon
- Interactive states (hover, focus, disabled) → variant axes, not booleans
- Keep variant axes under 5

### Variant Completeness Checklist

Every interactive component needs:

| State | Required? | What changes |
|---|---|---|
| **Default** | Always | Base appearance |
| **Hover** | Always | Visual feedback on cursor |
| **Focused** | Always | Keyboard navigation indicator |
| **Disabled** | Always | Reduced opacity, no interaction |
| **Pressed/Active** | If clickable | Momentary pressed feedback |
| **Error** | If validates | Error styling |
| **Loading** | If async | Spinner or skeleton |

### Token Binding Rules

Every visual property must be token-bound. No hardcoded values.

| Property | Token category | Example |
|---|---|---|
| Background | `color.background.*` | `bg-primary`, `bg-error-secondary` |
| Text color | `color.text.*` | `text-primary`, `text-on-brand` |
| Border | `color.border.*` | `border-primary`, `border-error` |
| Padding | `spacing.*` | `spacing-md`, `spacing-xl` |
| Gap | `spacing.*` | `spacing-sm` |
| Border radius | `radius.*` | `radius-md`, `radius-full` |
| Font size | `typography.fontSize.*` | `text-sm`, `text-md` |
| Shadow | `shadow.*` | `shadow-sm`, `shadow-lg` |

### Naming Conventions

Follow the existing library's patterns:

- **Component name**: PascalCase with category prefix (`Buttons/Button`, `Input/TextField`)
- **Variant properties**: PascalCase (`Size`, `State`, `Hierarchy`)
- **Variant values**: lowercase (`sm`, `md`, `primary`, `default`)
- **Boolean props**: Emoji prefix + descriptive name (`⬅️ Icon leading`, `📝 Supporting text`)
- **Instance swap props**: Swap emoji + descriptive name (`🔀 Icon leading swap`)
- **Layer names**: camelCase by role (`iconSlot`, `labelText`, `helperText`)

## Canvas Positioning Protocol

**Moved to `shared/canvas-positioning.md`.** Skills reference the shared file directly.
