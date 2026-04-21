# Design Decision Tracking — Research

Research into how design decisions are made, scattered, lost, and (sometimes) recovered.
This document maps the problem space to inform the eventual `/decisions` skill.

---

## 1. Decision Taxonomy

Design decisions fall into seven categories. Each has different characteristics that
matter for capture, storage, and retrieval.

### Structural decisions
Layout archetypes, navigation patterns, information architecture, page hierarchy.

- **Who decides:** Designer + PM, sometimes with eng input on feasibility
- **Where it happens:** Figma (wireframes, comments), design reviews, Slack threads about IA
- **Durability:** High — structural decisions persist for the life of a feature, often years
- **Revisit triggers:** Mobile support added, new feature verticals, user research showing navigation confusion
- **Example:** "Settings uses sidebar navigation, not tabs — 6+ categories would overflow on mobile"

### Visual decisions
Color usage, typography hierarchy, spacing rhythm, token choices, brand expression.

- **Who decides:** Designer, sometimes brand team
- **Where it happens:** Figma (directly in designs), design system meetings, brand guidelines
- **Durability:** Medium-high — visual language evolves slowly but does evolve (rebrand, dark mode, accessibility audits)
- **Revisit triggers:** Brand refresh, accessibility audit findings, new platform support
- **Example:** "Body text minimum is 16px — WCAG readability requirement for our user base (parents, many on mobile)"

### Component decisions
Variant taxonomy, prop architecture, anatomy, when to create a new component vs reuse existing.

- **Who decides:** Designer + design system maintainer
- **Where it happens:** Component review meetings, Figma comments, PR reviews for component changes
- **Durability:** High for taxonomy (adding variants is easy, changing structure is hard), medium for props
- **Revisit triggers:** New use case that doesn't fit the variant matrix, performance concerns, cross-platform needs
- **Example:** "Toast uses Type x Size matrix, not Type x Size x Position — position is a layout concern, not a component concern"

### Content decisions
Voice, terminology, error/empty state patterns, capitalization, button label conventions.

- **Who decides:** Content designer or PM, sometimes legal for compliance language
- **Where it happens:** Content guides, Slack threads, Figma comments on specific copy, sometimes meeting notes
- **Durability:** Medium — content patterns evolve as the product matures and user research reveals comprehension issues
- **Revisit triggers:** Internationalization, user research on comprehension, legal/compliance changes, tone shift
- **Example:** "Use 'Ms. Sarah Chen' not 'User 12345' in placeholder content — humanizes the product for our school-parent audience"

### Interaction decisions
Animation, transitions, state behavior, gesture handling, loading patterns.

- **Who decides:** Designer + eng (feasibility), sometimes motion designer
- **Where it happens:** Prototypes, eng implementation PRs, Slack discussions about performance
- **Durability:** Medium — interaction patterns are revisited as platform capabilities and performance constraints change
- **Revisit triggers:** Performance data, platform API changes, accessibility feedback on motion
- **Example:** "Toast auto-dismisses after 5s for success, persists until dismissed for errors — errors need user acknowledgment"

### Scope decisions
What to include/exclude, MVP boundaries, feature prioritization within a design.

- **Who decides:** PM + designer, sometimes stakeholder sign-off
- **Where it happens:** Jira/Linear tickets, planning meetings, Slack threads, design review feedback
- **Durability:** Low-medium — scope decisions are often temporary ("we'll add this later") but the "later" sometimes never comes and the temporary becomes permanent
- **Revisit triggers:** User feedback requesting excluded feature, competitive pressure, technical debt paydown
- **Example:** "Settings V1 ships without notification granularity — just on/off per channel. Granular controls in V2 if adoption warrants."

### Precedent decisions
"We always do X" conventions that aren't formally documented anywhere. Tribal knowledge.

- **Who decides:** Emerges from repeated practice, sometimes one senior designer's preference that becomes convention
- **Where it happens:** People's heads, occasionally surfaced in design review feedback ("we don't do that here")
- **Durability:** High (because nobody knows they exist to revisit them) but fragile (because they leave when people leave)
- **Revisit triggers:** New team member questions the convention, design audit reveals inconsistency
- **Example:** "Primary actions go bottom-right on cards — nobody decided this formally, but every card in the system does it"

