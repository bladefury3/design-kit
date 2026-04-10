# Sketch Mode Rules

Rules for AI-generated page sketches. These apply at ALL fidelity levels
(`--zones`, `--sketch`, `--wireframe`, `--detailed`). Where a rule behaves
differently by level, the level-specific behavior is noted.

## 1. Strip visual identity, preserve spatial hierarchy
Remove all brand colors, imagery, and icons. Replace with grayscale fills,
hatching, or simple shapes. But maintain the proportional layout — the spatial
relationships between elements are the idea, not the pixels.

This rule holds at every level. Even `--detailed` uses grayscale base with
only semantic color accents (blue for links, red for errors). No brand colors
ever.

## 2. Degrade typography by level
The amount of real text increases with fidelity, but the principle stays
the same: show the TYPE of content, not the exact copy, unless the copy
is structurally meaningful.

- **Zones**: Only zone labels get text ("Navigation", "Hero", "Sidebar").
  Everything else is a labeled box.
- **Sketch**: Wavy lines / squiggle text for body copy. Real Figma Hand
  text only for headers, primary CTAs, nav labels, and structural identifiers.
  This prevents premature copy discussions.
- **Wireframe**: Real placeholder text for most elements — labels, inputs,
  table cells, buttons, badges. Squiggle lines only for long body paragraphs
  (3+ sentences). The text is realistic but fake ("Jane Cooper", "$129.99").
- **Detailed**: All text is real. No squiggles. Every element has readable
  content. Additionally, state annotations and edge case notes are rendered
  as small text near relevant elements.

The progression: labels → shapes → realistic placeholders → realistic + annotated.

## 3. Use line weight as the primary visual hierarchy tool
Thicker, darker strokes for primary containers and CTAs. Thinner, lighter
strokes for secondary elements. No drop shadows, no gradients. This forces
the conversation toward structure and flow.

At `--wireframe` and `--detailed` levels, **color accents supplement line
weight** for semantic meaning only:
- Blue: links, interactive elements, focused states
- Red: errors, required fields, destructive actions
- Green: success states, active toggles
- Amber: warnings, attention needed

These accents communicate behavior, not brand. Use sparingly — a wireframe
with more than 5-6 colored elements has too many.

## 4. Introduce intentional imperfection
Lines should wobble slightly. Corners shouldn't be perfectly square. Circles
should be imperfect. This is the single most important signal: it communicates
"this is negotiable" to stakeholders. A too-clean wireframe gets treated like
a finished design. The roughness of a sketch invites participation — polish
shuts it down.

This rule applies at every level including `--detailed`. The sketch is always
a conversation piece, never a specification.

## 5. Abstract images into crossed-box placeholders with labels
Every image, illustration, or media block becomes a rectangle with an X through
it and a one-word label ("Hero," "Avatar," "Map"). This keeps people from
reacting to content and focuses them on placement and purpose.

At `--wireframe` and above, labels become more descriptive:
"Product Photo", "Cover Image — 1200×600". But the ✕-box treatment never changes.
No real images at any level.

## 6. Maintain real proportions, not real measurements
The sketch should feel like the same screen at arm's length — recognizable in
shape and rhythm — but shouldn't be pixel-accurate. Allow ~10-20% drift in
element sizing. This prevents "move it 4px left" conversations in brainstorming.

## 7. Annotate by level
Annotations are questions and observations, not specifications.

- **Zones**: 1-2 yellow stickies. IA questions: "Is this the right set of
  sections?" / "Which zone is primary?"
- **Sketch**: 2-3 yellow stickies. Structure questions: "Does the infobox
  need to be above the fold?" / "Is the sidebar essential or optional?"
- **Wireframe**: 2-3 yellow stickies (open questions) + 1-2 blue stickies
  (content decisions): "This table shows 3-200 rows — paginate or scroll?"
- **Detailed**: Yellow + blue stickies + inline red annotations placed ON the
  sketch next to relevant elements: "Empty: 'No results'", "Error: red border",
  "Max 3 toasts stacked".

At every level: frame annotations as questions or observations, not as
measurements or pixel specs.

## 8. Limit to a single breakpoint
Don't generate responsive variants. Pick the primary device context (usually
mobile-first or the dominant use case) and sketch only that. Multiple breakpoints
signal engineering readiness, not brainstorming.

## 9. Group screens by flow, not by page
When converting multiple pages, arrange them as a narrative storyboard with
arrows showing user paths, not as isolated screens. The canvas should tell a
story. Think comic panels, not a screenshot gallery. All screens in a flow
use the same fidelity level.

## 10. Use a consistent "pen" aesthetic — and only one
Pick a single sketch style and stick with it across all outputs. Mixing styles
implies different authors or different confidence levels, which muddies the
conversation. Commit to one hand-drawn vocabulary.

This extends to the device frame: the browser chrome, phone outline, or tablet
shell is drawn in the same sketchy style as the content. The frame and the
content should look like they were drawn by the same hand.
