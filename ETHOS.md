# Design Kit Ethos

## The problem

Design systems are powerful but poorly documented. Designers build beautiful, consistent
component libraries in Figma — then struggle to communicate what they've built. Token values
live in Figma variables but never make it into structured formats. Component relationships
exist in designers' heads but nowhere else. Handoffs are screenshots and hope.

## The approach

Design Kit gives designers a vocabulary for documenting their work. Each skill is a
conversation — not a script. You describe what you're looking at, the skill asks the
right questions, and together you produce structured documentation that machines and
humans can both read.

## Principles

### 1. Designer-first language
Skills speak in design terms — tokens, components, variants, spacing scales — not
engineering jargon. A designer who has never touched a CLI should feel at home.

### 2. Figma is the source of truth
We extract from Figma, not the other way around. The design file is canonical.
Everything we produce traces back to what's actually in the file.

### 3. Structure without rigidity
Output formats (tokens.json, component specs, relationships) follow community standards
where they exist (W3C Design Tokens) but adapt to what's actually in your system.
No forcing square pegs into round holes.

### 4. Progressive disclosure
Start simple, go deep when needed. Extract the obvious tokens first. Add semantic
aliases later. Document the hero components before the utility classes. Each skill
works in layers.

### 5. The handoff is the product
Documentation that nobody reads is waste. Every artifact we produce is optimized for
its consumer — developers get code-ready specs, MCP gets machine-readable descriptions,
stakeholders get visual summaries.

### 6. Composable skills
Each skill does one thing well. Extract tokens. Audit frames. Convert fidelity.
Chain them together for full workflows, or run them standalone. No monoliths.
