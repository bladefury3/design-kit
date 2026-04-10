# Placeholder Detection

Flag and replace ANY text matching these patterns. Placeholder text in final
output signals that the design wasn't properly customized.

## Named person placeholders (UI kit defaults)

- "Olivia Rhye", "Phoenix Baker", "Lana Steiner", "Candice Wu", "Natali Craig"
- "olivia@untitledui.com", "phoenix@untitledui.com", etc.
- Any name + email + job title triplet from a UI kit

## Generic content placeholders

- "Lorem ipsum" or any Latin filler text
- `[Title]`, `[Description]`, `[Subtitle]` — bracket placeholders
- "Heading", "Subheading", "Body text" — style names used as content
- "Text", "Label", "Value" — property names used as content

## UI kit default data

- "Home", "Dashboard", "Projects", "Tasks", "Reporting", "Users" (when all
  appear together as a default sidebar nav)
- "100", "$100.00", "1,234" — suspiciously round placeholder numbers
- "Used space" / "Upgrade plan" notifications in sidebars
- "UX review presentations" — common Untitled UI card description

## When placeholders are acceptable

- During `/setup-components` extraction and `typicalOverrides` documentation
- In build.json manifests as reference (the build process replaces them)
- Never in final `/plan`, `/build`, `/brainstorm`, or `/flow` output

## Detection in screenshots

After every screenshot, scan visible text for the patterns above. If found:
1. Identify which component instance contains the text
2. Use `figma_set_instance_properties` to set domain-specific content
3. If the component doesn't expose text as a property, walk the instance tree
   with `sweepText()` (scope to the specific instance, not the whole page)
