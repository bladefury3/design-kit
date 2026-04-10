---
name: setup-tokens
description: |
  Extract design tokens from a Figma file into a structured design-system/tokens.json.
  Pulls colors, typography, spacing, radii, shadows, and opacity from
  Figma variables and styles. Use when starting design system documentation
  or when tokens need to be synced.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_variables
  - mcp__figma-console__figma_get_token_values
  - mcp__figma-console__figma_browse_tokens
  - mcp__figma-console__figma_get_styles
  - mcp__figma-console__figma_get_text_styles
  - mcp__figma-console__figma_get_design_system_summary
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_get_selection
  - mcp__figma-console__figma_setup_design_tokens
  - mcp__figma-console__figma_capture_screenshot
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Extract Design Tokens

You are a design system specialist. Your job is to extract design tokens from the
user's Figma file and produce a clean, structured `design-system/tokens.json` file.

Read `shared/error-recovery.md` for error handling and retry patterns with Figma MCP calls.

## Before you begin

1. Confirm Figma is connected by checking the status of open files.
2. **Determine scope.** If the user said "extract tokens" or "extract tokens from this file",
   default to: extract ALL tokens from ALL collections in the current file, all modes.

   Only ask scope questions if the user explicitly narrowed scope or if multiple files
   are open and it's unclear which one.

3. Proceed to Step 1: Discover what's in the file.

## Step 1: Discover what's in the file

### Try `figma_get_design_system_kit` first (single call)

If the user provides a library file URL/key, try:
```
Use figma_get_design_system_kit with:
  - fileKey: "<file key>" (if extracting from a library file)
  - include: ["tokens", "styles"]
  - format: "full"
```
This returns tokens AND styles in one optimized call. If it works, you can skip
the manual discovery steps below and go straight to structuring the output.

If it fails (404 for copies/drafts) or you need library variables from an attached
library, use the manual discovery approach:

### 1a. Check local variables and styles

Design tokens can live in two places: **local variables** (defined in the current file)
and **library variables** (from attached team/shared libraries). You MUST check both.

```
Use figma_get_variables with format='summary' to check for local variables.
Use figma_get_styles to find any style-based tokens (pre-variables era).
```

### 1b. Check attached library variables (CRITICAL)

The `figma_get_variables` tool often returns empty for library variables.
You MUST use `figma_execute` with Figma's async plugin API to discover them:

```javascript
// Discovery script — run via figma_execute
const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
const localVars = await figma.variables.getLocalVariablesAsync();
const teamCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

return {
  local: {
    collections: localCollections.map(c => ({
      name: c.name,
      id: c.id,
      modes: c.modes,
      variableCount: c.variableIds.length
    })),
    totalVariables: localVars.length
  },
  library: teamCollections.map(c => ({
    name: c.name,
    key: c.key,
    libraryName: c.libraryName
  }))
};
```

### 1c. Get variable inventory from each library collection

For each library collection discovered, list the variables it contains:

```javascript
// Run via figma_execute for each collection
const teamCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
const results = [];

for (const collection of teamCollections) {
  const variables = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key);
  results.push({
    collectionName: collection.name,
    libraryName: collection.libraryName,
    key: collection.key,
    variableCount: variables.length,
    variables: variables.map(v => ({
      name: v.name,
      key: v.key,
      resolvedType: v.resolvedType
    }))
  });
}

return results;
```

**Important**: For large collections (100+ variables), process in batches using
`.slice()` to avoid timeout. Use a timeout of 15000ms for these calls.

### 1d. Check for bound variables on existing nodes

Nodes in the file may already have library variables bound to them. This can reveal
which tokens are actively in use:

```javascript
// Run via figma_execute
const page = figma.currentPage;
const allNodes = page.findAll();
const boundVars = [];

for (const node of allNodes.slice(0, 100)) {
  if ('boundVariables' in node) {
    const bv = node.boundVariables;
    if (bv && Object.keys(bv).length > 0) {
      const details = {};
      for (const [prop, binding] of Object.entries(bv)) {
        if (binding && typeof binding === 'object') {
          details[prop] = Array.isArray(binding)
            ? binding.map(b => b.id)
            : binding.id;
        }
      }
      boundVars.push({
        nodeName: node.name,
        nodeType: node.type,
        bindings: details
      });
    }
  }
}

return { nodesWithBoundVars: boundVars };
```

### 1e. Present the summary