### Summary matrix

| Type | Typical decider | Primary habitat | Durability | Capture difficulty |
|---|---|---|---|---|
| Structural | Designer + PM | Figma, design reviews | High | Medium — usually discussed explicitly |
| Visual | Designer | Figma, brand docs | Medium-high | Low during AI work, high elsewhere |
| Component | Designer + DS maintainer | Component reviews, PRs | High | Medium — PR descriptions help |
| Content | Content designer / PM | Slack, Figma comments | Medium | High — lives in conversations |
| Interaction | Designer + eng | Prototypes, PRs | Medium | High — often decided in implementation |
| Scope | PM + designer | Jira/Linear, meetings | Low-medium | Very high — verbal, often unrecorded |
| Precedent | Emerged convention | People's heads | High but fragile | Extremely high — nobody knows it's a decision |

---

## 2. Decision Sources — Where Decisions Live Today

### Figma comments

**Signal quality:** Medium. Figma comment threads contain a mix of feedback ("make this bigger"),
questions ("should this be tabs or sidebar?"), and decisions ("let's go with sidebar"). The
decision is often a reply deep in a thread, not the top-level comment.

**Decision signals:** "Let's go with X", "Approved", "Final answer: X", thumbs-up reactions on
a proposal, resolved threads where the resolution implies the decision.

**Noise ratio:** ~70% noise (questions, feedback, FYIs) / ~30% contains or implies a decision.
Resolved comments are the worst — the decision is hidden behind a "Resolved" badge.

**Accessibility:** Already accessible via `figma_get_comments` MCP tool. The `/revise` skill
already reads and classifies Figma comments. The pattern exists.

**Natural metadata:** Author, timestamp, frame reference (spatial context), resolved status,
thread structure (reply chain shows deliberation).

**Key problem:** Comments don't survive frame deletion. When a designer deletes and rebuilds
a section, all comment history on those nodes is lost. Decisions made in comments about
deleted frames are gone permanently.

### Slack

**Signal quality:** Low. Slack threads are conversations, not decisions. A 30-message thread
might contain one decision ("ok let's go with option B") buried at message #23. The decision
often isn't even stated explicitly — it's implied by the conversation moving on.

**Decision signals:** "Let's do X", "Sounds good", "Ship it", emoji reactions (checkmark, thumbs-up),
thread going quiet after a proposal (implicit consent). But these same signals also appear in
non-decision contexts constantly.

**Noise ratio:** ~90% noise / ~10% contains a recoverable decision. Thread structure helps
(decisions tend to be near the end of a thread) but cross-thread decisions (started in one
channel, concluded in DM) are unrecoverable.

**Accessibility:** No MCP integration today. Slack has an API (conversations.history,
conversations.replies) that could be accessed via a custom MCP server or direct API calls.
The Slack MCP server ecosystem is immature but growing.

**Natural metadata:** Author, timestamp, channel, thread ID, reactions, message links. Rich
metadata, but the content parsing challenge is severe.

**Key problem:** Slack's search is full-text, not decision-aware. Finding "the time we decided
about the nav pattern" requires remembering which channel, which week, and which thread.
After 90 days, most Slack decisions are effectively lost to institutional memory.

### Jira / Linear

**Signal quality:** Low-medium. Tickets track work, not decisions. But decisions hide in several
places: acceptance criteria ("Must use sidebar nav, not tabs"), comments during implementation
("Talked to Sarah — going with 16px minimum"), status changes (moving to "Design Approved"
implies the design was a decision), and linked documents.

**Decision signals:** Acceptance criteria that specify design choices, comments containing
"decided", "approved", "per design review", status transitions, linked Figma frames.

**Noise ratio:** ~85% noise / ~15% contains embedded decisions. The decisions are derivative —
they reflect decisions made elsewhere (meetings, Slack, Figma) rather than being the decision
source. But they're often the only *written* record.

**Accessibility:** Linear has an API and emerging MCP servers. Jira has a REST API accessible
via curl/fetch. GitHub Issues are accessible via `gh` CLI. All feasible but require integration work.

**Natural metadata:** Ticket ID (linkable reference), assignee, sprint/milestone, labels, linked
PRs and Figma frames, creation/update timestamps.

