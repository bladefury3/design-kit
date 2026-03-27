# Design Kit

Design system documentation skills for Claude Code. Works with Figma Console MCP to
extract, audit, and optimize design systems.

## Commands

```bash
./setup              # Install skills to ~/.claude/commands/
./setup --local      # Install to .claude/commands/ in current project
```

## Project Structure

```
design-kit/
├── extract-tokens/          # Skill: extract design tokens → tokens.json
├── extract-components/      # Skill: extract component specs → components/index.json + on-demand JSONs
├── extract-relationships/   # Skill: map component relationships → relationships.json
├── plan-design/             # Skill: plan a design → plan.json (spec, no Figma changes)
├── build-design/            # Skill: execute plan.json → Figma frames + library components
├── audit-frames/            # Skill: audit frames against design system
├── handoff-dev/             # Skill: developer handoff documentation
├── handoff-mcp/             # Skill: optimize Figma file for MCP consumption
├── setup                    # Installation script
├── CLAUDE.md                # This file
├── ETHOS.md                 # Design philosophy
└── VERSION                  # Current version
```

## Skill format

Each skill is a directory containing a `SKILL.md` file. Skills are registered with
Claude Code via the setup script and invoked as slash commands (e.g., `/extract-tokens`).

### Writing skills

- Use designer-friendly language — not engineering jargon
- Skills interact with Figma via `figma-console` MCP tools
- Always validate with screenshots after making changes
- Output structured JSON following W3C Design Tokens format where applicable
- Ask the user before making assumptions about their design system

## Figma MCP interaction

Skills use these MCP tool groups:
- **Variables**: `figma_get_variables`, `figma_get_token_values`, `figma_browse_tokens`
- **Components**: `figma_get_component`, `figma_search_components`, `figma_get_library_components`
- **Styles**: `figma_get_styles`
- **Design system**: `figma_get_design_system_summary`, `figma_get_design_system_kit`
- **File data**: `figma_get_file_data`, `figma_get_selection`
- **Screenshots**: `figma_take_screenshot`, `figma_capture_screenshot`

## Output formats

### tokens.json
Follows [W3C Design Tokens](https://design-tokens.github.io/community-group/format/) format:
```json
{
  "color": {
    "primary": {
      "$value": "#6366f1",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

### Component JSON
Per-component spec files in `components/` directory:
```json
{
  "$schema": "design-kit/component/v1",
  "name": "Button",
  "tokens": ["color.primary", "spacing.md"],
  "variants": [...],
  "props": [...]
}
```

### relationships.json
Component dependency graph:
```json
{
  "$schema": "design-kit/relationships/v1",
  "components": {
    "Card": {
      "contains": ["Button", "Avatar", "Text"],
      "usedIn": ["Feed", "Profile"]
    }
  }
}
```

## Commit style

One logical change per commit. Separate renames from behavior changes.