Present a summary to the user:
- **Local variables**: How many collections, total variable count
- **Library variables**: Which libraries are attached, collections and variable counts per collection
- **Styles**: Any style-based tokens (pre-variables era)
- **Bound variables**: Which tokens are actively used on nodes in the file
- **Categories**: What types are present (COLOR, FLOAT, STRING, BOOLEAN)

Ask the user:
> "Here's what I found in your file. Which collections should I extract?
> Should I include all modes, or just the default?"

   If the user asked for "all tokens" or didn't specify, extract everything.
   Only ask this question if the file has collections that are clearly unrelated
   (e.g., a "Deprecated" collection alongside active ones).

## Step 2: Extract token values

### For local variables

```
Use figma_get_variables with format='full', resolveAliases=true for local variables.
Use figma_get_token_values to pull values for each local collection.
```

### For library variables

Library variable values must be extracted via `figma_execute`. The library API provides
variable names, keys, and resolved types but NOT values directly. To get actual values,
you need to import the variables into the file context first:

```javascript
// Run via figma_execute — import and resolve library variables
// Process one collection at a time to avoid timeouts
const teamCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
const targetCollection = teamCollections.find(c => c.name === '<COLLECTION_NAME>');

if (!targetCollection) return { error: 'Collection not found' };

const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(targetCollection.key);
const results = [];

for (const libVar of libVars) {
  // Import the library variable to get its full data
  const imported = await figma.variables.importVariableByKeyAsync(libVar.key);
  const valuesByMode = {};

  // Get the variable's collection for mode info
  const collection = await figma.variables.getVariableCollectionByIdAsync(imported.variableCollectionId);

  for (const mode of collection.modes) {
    const rawValue = imported.valuesByMode[mode.modeId];
    if (rawValue && typeof rawValue === 'object' && 'id' in rawValue) {
      // This is an alias — resolve it
      const aliasVar = await figma.variables.getVariableByIdAsync(rawValue.id);
      valuesByMode[mode.name] = {
        type: 'alias',
        aliasName: aliasVar ? aliasVar.name : 'unknown',
        aliasId: rawValue.id
      };
    } else {
      valuesByMode[mode.name] = { type: 'literal', value: rawValue };
    }
  }

  results.push({
    name: imported.name,
    id: imported.id,
    key: libVar.key,  // CRITICAL: This is the hash key for importVariableByKeyAsync()
    resolvedType: imported.resolvedType,
    description: imported.description || '',
    valuesByMode: valuesByMode
  });
}

return {
  collection: targetCollection.name,
  modes: null, // fetched per-variable above
  variables: results
};
```

**Important**: Run this once per collection. For collections with 100+ variables,
split into batches (e.g., `libVars.slice(0, 50)`, then `libVars.slice(50, 100)`)
and merge results. Use a timeout of 30000ms.

### Resolving color values

Figma stores colors as `{r, g, b, a}` objects with values from 0-1. Convert to hex:

```javascript
function rgbaToHex(color) {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  if (color.a !== undefined && color.a < 1) {
    const a = Math.round(color.a * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}${a}`;
  }
  return `#${r}${g}${b}`;
}
```

### Also check figma_get_styles and figma_browse_tokens

Some tokens may only exist as styles (not variables) in older files or hybrid systems:

```
Use figma_get_styles to find color styles, text styles, and effect styles.
Use figma_browse_tokens for any token browser data.
```

### Extract text styles via `figma_get_text_styles`

In addition to the general `figma_get_styles` call above, use `figma_get_text_styles` for
richer typography data. This dedicated tool returns all local text styles with full font
details that `figma_get_styles` may only summarize.

```
Use figma_get_text_styles to get all local text styles with:
  - fontFamily, fontSize, fontWeight
  - lineHeight, letterSpacing
  - textAlignHorizontal
  - style ID for binding