**Key problem:** Tickets are work artifacts, not decision artifacts. Extracting "the design
decision" from a ticket requires understanding which part of the ticket's content represents
a design choice vs. implementation detail vs. project management bookkeeping.

### GitHub PRs

**Signal quality:** Medium-high for design system changes, low for feature PRs. When a PR
modifies a component, token, or design system file, the PR description and review comments
often contain explicit rationale. Feature PRs rarely contain design decision rationale
unless the reviewer asks "why this approach?"

**Decision signals:** PR descriptions with "Design decision:" sections, review comments
explaining "we chose X because Y", commit messages referencing design reviews, linked Figma
frames or screenshots in PR body.

**Noise ratio:** ~60% noise / ~40% contains design rationale (for design system PRs).
For feature PRs, ~95% noise / ~5% design-relevant.

**Accessibility:** Fully accessible via `gh` CLI (`gh api repos/org/repo/pulls/123/comments`).
The `/review` skill already works with PR diffs. The pattern exists.

**Natural metadata:** PR number (linkable), author, reviewers, diff context (which files changed),
merge status, linked issues, review approval status.

**Key problem:** Design decisions in PRs are implementation-focused ("changed Button padding
from 8px to 12px") rather than design-focused ("buttons need more breathing room at small
sizes"). The translation from code change to design decision requires interpretation.

### Meeting notes / docs

**Signal quality:** Varies wildly. Some teams have meticulous meeting notes with explicit
"Decisions" sections. Most teams have partial notes or none at all. Google Docs, Notion,
Confluence — the format varies by team.

**Decision signals:** Explicit "Decisions" or "Action Items" sections, bold/highlighted text,
"We agreed to...", attendee sign-off sections.

**Noise ratio:** Depends entirely on the note-taker. Range from 20% noise (structured notes
with decision sections) to 95% noise (stream-of-consciousness transcripts).

**Accessibility:** No standard integration. Meeting notes live in Google Docs, Notion, Confluence,
or local files. Some teams use AI meeting transcription (Otter, Fireflies, Granola) which
could theoretically extract decisions but rarely do well.

**Natural metadata:** Date, attendees (implicit authority), agenda context, sometimes action
items with owners.

**Key problem:** Meeting notes are the most volatile decision source. They're written once,
rarely revisited, and often incomplete. The decision is in the room, not in the notes. AI
transcription helps with the raw content but not with identifying which statements were decisions
vs. discussion vs. tangents.

### People's heads

**Signal quality:** High (people remember their reasoning) but inaccessible and perishable.

**Decision signals:** "I remember we decided...", "We always do it this way", "Sarah said
to use X", design review feedback that references unwritten conventions.

**Noise ratio:** N/A — this source isn't textual. It only becomes accessible when someone
explicitly recalls a decision, usually triggered by a question or a conflict.

**Accessibility:** Only accessible through conversation. The `/decisions add` mode is
the bridge — a human tells the AI what was decided elsewhere.

**Natural metadata:** None. When someone recalls a decision from memory, the date, context,
and alternatives are often fuzzy or reconstructed.

**Key problem:** This is the most common decision store and the least durable. When someone
leaves the team, their undocumented decisions go with them. The new person either
re-discovers the reasoning or (more commonly) makes a different choice without knowing
the original existed.

### Capturability summary

| Source | % capturable | Signal/noise | Best metadata | MCP feasibility |
|---|---|---|---|---|
| Figma comments | ~60% | 30% signal | Author, frame, thread, timestamp | Already available |
| Slack | ~30% | 10% signal | Author, channel, thread, reactions | Possible (API exists) |
| Jira/Linear | ~40% | 15% signal | Ticket ID, labels, linked items | Possible (API exists) |
| GitHub PRs | ~70% (DS PRs) | 40% signal (DS PRs) | PR#, diff context, reviewers | Already available |
| Meeting notes | ~50% | 20-80% signal | Date, attendees | Manual only |
| People's heads | ~20% | N/A | None | Manual only (via /decisions add) |

---

## 3. Decision Lifecycle

### Birth — how decisions get made

**Explicit vote.** Rare in design. Sometimes happens in design system governance meetings
("Should we add a Banner component or extend Toast?"). The decision point is clear and
usually documented.

**Gradual consensus.** The most common pattern. A designer proposes something, gets feedback,
iterates, and at some point the team implicitly agrees. Nobody says "we've decided" — the
conversation just moves on. This is the hardest type to capture because there's no single
decision moment.

**Default acceptance.** The AI (or a designer) makes a choice, nobody objects, and it becomes
the decision. Common in AI-assisted design: the `/plan` skill picks sidebar nav, the user
approves the plan, and that's the decision. The current `decisions.md` capture handles this
well for AI-assisted work.

**Single authority.** One person (senior designer, design director, PM) makes the call.
Common for scope decisions and brand/visual direction. Often happens verbally: "Let's go with
Option A." Capture depends entirely on whether someone writes it down.

### Durability — how long decisions last

| Decision type | Typical lifespan | What ends it |
|---|---|---|
| Structural (IA, nav) | 1-3 years | Major product pivot, platform expansion |
| Visual (tokens, brand) | 6 months - 2 years | Rebrand, accessibility audit, dark mode |
| Component (taxonomy) | 1-5 years | New use case that breaks the matrix |
| Content (voice, terms) | 6 months - 1 year | User research, internationalization, legal |
| Interaction (motion) | 6 months - 2 years | Performance data, platform changes |
| Scope (MVP bounds) | 1-6 months | User feedback, competitive pressure |
| Precedent (convention) | Until questioned | New team member, design audit |

### Supersession — what triggers revisiting

Decisions get revisited when their **context changes**, not when someone disagrees with them.
Context changes include:

- **New requirements:** Mobile support changes navigation decisions. Internationalization
  changes content decisions. Accessibility audit changes visual decisions.
- **Scale change:** What worked for 5 settings categories doesn't work for 15.
- **Team change:** New designer questions a convention. New PM redefines scope.
- **Evidence:** User research shows navigation confusion. Performance data shows animation
  causes jank. A/B test results contradict the original hypothesis.
- **Platform change:** New Figma feature (variables, branching) enables previously impractical
  approaches. New framework capability changes component architecture.

### Staleness detection

A decision becomes stale when its context has changed but the decision hasn't been revisited.
Signals of potential staleness:

- **Age:** Decisions older than 6-12 months without reaffirmation (being cited by a skill
  counts as reaffirmation)
- **Drift:** The design system has evolved away from what the decision assumed (e.g., decision
  says "use 3-column layout" but the grid system has been updated to support 4 columns)
- **Orphaning:** The decision references components, tokens, or features that no longer exist
- **Contradiction:** A newer decision conflicts with an older one without explicitly superseding it
- **Scope expansion:** The product has added features/sections that the original decision
  didn't account for (e.g., "sidebar nav for settings" decided when there were 6 categories,
  now there are 14)

