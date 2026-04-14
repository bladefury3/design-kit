# Content Guide — TeamPulse

> Generated from research-driven brief (n=24 users). Terminology is user-tested, not inferred. Tone preferences were A/B tested (friendly won 83%). All design decisions reference specific research findings.

## Voice & Tone

**Voice**: Friendly and conversational (83% preferred over formal in user testing)
**Person**: Second person ("you", "your")
**Capitalization**: Sentence case

### The Core Rule

**Humor in empty states. Never in errors.**

This is user-specified and research-backed. Empty states are an opportunity to delight. Error states need trust and clarity.

### Tone Matrix

| Context | Tone | Humor? | Example |
|---------|------|--------|---------|
| Success | Warm, brief | Light | "Update shared. Your team will see it in their feed." |
| Empty state (feed) | Playful, encouraging | Yes | "Your feed is a blank canvas. Time to share your first update!" |
| Empty state (docs) | Inviting, curious | Light | "No docs yet. What does your team need to remember?" |
| Empty state (notifications) | Celebratory | Yes | "You're all caught up! Go enjoy your day." |
| Error (network) | Calm, helpful | **Never** | "Couldn't connect to TeamPulse. Check your connection and try again." |
| Error (save) | Reassuring, specific | **Never** | "Your changes didn't save. They're still here — try again." |
| Error (not found) | Neutral, helpful | **Never** | "This page doesn't exist or was moved. Try searching for it." |
| Onboarding | Welcoming, guiding | Light | "Welcome to TeamPulse! Let's get you set up with your first update." |
| Destructive | Serious, explicit | **Never** | "Delete 'Q2 Roadmap'? This removes the doc and all comments. Can't be undone." |
| Loading | Subtle, patient | Optional | "Pulling in the latest updates..." |

## Terminology — USER-RESEARCHED

These terms were tested with real users. They are requirements, not suggestions.

| Generic term | TeamPulse term | Research basis |
|-------------|---------------|----------------|
| Post | **Update** | Users say "updates" not "posts" (user-tested) |
| Workspace | **Team space** | Users say "team space" not "workspace" (user-tested) |
| Wiki / Docs | **Docs** | Users say "docs" not "wiki" (user-tested) |
| Article | **Doc** | Singular of "docs" |
| Comment | **Reply** | Inferred — consistent with conversational tone |
| Member | **Teammate** | Inferred — friendlier, matches voice |

### Terms to AVOID

| Don't say | Why |
|-----------|-----|
| "Post" | Users say "update" |
| "Workspace" | Users say "team space" |
| "Wiki" or "Knowledge base" | Users say "docs" |
| "Repository" | Too technical |
| "Content" | Too generic — say "update" or "doc" |

## Research-Driven Content Decisions

Each content decision should trace back to a research finding:

### R1: "Can't find what I need" (71%)
- Search placeholder: "Search updates, docs, and teammates..."
- Search should be in the top navigation, always visible
- Empty search: "No results for '[query]'. Try different terms or browse docs."

### R2: Notification overload (58%)
- Default notification tab: **Actionable** (not All)
- Batch low-signal notifications: "3 teammates liked your update" (not 3 separate notifications)
- "Mark all as read" must be prominent — top-right of notification center
- Notification empty state (celebratory): "You're all caught up! Nothing needs your attention."

### R4: 73% start with feed
- Home defaults to feed view
- Feed should load first, fast, with latest updates visible immediately
- "What's on your mind?" prompt at top of feed for quick creation

### R5: Wiki users have 2.4x retention
- Cross-link docs from feed: "Related doc: [Engineering Onboarding Guide]"
- After creating an update, suggest: "Want to turn this into a doc for your team?"
- Doc creation CTA in sidebar and empty states

### R6: First pulse within 48 hours (activation)
- New user empty feed: "Welcome! Share your first update to let your team know what you're up to."
- Onboarding step: "Create your first update" (not "explore the app")
- First-run tooltip on the compose button: "Share what you're working on"

### R7: Friendly > formal (83%)
- Use contractions: "you're" not "you are", "can't" not "cannot"
- Use "!" sparingly but naturally in positive contexts
- First names in examples (not "User A", "User B")

## Button Labels

| Action | Label | Research connection |
|--------|-------|-------------------|
| Create | "Share update" | R6: creation is activation metric |
| Create doc | "New doc" | R5: encourage wiki usage |
| Search | "Search..." | R1: #1 frustration |
| Notification | "Mark all as read" | R2: notification overload |
| Filter | "Actionable" / "All" / "@Mentions" | R2: smart filtering |

## Empty States

| Section | Headline | Body | Humor level | CTA |
|---------|----------|------|-------------|-----|
| Feed (new user) | "Welcome to your feed!" | "This is where your team's updates live. Share what you're working on to get started." | Warm | "Share your first update" |
| Feed (all read) | "You've seen everything" | "Check back later for new updates from your team." | Light | — |
| Docs | "Your team's docs live here" | "What does your team need to remember? Start a doc." | Curious | "Create a doc" |
| Notifications (empty) | "You're all caught up!" | "Nothing needs your attention right now. Nice work." | Celebratory | — |
| Search (no results) | "No results for '[query]'" | "Try different keywords or check your spelling." | None | "Browse docs" |
| Team | "Your team" | "Invite teammates to start collaborating in TeamPulse." | Warm | "Invite teammates" |

## Error States

**Never use humor in errors.** Errors need trust, not jokes.

Structure: What happened → Reassurance → Next step

| Scenario | Message |
|----------|---------|
| Network | "Couldn't connect to TeamPulse. Check your internet connection and try again." |
| Save failed | "Your update didn't save. Your draft is still here — try again." |
| Page not found | "This doc doesn't exist or was moved. Try searching for it." |
| Permission | "You don't have access to this team space. Ask a teammate to invite you." |
| Load failed | "Couldn't load your feed. Try refreshing the page." |

## Placeholder Content

**Names**: Alex Chen, Jordan Lee, Sam Williams, Priya Patel, Marcus Johnson
**Team space**: Acme Engineering
**Updates**: "Just shipped the new search — findability should be way better now", "Q2 planning doc is ready, feedback welcome by Thursday", "Heads up: API maintenance tonight 10-12pm"
**Docs**: "Engineering onboarding guide", "Q2 product roadmap", "Incident response playbook"
**Notification batching**: "3 teammates liked your update", "Jordan and 2 others replied to your doc"