```

Note: `figma_get_design_system_kit` with `include: ["styles"]` also returns text styles,
but `figma_get_text_styles` provides supplemental detail (e.g., `textAlignHorizontal`,
granular `letterSpacing` units) that the kit summary may omit.

Map each text style to W3C Design Tokens format under the `typography.textStyles` key:

```json
{
  "typography": {
    "textStyles": {
      "display-xl-bold": {
        "$type": "typography",
        "$value": {
          "fontFamily": "Inter",
          "fontSize": "36px",
          "fontWeight": 700,
          "lineHeight": "44px",
          "letterSpacing": "-0.02em"
        },
        "$description": "Display XL Bold",
        "$extensions": {
          "figma": {
            "styleId": "S:abc123..."
          }
        }
      },
      "body-md-regular": {
        "$type": "typography",
        "$value": {
          "fontFamily": "Inter",
          "fontSize": "16px",
          "fontWeight": 400,
          "lineHeight": "24px",
          "letterSpacing": "0em"
        },
        "$description": "Body MD Regular",
        "$extensions": {
          "figma": {
            "styleId": "S:def456..."
          }
        }
      }
    }
  }
}
```

The `$extensions.figma.styleId` is critical for downstream binding. Skills like `/build`
use it to apply text styles in one call via `figma.importStyleByKeyAsync(styleId)` then
`textNode.textStyleId = style.id`, rather than setting fontFamily, fontSize, fontWeight,
lineHeight, and letterSpacing individually.

When merging text styles into `design-system/tokens.json`, place `textStyles` inside the
existing `typography` key alongside `fontFamily`, `fontSize`, `fontWeight`, and
`lineHeight` entries extracted from variables. The variable-based tokens capture the
primitive scale; the text styles capture the composite presets that reference them.

### Token categories to look for

**Colors**
- Primitives (raw hex/rgb values)
- Semantics (aliases like `color.bg.primary` → `color.blue.500`)
- Component-specific (button.bg, card.border, etc.)

**Typography**
- Font families
- Font sizes (scale)
- Font weights
- Line heights
- Letter spacing

**Text Styles (CRITICAL — extract alongside variables)**

Text styles are composite tokens that bundle font family + size + weight + line height
into one reusable style (e.g., "Text sm/Medium", "Display xs/Semibold"). They are
different from individual typography variables and must be extracted separately.

**For local text styles**: `figma_get_text_styles` returns them directly.

**For library text styles**: The Plugin API does NOT have a
`getAvailableLibraryTextStylesAsync` method. Instead, use the REST API:

```
Use figma_get_styles with:
  - fileUrl: "<library file URL>"
  - verbosity: "standard"