### Conflict patterns

Decisions conflict when:

- **Same scope, different choices:** Two active decisions about the same thing ("use tabs for
  settings" and "use sidebar for settings" from different timeframes)
- **Transitive conflicts:** Decision A says "all pages use sidebar nav." Decision B says
  "mobile pages use bottom tabs." These don't directly conflict but create ambiguity for
  mobile settings pages.
- **Implicit vs explicit:** A precedent decision ("we always do X") conflicts with an explicit
  decision ("for this feature, do Y") without either acknowledging the other.

---

## 4. Decision Metadata

### Essential fields (must-have for the `/decisions` skill)

| Field | Why essential |
|---|---|
| **id** (DEC-NNN) | Reference from other decisions, cite in plans, enable supersession chains |
| **date** | When it was decided — needed for staleness detection |
| **decision** | What was chosen — the core fact |
| **rationale** | Why — the constraints and tradeoffs that led to this choice |
| **scope** | What skill/feature/area this applies to — enables scope-matching |
| **status** | active / superseded / revisit — lifecycle tracking |

### High-value fields (should-have)

| Field | Why valuable |
|---|---|
| **alternatives-rejected** | Prevents re-proposing already-considered options. The single highest-value field to add. |
| **source** | Where the decision was made (ai-assisted, figma-comment, slack, meeting, github-pr). Enables provenance tracking. |
| **confidence** | high (explicit choice) / medium (accepted default) / low (inferred from convention). Helps prioritize review. |
| **supersedes** | Links to the decision this one replaces. Creates a decision history chain. |

### Nice-to-have fields (future)

| Field | Why future |
|---|---|
| **who** | Decision-maker and stakeholders. Useful for large teams, overhead for small ones. |
| **depends-on** | Decisions that this one assumes. Enables cascade staleness (if A is superseded, B might be stale). |
| **scope-boundary** | Specific components/tokens/screens this constrains. Enables precise scope-matching. |
| **expires** | Explicit expiration date for time-bound decisions (e.g., "scope decision valid until V2 planning"). |
| **evidence** | Link to user research, analytics, or A/B test that informed the decision. |

### Metadata availability by source

| Source | date | decision | rationale | alternatives | who | confidence |
|---|---|---|---|---|---|---|
| AI-assisted (current) | Auto | Auto | Auto | Partial | Implicit | Derivable |
| Figma comments | Auto | Extractable | Sometimes | Rare | Auto (author) | Low |
| Slack | Auto | Extractable | Sometimes | Sometimes (in thread) | Auto (author) | Low |
| GitHub PRs | Auto | Extractable | Often (DS PRs) | Sometimes | Auto (author) | Medium |
| Meeting notes | Manual | Extractable | Sometimes | Sometimes | Manual | Medium |
| People's heads | Manual | Manual | Manual | Manual | Manual | Low |

---

## 5. Existing Approaches

### Architecture Decision Records (ADRs)

**The Nygard format (2011).** Four sections: Title, Context, Decision, Status, Consequences.
Stored in `doc/arch/adr-NNN.md`. Monotonically numbered, never reused, immutable (superseded
rather than edited). ThoughtWorks moved ADRs to "Adopt" (strongest recommendation) in 2018.

**What works:** Lightweight, version-controlled, discoverable in code review. The "consequences"
section forces thinking about second-order effects.

**What breaks down:** No scoping mechanism (which part of the system does this apply to?).
No staleness detection. Teams write ADRs enthusiastically for the first month, then stop.
The format is too heavy for high-frequency decisions (design decisions happen 10-50x more
frequently than architecture decisions).

**MADR v4.0 (2024).** Extended format with Decision Drivers, Considered Options, Confirmation
section. YAML frontmatter for metadata (decision-makers, consulted, informed — RACI model).

**What works:** Forces documenting alternatives. The "Confirmation" section asks how compliance
will be verified. More structured than Nygard.

**What breaks down:** The full template is heavy. Teams use the "bare" variant and skip
most sections. No active tooling supports MADR 4.0.

### Design system changelogs

**IBM Carbon** is the only major design system with formal ADRs (5 entries in ~1 year, adopted
June 2025). Uses standard Nygard format. Low adoption rate suggests even with formal process,
capture frequency is low.

**Shopify Polaris**, **GitHub Primer**, **Adobe Spectrum** — none have formal decision logs.
Decision rationale is embedded in component documentation ("when to use" / "when not to use"
sections). Changelogs (via changesets) track what changed but not why.

**The pattern:** Design systems document the WHAT (components, tokens, usage guidelines) well.
The WHY is embedded inline in component docs, not tracked as a separate decision log. Cross-cutting
decisions (spacing scale, naming convention, token strategy) have no natural home.

### AI-agent-aware decision tools (2026 wave)

**Decider** (sventorben/decider, January 2026). Go CLI for "Git-native ADRs as shared,
enforceable context for AI coding agents." Key innovation: `scope.paths` (glob patterns
specifying which code paths the decision applies to). `decider check diff --base main`
returns applicable ADRs for a change set. Includes a "Steward" agent for Claude Code.

