# Content Guide — TeamPulse

> Generated from structured product brief + Notion.so pattern research + existing Figma frames analysis.

## Voice & Tone

**Voice**: Professional but approachable. Think "smart colleague explaining something clearly" — not corporate, not casual.

**Principles**:
1. **Clear over clever** — Say what you mean. No puns in UI copy.
2. **Active voice** — "You created a pulse" not "A pulse was created"
3. **Second person** — "Your team" not "The user's team"

### Tone by Context

| Context | Tone | Register | Example |
|---------|------|----------|---------|
| Success | Confident, warm | "Done. Your pulse is live." | Brief confirmation, no exclamation marks |
| Empty state | Encouraging, actionable | "No pulses yet. Start one to kick things off." | Lead with action |
| Error | Calm, specific | "Couldn't save your changes. Your edits are still here — try again." | Acknowledge + reassure + next step |
| Onboarding | Welcoming, guiding | "Welcome to TeamPulse. Let's set up your workspace." | Progressive, not overwhelming |
| Destructive | Serious, clear | "This will permanently delete the page and all replies. This can't be undone." | Spell out consequences |

## Capitalization & Formatting

- **Sentence case** for all UI text (buttons, headings, labels, menu items)
- **Product name**: TeamPulse (one word, capital T and P)
- **Feature names**: lowercase in running text ("your feed", "the wiki"), title case in navigation ("Feed", "Wiki")
- **Dates**: Relative for <7 days ("2h ago", "Yesterday"), absolute after ("Apr 8, 2026")
- **Numbers**: Digits for metrics ("12 active members"), words for small counts in prose ("three new pages")

## Terminology

| Generic term | TeamPulse term | Context |
|-------------|---------------|---------|
| Post | Pulse | Activity feed content — the core content unit |
| Channel | Team space | Group context for conversations and shared content |
| Article / Doc | Page | Wiki content unit |
| Workspace | Workspace | Top-level organizational container |
| Comment | Reply | Response threaded under a pulse |
| Bookmark | Save | User's collection of saved items |
| Dashboard | Home | Personalized landing page |
| Member | Teammate | Person in the workspace (use in copy, not "user") |

## Button Labels

| Action type | Pattern | Examples |
|------------|---------|----------|
| Primary creation | Verb + noun | "Create pulse", "New page", "Invite teammate" |
| Confirmation | Specific verb | "Save changes", "Send invite", "Publish page" |
| Navigation | Destination | "View all", "Go to wiki", "Open in new tab" |
| Destructive | Specific + warning | "Delete page", "Remove teammate", "Leave workspace" |
| Cancel | Plain | "Cancel" (never "Nevermind" or "Go back") |

## Empty States

Structure: **Headline** (what this area is for) + **Body** (what to do) + **CTA** (action button)

| Section | Headline | Body | CTA |
|---------|----------|------|-----|
| Feed | "Your feed" | "Pulses from your team will show up here. Share what you're working on." | "Create your first pulse" |
| Wiki | "Team wiki" | "A shared place for documentation. Start building your team's knowledge base." | "Create a page" |
| Notifications | "All caught up" | "You'll see mentions, replies, and updates here." | — (no CTA needed) |
| Search results | "No results for '[query]'" | "Try different keywords or check your spelling." | — |
| Team members | "Your team" | "Invite teammates to start collaborating." | "Invite teammates" |

## Error States

Structure: **What happened** + **Reassurance** + **Next step**

| Scenario | Message |
|----------|---------|
| Network error | "Couldn't connect to TeamPulse. Check your internet and try again." |
| Save failed | "Your changes didn't save. They're still here — try saving again." |
| Page not found | "This page doesn't exist or was moved. Check the link or search for it." |
| Permission denied | "You don't have access to this workspace. Ask a teammate to invite you." |
| Rate limit | "You're doing that too fast. Wait a moment and try again." |

## Placeholder Content

When building mockups, use realistic content:

**Names**: Alex Chen, Jordan Lee, Sam Williams, Priya Patel, Marcus Johnson
**Pulses**: "Shipped the new onboarding flow — feedback welcome", "Q2 planning doc is ready for review", "Quick heads-up: API maintenance tonight 10pm-12am"
**Wiki pages**: "Engineering onboarding guide", "Q2 product roadmap", "Design system changelog"
**Workspace**: "Acme Engineering"
**Team spaces**: "Product", "Engineering", "Design", "Marketing"
