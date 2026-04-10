# Tool Selection

Decision tree for choosing the right MCP tool for each operation.
Using the wrong tool is the #1 source of silent build failures.

## Creating content

| I need to... | Use this | NEVER this |
|---|---|---|
| Place a library component | `figma_instantiate_component` | `figma_execute` with `createComponent()` |
| Create a frame/container | `figma_execute` with `mkF()` helper | `figma_create_child` for complex layouts |
| Create text | `figma_execute` with `mkT()` helper | `figma_set_text` (that's for updating existing text) |
| Create simple shapes | `figma_create_child` | `figma_execute` for single rectangles |

## Modifying content

| I need to... | Use this | NEVER this |
|---|---|---|
| Set text on an instance | `figma_set_instance_properties` | `figma_execute` with tree walk (fails silently) |
| Toggle boolean props | `figma_set_instance_properties` | `figma_execute` |
| Set fill color | `figma_set_fills` or `bf()` in `figma_execute` | — |
| Set stroke | `figma_set_strokes` or `bs()` in `figma_execute` | — |
| Move a node | `figma_move_node` | `figma_execute` for simple moves |
| Resize a node | `figma_resize_node` | `figma_execute` for simple resizes |
| Rename a node | `figma_rename_node` | `figma_execute` |
| Delete a node | `figma_delete_node` | `figma_execute` |

## Reading content

| I need to... | Use this | Notes |
|---|---|---|
| Full design system | `figma_get_design_system_kit` | One call replaces 3-4 individual calls |
| Specific token values | `figma_get_token_values` | Faster than full kit for targeted lookups |
| Component search | `figma_search_components` | Supports cross-file library search via `libraryFileKey` |
| Component details | `figma_get_component_details` | For variant axes and properties |
| Deep component tree | `figma_get_component_for_development_deep` | Unlimited depth, resolved tokens, Desktop Bridge only |
| File structure | `figma_get_file_data` | Use `verbosity: "summary"` first |
| Current selection | `figma_get_selection` | For user-directed operations |
| Text styles | `figma_get_text_styles` | For typography token extraction |

## Screenshots

| I need to... | Use this | Notes |
|---|---|---|
| Validate after building | `figma_take_screenshot` | Pass `nodeId` of the root frame |
| Capture for analysis | `figma_capture_screenshot` | AI-optimized: 1x PNG, auto-caps at 1568px |

## CRITICAL: variantKey vs figmaKey

Components have TWO keys. Using the wrong one causes silent failures.

- **figmaKey** — identifies the COMPONENT SET (the parent). Used for reference only.
- **variantKey** (or `defaultVariantKey`) — identifies a SPECIFIC VARIANT.
  This is what `figma_instantiate_component` needs.

```
WRONG: figma_instantiate_component with componentKey: "8022:24550" (component set key)
RIGHT: figma_instantiate_component with componentKey: "8017:532994" (variant key)
```

Check `design-system/components/index.json` — use `defaultVariantKey`, not `figmaKey`.

## Property names may have emoji prefixes

Some design system libraries (e.g., Untitled UI) use emoji prefixes on component
property names:

| Property | Actual name in Figma |
|---|---|
| Icon leading (Button) | `⬅️ Icon leading` |
| Icon trailing (Button) | `➡️ Icon trailing` |
| Icon swap (Input field) | `🔀 Icon swap` |
| Required (Input field) | `↳ Required *` |

Using `"Icon leading": false` (without the emoji) fails silently — the property
is not found and no override is applied.

**When overrides fail**: check the error response from `figma_set_instance_properties`
— it lists all available property names including emoji prefixes. Standard boolean
properties like `Label`, `Hint text`, `Help icon` typically do NOT have emoji.

## When to use figma_execute

Reserve `figma_execute` for operations that CANNOT be decomposed:
- Multi-step frame creation with token bindings (mkF + mkT + bf + importTokens)
- Canvas scanning (canvasScan helper)
- Complex auto-layout configuration
- Batch operations on multiple nodes in sequence

**Timeout guidance:**
- Simple operations: 5s (default)
- Component instantiation + property setting: 10s
- Full section build (5-15 elements): 15-20s
- Never exceed 25s — split into multiple calls instead