**Relevance:** The scope-matching concept is the key takeaway. Instead of reading all
decisions, query "which decisions apply to this feature area?" Design-kit could scope
decisions to feature areas, component names, or screen types.

**Lory** (jankowskim/lory, March 2026). Rust CLI that turns git commit messages into
structured decision records using git trailers. SQLite index for path-based querying.
`lory stale` detects outdated assumptions. `lory context <path>` returns all decisions
for a code region. Has an MCP server.

**Relevance:** Staleness detection and path-based querying are directly applicable. The
commit-message-as-decision approach doesn't transfer to design (no commits in Figma), but
the query and staleness patterns do.

**DecisionOps** (decisionops/skill, March 2026). AI agent skill with cloud MCP service.
Five-step workflow: Gate, Gather, Evaluate, Validate, Publish. Trigger detection for when
a task warrants recording a decision.

**Relevance:** The trigger/gate concept maps to design-kit's existing "when to capture"
table. The cloud dependency doesn't fit (design-kit is file-based).

**.decisions** (MakeDesignPop/dotdecisions, March 2026). Ultra-lightweight: `.decisions/`
folder with `project.md` (written once) + `log.md` (append-only). "If you're writing more
than a few lines, you're documenting, not deciding."

**Relevance:** Design-kit's `decisions.md` is already this pattern with more structure.
Validates the single-file, append-only approach.