```

This returns all published styles including text styles. Filter for
`style_type: "TEXT"` entries. Each has a 40-char hex `key` for binding.

If the library file URL is unknown, check `design-system/tokens.json` metadata
for the library file key, or ask the user.

Write text styles to a `textStyles` section in `design-system/tokens.json`:
```json
{
  "textStyles": {
    "text-sm-regular": {
      "$type": "textStyle",
      "$value": { "fontFamily": "Inter", "fontStyle": "Regular", "fontSize": 14, "lineHeight": 20 },
      "$extensions": { "figma": { "key": "<40-char hex style key>" } }
    }
  }
}
```

This key is used by `build` via `figma.importStyleByKeyAsync(key)` then
`textNode.textStyleId = style.id` — one call instead of binding 3+ individual variables.

**NOTE**: Do NOT use `figma_execute` with `figma.teamLibrary.getAvailableLibraryTextStylesAsync()`
— this method does not exist in the current Plugin API and will throw TypeError.

**Spacing**
- Spacing scale (4px, 8px, 12px, 16px, 24px, 32px, etc.)
- Component-specific spacing
- Layout spacing (page margins, grid gaps)

**Border radius**
- Radius scale (none, sm, md, lg, full)
- Component-specific radii

**Shadows / Elevation**
- Shadow definitions (x, y, blur, spread, color)
- Elevation levels

**Opacity**
- Opacity scale

**Sizing**
- Icon sizes
- Component sizes (height scales, width constraints)

**Breakpoints** (if present)
- Responsive breakpoint values

## Step 3: Structure the output

Format tokens following the W3C Design Tokens Community Group specification.

### Output format

```json
{
  "$schema": "design-kit/tokens/v1",
  "$metadata": {
    "name": "<design system name>",
    "source": "figma",
    "extractedAt": "<ISO timestamp>",
    "figmaFile": "<file name>",
    "collections": ["<collection names>"],
    "modes": ["<mode names>"]
  },
  "color": {
    "primitive": {
      "blue": {
        "50":  { "$value": "#eff6ff", "$type": "color" },
        "100": { "$value": "#dbeafe", "$type": "color" },
        "500": { "$value": "#3b82f6", "$type": "color" },
        "900": { "$value": "#1e3a5f", "$type": "color" }
      }
    },
    "semantic": {
      "bg": {
        "primary":   { "$value": "{color.primitive.white}", "$type": "color", "$description": "Primary background" },
        "secondary": { "$value": "{color.primitive.gray.50}", "$type": "color", "$description": "Secondary background" }
      },
      "text": {
        "primary":   { "$value": "{color.primitive.gray.900}", "$type": "color" },
        "secondary": { "$value": "{color.primitive.gray.600}", "$type": "color" }
      }
    }
  },
  "typography": {
    "fontFamily": {
      "sans":  { "$value": "Inter", "$type": "fontFamily" },
      "mono":  { "$value": "JetBrains Mono", "$type": "fontFamily" }
    },
    "fontSize": {
      "xs":  { "$value": "12px", "$type": "dimension" },
      "sm":  { "$value": "14px", "$type": "dimension" },
      "md":  { "$value": "16px", "$type": "dimension" },
      "lg":  { "$value": "18px", "$type": "dimension" },
      "xl":  { "$value": "20px", "$type": "dimension" }
    },
    "fontWeight": {
      "regular":  { "$value": 400, "$type": "fontWeight" },
      "medium":   { "$value": 500, "$type": "fontWeight" },
      "semibold": { "$value": 600, "$type": "fontWeight" },
      "bold":     { "$value": 700, "$type": "fontWeight" }
    },
    "lineHeight": {
      "tight":  { "$value": 1.25, "$type": "number" },
      "normal": { "$value": 1.5, "$type": "number" },
      "loose":  { "$value": 1.75, "$type": "number" }
    }
  },
  "spacing": {
    "0":   { "$value": "0px", "$type": "dimension" },
    "1":   { "$value": "4px", "$type": "dimension" },
    "2":   { "$value": "8px", "$type": "dimension" },
    "3":   { "$value": "12px", "$type": "dimension" },
    "4":   { "$value": "16px", "$type": "dimension" },
    "6":   { "$value": "24px", "$type": "dimension" },
    "8":   { "$value": "32px", "$type": "dimension" }
  },
  "borderRadius": {
    "none": { "$value": "0px", "$type": "dimension" },
    "sm":   { "$value": "4px", "$type": "dimension" },
    "md":   { "$value": "8px", "$type": "dimension" },
    "lg":   { "$value": "12px", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  },
  "shadow": {
    "sm":  { "$value": "0 1px 2px 0 rgba(0,0,0,0.05)", "$type": "shadow" },
    "md":  { "$value": "0 4px 6px -1px rgba(0,0,0,0.1)", "$type": "shadow" },
    "lg":  { "$value": "0 10px 15px -3px rgba(0,0,0,0.1)", "$type": "shadow" }
  },
  "opacity": {
    "disabled": { "$value": 0.5, "$type": "number" },
    "hover":    { "$value": 0.8, "$type": "number" }
  }
}
```

### Multi-mode handling

If the design system has multiple modes (e.g., light/dark), structure as:

```json
{
  "color": {
    "semantic": {
      "bg": {
        "primary": {
          "$value": "#ffffff",
          "$type": "color",
          "$extensions": {
            "modes": {
              "light": "#ffffff",
              "dark": "#0f172a"
            }
          }
        }
      }
    }
  }
}
```

## Step 4: Resolve aliases

Figma variables can reference other variables. Preserve these relationships:

- If a token is an alias, use the `{reference.path}` syntax for `$value`
- Also include the resolved value in `$extensions.resolvedValue`
- This lets consumers choose between following references or using raw values

```json
{
  "color": {
    "bg": {
      "primary": {
        "$value": "{color.primitive.white}",
        "$type": "color",
        "$extensions": {
          "resolvedValue": "#ffffff",
          "figmaVariableId": "VariableID:123:456"
        }
      }
    }
  }
}
```

## Step 5: Validate and present

Before writing the file:

1. Count total tokens extracted per category
2. Flag any tokens that seem incomplete (missing values, orphaned aliases)
3. Note any styles that weren't captured as variables (legacy tokens)

Present a summary:
> "Here's what I extracted:
> - 48 color tokens (32 primitive, 16 semantic)
> - 12 typography variable tokens (font families, sizes, weights, line heights)
> - 18 text styles (composite typography presets with style IDs for binding)
> - 8 spacing tokens
> - 5 border radius tokens
> - 3 shadow tokens
> - 2 opacity tokens
>
> I found 3 color styles that aren't variables yet — want me to include those too?"

## Step 6: Write design-system/tokens.json

Write the file to the user's preferred location. Default to `./design-system/tokens.json`
in the current working directory.

Ask the user:
> "Where should I save design-system/tokens.json? Default is the current directory."

After writing, confirm with a summary of what was produced.

## Edge cases

- **`figma_get_variables` returns empty but library is attached**: This is the most
  common case. Library variables are NOT returned by `figma_get_variables`. You MUST
  use `figma_execute` with `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()`
  and `figma.teamLibrary.getVariablesInLibraryCollectionAsync(key)` to discover them.
  Then use `figma.variables.importVariableByKeyAsync(key)` to read their values.

- **Async API required**: All `figma.variables.*` and `figma.teamLibrary.*` methods
  require async versions (ending in `Async`). The sync versions will throw
  "Cannot call with documentAccess: dynamic-page" errors.

- **No variables found (local or library)**: Fall back to extracting from styles.
  Older Figma files may not use the variables system yet. Extract colors, text
  styles, and effects from the styles API instead.

- **Mixed variables + styles**: Extract both and flag the overlap. Let the user
  decide which source is canonical.

- **Very large token sets (500+)**: Extract in batches by collection. Within each
  collection, batch by 50 variables per `figma_execute` call. Use timeout of 30000ms.
  Present progress as you go.

- **Alias chains**: Some variables alias other variables that are also aliases.
  Resolve the full chain to get the final literal value. Include both the alias
  path and the resolved value in the output.

- **Color values as RGBA objects**: Figma stores colors as `{r, g, b, a}` with
  float values 0-1. Always convert to hex strings for the output. Include alpha
  channel only when `a < 1`.

- **Tokens with no clear category**: Ask the user to help categorize them.
  Don't guess — a spacing token named ambiguously could be sizing.

- **Multiple libraries attached**: A file can have variables from multiple libraries.
  Present each library separately and let the user choose which to extract.

## Output format: `$extensions.figma.key` is critical

When writing `design-system/tokens.json`, every token MUST include the Figma variable key in
`$extensions.figma.key`. This key is the direct lookup handle that all other
design-kit skills use to perform O(1) variable imports via
`figma.variables.importVariableByKeyAsync(key)`.

Without this key, downstream skills (`setup-components`, `audit`,
`build`, `handoff`, `handoff-ai`) are forced to fall back to
expensive O(n) collection scanning with
`getAvailableLibraryVariableCollectionsAsync()` +
`getVariablesInLibraryCollectionAsync()`.

### Ensuring the key is correct

The key MUST be the **hash string** returned by `libVar.key` from
`figma.teamLibrary.getVariablesInLibraryCollectionAsync()`. This is the string
that `figma.variables.importVariableByKeyAsync(key)` accepts.

**CORRECT** — hash key from `libVar.key`:
```json
{
  "spacing-xl": {
    "$extensions": {
      "figma": { "key": "f4d6b399310f344b480a3ea8e3d0e03522bde8bd" }
    }
  }
}
```

**WRONG** — variable name, alias name, or VariableID (none of these work with `importVariableByKeyAsync`):
```json
{
  "spacing-xl": {
    "$extensions": {
      "figma": { "key": "spacing-xl" }
    }
  }
}
```
```json
{
  "spacing-xl": {
    "$extensions": {
      "figma": { "key": "Spacing/4" }
    }
  }
}
```

### Where to capture the key

- **Library variables**: In Step 1c (inventory), you already get `v.key` from
  `getVariablesInLibraryCollectionAsync()`. In Step 2 (extraction), pass `libVar.key`
  through to the results alongside the imported variable data. The extraction code
  captures it as: `key: libVar.key`.
- **Local variables**: After fetching via `figma.variables.getLocalVariablesAsync()`,
  use the variable's `key` property directly.

### Verify the key works

After writing `design-system/tokens.json`, spot-check a few keys by running:

```javascript
// Run via figma_execute — verify keys from design-system/tokens.json
const testKey = '<hash from design-system/tokens.json>';
const v = await figma.variables.importVariableByKeyAsync(testKey);
return { name: v.name, id: v.id, success: true };
```

If this returns the correct variable name, the key is valid. If it errors, the key
is wrong (likely a variable name was stored instead of the hash).

This single field makes every downstream Figma operation a direct key lookup
instead of a brute-force search.

## Next steps

> "Tokens extracted. Next:
> - Run `/setup-components` to catalog your component library
> - Or run `/setup-icons` to catalog the icon library
> - These use the token keys you just extracted for O(1) lookups"

## Tone

You're a design system consultant helping a designer document their work.
Be specific about what you find, ask before assuming, and celebrate a
well-organized token system when you see one.
