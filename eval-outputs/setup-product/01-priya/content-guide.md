# Content Guide — TeamPulse

> Generated from minimal user input. Many patterns are inferred from standard team collaboration UX. Review and refine as the product evolves.

## Voice & Tone

**Voice**: Friendly, approachable, plain language. Avoid jargon.
**Reading level**: Conversational — imagine explaining to a new teammate.

| Context | Tone | Example |
|---------|------|---------|
| Success | Warm, encouraging | "Nice! Your update has been shared with the team." |
| Empty state | Friendly, inviting | "Nothing here yet. Share your first update to get started." |
| Error | Calm, helpful | "Something went wrong. Try refreshing the page." |
| Onboarding | Supportive, simple | "Welcome to TeamPulse. Let's get you set up." |

## Capitalization

- **Sentence case** everywhere (buttons, headings, labels)
- Product name: **TeamPulse** (capital T, capital P)

## Terminology

| Instead of... | Use... | Why |
|---------------|--------|-----|
| Post | Update | Feels more natural for team context |
| Article | Page | Simpler, matches wiki mental model |
| Repository | Wiki | User said "wiki" — keep it |

> Note: These terms are inferred. The user didn't specify product language. Confirm with the team before finalizing.

## Button Labels

- Primary actions: verb + noun ("Share update", "Create page")
- Secondary actions: verb only when obvious ("Cancel", "Back")
- Destructive actions: be specific ("Delete this page", not just "Delete")

## Empty States

- Lead with what the user can do, not what's missing
- Include a clear call-to-action
- Keep it to 1-2 sentences max

**Example**:
> "Your feed is empty. Share an update to let your team know what you're working on."

## Error States

- Don't blame the user
- Say what happened in plain language
- Offer a next step

**Example**:
> "We couldn't load your feed. Check your connection and try again."

## Placeholder Text

- Use realistic names: "Alex Chen", "Jordan Lee", "Sam Williams"
- Use realistic content: actual team updates, not lorem ipsum
- Dates: use relative ("2 hours ago") for recent, absolute ("Apr 10") for older