**Reasoning Formats** (reasoning-formats, February 2026). YAML/JSON specs separating
Decision Reasoning Format (DRF) from Context Reasoning Format (CRF). Temporal validity
on context entities. "Tensions" field for explicit tradeoffs.

**Relevance:** The temporal validity concept (decisions that expire) and tensions field
are worth adopting. The full spec is academic with zero adoption.

### Decision journals (personal practice)

**Farnam Street / Shane Parrish format.** At decision time, record: situation, problem
frame, variables, complications, alternatives with reasoning, expected outcomes with
probabilities, confidence level. Review later to compare predicted vs actual.

**Relevance:** The confidence + later-validation loop is applicable. The AI could record
its confidence in a design decision; the designer validates during audit/review. Over
time, calibration data accumulates.

---

## 6. Design-Kit Integration Points

### Current decision flow

```
                          ┌─────────────┐
                          │ decisions.md │ ← system-wide decisions
                          └──────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │  /plan    │ │ /design  │ │ /audit   │  ... (all skills read via Tier 0)
              └────┬─────┘ └────┬─────┘ └────┬─────┘
                   │            │            │
                   ▼            ▼            ▼
              append to    append to    append to
              decisions.md decisions.md decisions.md
              (if layout   (if cross-   (if new rule
               archetype    feature      established)
               chosen)      routing)
```

**Six skills write:** /plan, /plan-component, /design, /revise, /audit, /setup-product.

**All skills read:** Via Tier 0 in `shared/design-system-loading.md`. The file is loaded
alongside `product.json`, `content-guide.md`, and `layout-patterns.json`.

**Key gap:** No skill currently *reads* decisions before *writing*. Skills append without
checking if a relevant decision already exists. Only `/setup-product` reads before writing
(to merge, not to check for conflicts).

### Where `/decisions` fits

```
Phase 0 (context enrichment):
  /setup-tokens → /setup-components → /setup-relationships → /setup-icons → /setup-product
  /decisions  ← NEW: manage the decision log itself

Phase 2+ (design pipeline):
  All skills read decisions via Tier 0 (unchanged)
  All writing skills append via shared/decision-capture.md (format evolves)
```

`/decisions` is a Phase 0 skill — it enriches the context that all other skills consume.
It doesn't participate in the design pipeline directly.

### How `/decisions add` bridges external sources

The `/decisions add` mode is the manual bridge for decisions made outside AI-assisted work:

1. User runs `/decisions add`
2. Skill asks: What was decided? Why? What was rejected? Where was it decided?
3. Skill generates a structured entry with auto-incremented ID
4. Entry is appended to `decisions.md` with `source: meeting` / `source: slack` / etc.

This is low-friction (30 seconds) and high-confidence (the human is the authority on what
was decided). It doesn't require any external tool integration.

### How `/decisions import` could work per source

**Figma comments** (highest feasibility):
1. Call `figma_get_comments` — retrieve all comments on active file
2. Filter for unresolved comments containing decision signals
3. Classify using the `/revise` feedback classification framework (already exists)
4. Present candidates to user for confirmation
5. Append confirmed decisions with `source: figma-comment`

The `/revise` skill already does steps 1-3 for feedback ingestion. This is an existing
pattern being repurposed for decision extraction.

**GitHub PRs** (medium feasibility):
1. Use `gh api` to fetch PR description + review comments
2. Filter for design-relevant content (mentions of components, tokens, visual changes)
3. Extract decision candidates (rationale in PR description, review comment resolutions)
4. Present for confirmation
5. Append with `source: github-pr#NNN`

