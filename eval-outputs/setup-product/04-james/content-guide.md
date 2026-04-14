# Content Guide — TeamPulse

> Generated from strategic product brief covering 3 user types, WCAG AA, RTL, and scale 5-5000. Research includes Linear and Notion pattern analysis. User's design philosophy: consistent patterns > pixel-perfect.

## Voice & Tone

**Voice**: Clear, confident, human. Professional without being cold. Warm without being casual.
**Person**: Second person ("you", "your")
**Capitalization**: Sentence case

### Tone by Context and User Type

TeamPulse serves three distinct user types. Tone should adapt:

| Context | IC tone | Lead tone | Admin tone |
|---------|---------|-----------|------------|
| Success | "Done. Your pulse is live." | "Changes saved." | "Settings updated." |
| Empty state | "No pulses yet. Share what you're working on." | "No blockers right now. Your team is clear." | "No members yet. Invite your team to get started." |
| Error | "Couldn't load your feed. Try refreshing." | "Dashboard data is stale. Refreshing..." | "SSO configuration failed. Check your provider settings." |
| Celebration | "Your pulse sparked 12 replies." | "Your team posted 47 pulses this week." | "All 200 members are onboarded." |

**Key principle**: ICs get warmth. Leads get efficiency. Admins get precision.

## Terminology

| Generic | TeamPulse | Notes |
|---------|-----------|-------|
| Post | Pulse | Core content unit |
| Workspace | Workspace | Top-level container |
| Article / Doc | Page | Wiki content |
| Channel | Team space | Group context |
| Member | Teammate | In general copy; "member" in admin context |
| Dashboard | Home | Each user type sees a different Home |

## Accessibility in Content

Per WCAG AA requirements (user-specified):

1. **Never rely on color alone** for meaning. Every status must have:
   - A text label ("Active", "Blocked", "Invited")
   - An icon or shape indicator
   - Color as a reinforcement, not the primary signal

2. **All metrics must have text labels**, not just numbers:
   - "12 active members" not just "12"
   - "3 open blockers" not just "3"
   - "2.4h avg response" not just "2.4h"

3. **Link text must be descriptive**:
   - "View team health details" not "Click here"
   - "Open Q2 roadmap" not "Read more"

4. **Error messages must be perceivable**:
   - Don't rely on red border alone — add error text and icon
   - Error summary at top of form for screen readers

## Scale-Aware Content

Content must work from team of 5 to team of 5000:

| Metric | Team of 5 | Team of 200 | Team of 5000 |
|--------|-----------|-------------|--------------|
| Active members | "3 of 5 active" | "142 of 200 active" | "3,847 of 5,000 active" |
| Blockers | "1 open blocker" | "12 open blockers" | "47 open blockers" |
| Response time | "Avg 1.2 hours" | "Avg 3.4 hours" | "Avg 8.1 hours" |

**Rules**:
- Use locale-aware number formatting (commas for thousands in en-US)
- Percentages when absolute numbers lose meaning at scale ("73% active" vs "3,847 active")
- Truncation with count for long lists ("Priya, Marcus, and 45 others")

## RTL Considerations

For 15+ languages including RTL:
- All copy must work when mirrored
- Don't hardcode directional words ("left sidebar" → "navigation sidebar")
- Use logical properties in design (start/end, not left/right)
- Numbers remain LTR even in RTL layouts
- Icons with directional meaning (arrows, chevrons) must flip in RTL

## Button Labels

| Action | Label | Notes |
|--------|-------|-------|
| Create | "Create pulse", "New page" | IC-facing |
| Manage | "Manage members", "Configure SSO" | Admin-facing |
| Review | "View team health", "See blockers" | Lead-facing |
| Destructive | "Remove [name] from workspace" | Always name the thing and the scope |
| Confirm | "Save changes" | Not just "Save" |
| Cancel | "Discard changes" | In form contexts |

## Empty States by User Type

### IC Empty States
| Section | Message | CTA |
|---------|---------|-----|
| Feed | "Your feed is quiet. Share what you're working on." | "Create your first pulse" |
| Wiki | "No pages yet. Start building your team's knowledge base." | "Create a page" |

### Lead Empty States
| Section | Message | CTA |
|---------|---------|-----|
| Blockers | "No blockers. Your team is moving smoothly." | — |
| Decisions | "No decisions logged yet. Track important calls here." | "Log a decision" |
| Dashboard | "Welcome. Your team health dashboard will populate as your team starts using TeamPulse." | "Invite your team" |

### Admin Empty States
| Section | Message | CTA |
|---------|---------|-----|
| Members | "No members yet. Invite your team to get started." | "Invite members" |
| Integrations | "No integrations connected. Connect your tools to streamline workflows." | "Browse integrations" |
| Security | "Security settings are at their defaults. Review them to match your org's requirements." | "Review settings" |

## Error States

Structure: What happened → Reassurance (if data at risk) → Next step

| Scenario | Message |
|----------|---------|
| Network | "Couldn't connect to TeamPulse. Check your connection and try again." |
| Stale data | "Showing data from 5 minutes ago. Refreshing..." |
| Permission | "You need admin access for this. Contact your workspace admin." |
| Scale error | "Too many results to display. Use filters to narrow down." |
| SSO failure | "SSO authentication failed. Verify your provider configuration in Settings → Security." |

## Placeholder Content

**Names**: Alex Chen, Jordan Lee, Sam Williams, Priya Patel, Marcus Johnson, Aisha Okafor, James Wright, Elena Volkov
**Workspace**: Acme Engineering (200 members)
**Team spaces**: Product (24), Engineering (89), Design (18), Marketing (31), Leadership (8)
**Pulses**: "Shipped onboarding v2 — 34% faster completion", "Q2 roadmap review Thursday 2pm", "API v3 migration guide ready for review"
**Pages**: "Engineering onboarding", "Q2 product roadmap", "Incident response playbook", "Design system changelog"
**Metrics**: 142 active, 12 blockers, 2.4h avg response, 47 pulses/day
