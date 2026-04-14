# Content Guide — TeamPulse

> Generated from detailed user spec. Terminology and voice rules are user-mandated, not inferred. URL research (teampulse.io) was unavailable — did not affect output quality as interview data was comprehensive.

## Voice & Tone

**Voice**: Professional but warm (user-specified)
**Person**: Second person — "you", "your" (user-specified)
**Capitalization**: Sentence case everywhere (user-specified)

### Tone Matrix

| Context | Tone | Register | Example |
|---------|------|----------|---------|
| Success | Confident, brief | "Changes saved." | No exclamation. State the fact. |
| Empty state | Encouraging, actionable | "No pulses yet. Share what your team is working on." | Invite action, don't dwell on emptiness. |
| Error | Calm, diagnostic | "Couldn't reach TeamPulse. Check your connection and try again." | What happened → reassure → next step. |
| Onboarding | Welcoming, progressive | "Welcome to TeamPulse. Let's set up your workspace." | One step at a time. Never list everything at once. |
| Destructive | Serious, explicit | "Permanently delete 'Engineering onboarding'? This removes the page and all replies. This can't be undone." | Name the thing. State the consequence. No softening. |
| Admin/Settings | Clear, neutral | "Workspace URL can't be changed after creation." | Informational. No personality needed. |

## Capitalization Rules

- **All UI text**: Sentence case ("Create new pulse", not "Create New Pulse")
- **Product name**: TeamPulse (one word, two capitals)
- **Navigation items**: Sentence case in labels ("Home", "Feed", "Knowledge base")
- **Headings**: Sentence case ("Workspace settings", not "Workspace Settings")
- **Buttons**: Sentence case ("Save changes", "Invite teammate")

## Terminology — STRICT

These mappings are **requirements**, not suggestions. The user explicitly defined them.

| Never use | Always use | Context |
|-----------|-----------|---------|
| Organization | **Workspace** | Top-level container. "Organization" is forbidden in all user-facing copy. |
| Post | **Pulse** | The core content unit. "She shared a pulse", "Create a new pulse" |
| Wiki (in copy) | **Knowledge base** | In all user-facing copy. Navigation label "Wiki" is acceptable if space-constrained. |
| Repository | **Knowledge base** | Same mapping — use "knowledge base" |

### Inferred terminology (confirm with team)

| Generic | TeamPulse | Context |
|---------|-----------|---------|
| Comment | Reply | Threaded response to a pulse |
| Channel | Team space | Group context for conversations |
| Member | Teammate | In general copy. "Member" is acceptable in admin/settings context. |
| Bookmark | Save | User's saved items |

## Spacing Reference

Per user spec:
- **Standard grid**: 8px
- **Compact grid**: 4px (for dense contexts like tables, sidebars)
- **Section gaps**: 32px (user-specified)
- **Field gaps**: 16px (user-specified)
- **Content padding**: 24px (user-specified)

## Button Labels

| Action | Label | Notes |
|--------|-------|-------|
| Create content | "Create pulse", "New page" | Verb + noun |
| Save | "Save changes" | Specific — not just "Save" |
| Cancel | "Discard changes" | More precise than "Cancel" in form contexts |
| Delete | "Delete [item name]" | Always name the thing being deleted |
| Invite | "Invite teammate" | Uses "teammate" not "member" |
| Navigation | "View all", "See details" | Destination-oriented |

## Empty States

| Section | Headline | Body | CTA |
|---------|----------|------|-----|
| Feed | "Your feed" | "Pulses from your team show up here." | "Create your first pulse" |
| Knowledge base | "Knowledge base" | "A shared place for your team's documentation." | "Create a page" |
| Notifications | "You're all caught up" | "New mentions and replies will appear here." | — |
| Search | "No results for '[query]'" | "Try different terms or check spelling." | — |
| Team directory | "Your team" | "Invite teammates to start collaborating." | "Invite teammate" |
| Saved items | "Saved" | "Pulse and pages you save will appear here." | — |

## Error States

| Scenario | Message |
|----------|---------|
| Network error | "Couldn't connect to TeamPulse. Check your internet connection and try again." |
| Save failed | "Your changes didn't save. They're still here — try saving again." |
| Not found | "This page doesn't exist or was moved." |
| Permission denied | "You don't have access to this workspace. Ask a workspace admin to invite you." |
| Validation | "Workspace name must be between 2 and 64 characters." |
| URL conflict | "This URL is already taken. Try a different one." |

## Placeholder Content

**Names**: Alex Chen, Jordan Lee, Sam Williams, Priya Patel, Marcus Johnson
**Workspace**: Acme Engineering
**Pulses**: "Shipped the new onboarding flow — feedback welcome", "Q2 roadmap is up in the knowledge base"
**Pages**: "Engineering onboarding guide", "Q2 product roadmap", "API reference"
**Team spaces**: "Product", "Engineering", "Design", "Marketing"
**URL slug**: acme-eng (matches user's spec example)