**Meeting notes** (manual, always feasible):
1. User pastes notes or provides file path
2. LLM extracts decision candidates from unstructured text
3. User confirms/edits each candidate
4. Append with `source: meeting`

### How `/decisions review` detects staleness

Staleness signals to check:

1. **Age without reaffirmation:** Decision >90 days old, never cited by a skill in that period
2. **Orphaned references:** Decision mentions a component or token that no longer exists in
   `design-system/components/index.json` or `design-system/tokens.json`
3. **Contradiction:** Two active decisions with overlapping scope make different choices
4. **Scope expansion:** Product has added features (visible in `product.json` IA) that the
   original decision didn't account for
5. **Superseded without marking:** A newer decision effectively replaces an older one but
   neither has a `supersedes` field

### Format evolution path

**Current:** One-liner, no metadata
```
- 2026-04-10 [/plan settings] Sidebar nav for settings — reduces cognitive load on mobile
```

**Proposed:** Structured entry with ID and metadata
```
### DEC-001
- date: 2026-04-10
- scope: /plan settings
- decision: Sidebar navigation for settings pages
- rationale: Settings have 6+ categories; tabs would overflow on mobile
- alternatives-rejected: Top tabs, accordion
- source: ai-assisted
- status: active
- confidence: high
```

**Migration:** Backward compatible. Old one-liners still parse. Skills that write decisions
use the new format going forward. `/decisions review` can offer to migrate old entries.

---

## 7. Open Questions

### Format questions
- **Single file vs directory?** One file works at 50-200 decisions. At 500+, section-based
  grouping may not be enough. When to split?
- **YAML-in-markdown vs frontmatter vs JSON?** YAML-in-markdown is human-editable and
  renders in GitHub. JSON is machine-parseable. Frontmatter is per-file (implies directory).
  The LLM parses all formats equally well — the tiebreaker is human readability.
- **How verbose should entries be?** Current one-liners are ~120 chars. Structured entries
  are ~6-8 lines. Does the added metadata justify the space in Tier 0 context loading?

### Ingestion questions
- **How aggressive should auto-extraction be?** Figma comments have ~30% signal. Should the
  AI filter aggressively (high precision, misses some decisions) or broadly (high recall,
  more false positives to confirm)?
- **Should Slack integration be a goal?** The noise ratio is ~90%. Even with AI extraction,
  the effort-to-value ratio may not justify building it. Manual `/decisions add` after a
  Slack conversation might be permanently better than automated extraction.
- **How to handle multi-tool decisions?** A decision might start in Slack ("let's do sidebar"),
  get refined in Figma comments ("sidebar with 240px width"), and get finalized in a PR
  ("implemented sidebar at 240px with collapse on mobile"). Which source gets recorded?

### Lifecycle questions
- **How aggressive should staleness detection be?** Flag at 90 days? 180? Should it depend
  on decision type (structural decisions have longer validity than scope decisions)?
- **What happens when a decision is superseded?** Mark the old one as `superseded` with a
  pointer to the new one? Or keep both active with a `conflicts-with` relationship?
- **Should decisions auto-expire?** Scope decisions ("V1 ships without X") have natural
  expiration points. Should the format support explicit expiration dates?

### Integration questions
- **Should decisions link to Figma frames/nodes?** If a decision was made about a specific
  frame, linking enables "show me the decisions that apply to this design." But Figma node
  IDs are volatile (they change when frames are recreated).
- **Should `/plan` check for conflicting decisions before proposing?** Currently skills
  read decisions but don't systematically check for conflicts. Adding conflict detection
  would make the Tier 0 loading more complex but prevent re-litigation.
- **How should decisions interact with `context.md`?** Per-feature decisions in context.md
  and system-wide decisions in decisions.md can overlap. Should context.md reference
  decision IDs? Should `/plan` check both?

### Scale questions
- **What's the context window budget?** If decisions.md grows to 200 structured entries at
  ~8 lines each, that's ~1600 lines loaded in Tier 0. Is that acceptable for every skill
  invocation? Should there be a summary/index layer?
- **Should decisions be indexed?** A simple JSON index (`decisions-index.json`) with ID,
  date, scope, status, one-line summary could enable fast filtering without loading the
  full file. Skills load the index in Tier 0, then fetch full entries on demand.
