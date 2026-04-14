# Error Recovery

Standard error handling patterns for all skills that interact with Figma.

## Connection errors

**Symptom**: Any MCP tool returns "Failed to execute" or "Desktop Bridge not connected"

**Recovery**:
1. Check connection: `figma_get_status` with `probe: true`
2. If disconnected, tell the user:
   > "Figma connection lost. Please check that the Desktop Bridge plugin is
   > running in Figma Desktop, then tell me to try again."
3. Do NOT retry blindly — wait for user confirmation

## Token binding failures

**Symptom**: `setBoundVariable` throws or token key is not found

**Diagnosis**:
1. Is the `figmaKey` a 40-char hex hash? Path-style keys (`color/primary`) fail silently.
2. Is the token library enabled in the Figma file?
3. Is the key from a stale `design-system/tokens.json`? Keys change when tokens are recreated.

**Recovery**:
1. Re-search: `figma_get_variables` with the token name to get the current key
2. If found, use the new key
3. If not found, fall back to hardcoded value AND flag it:
   > "Token `color.bg.info` binding failed — used hardcoded value `#EFF6FF` instead.
   > Check the figmaKey in design-system/tokens.json or re-run `/setup-tokens`."

**Never silently use hardcoded values.** Always flag them in the build output.

## Component instantiation failures

**Symptom**: `figma_instantiate_component` returns error

**Diagnosis**:
1. Is the key a `variantKey` (individual variant) or a `figmaKey` (component set)?
   `figma_instantiate_component` requires the VARIANT key.
2. Is the library accessible? (Desktop Bridge must be running)
3. Is the key from a stale `design-system/components/index.json`?

**Recovery**:
1. Search by name: `figma_search_components` with the component name
2. Present candidates: "Couldn't find Button by key. Found these alternatives: [list]. Which one?"
3. Only fall back to placeholder frame if search returns nothing AND user confirms
4. Label placeholder: `[Missing: Component Name]` — never silently skip

## figma_instantiate_component timeouts

**Symptom**: `figma_instantiate_component` hangs for 10-15 seconds, then returns a timeout error

**This is DIFFERENT from "not found".** A timeout means the component library is
unresponsive (network, plugin, or library size). A "not found" error returns
immediately and means the key is wrong.

**Recovery**:
1. **Do NOT retry.** Every retry will also timeout, wasting 15s + context each time.
2. Switch to **token-built-only mode** for ALL remaining library components in this session.
3. Build equivalent elements using `figma_execute` with `mkF()` and `mkT()` helpers,
   binding all values to tokens from `design-system/tokens.json`.
4. Log every substitution in workflow-log.md:
   > "Component probe timed out. Switched to token-built-only mode.
   > [N] components built from tokens instead of library."
5. Note in the build output: "Library import unavailable — all elements token-built."

**The probe pattern**: Before building N components, test ONE small component first
(a Divider, Badge, or Icon). If the probe times out, skip all library imports. If it
succeeds, proceed normally. One test, one decision for the entire build.

## figma_execute timeouts

**Symptom**: "timed out after Nms"

**Recovery**:
1. Split the operation into smaller calls (max 10-15 elements per call)
2. Increase timeout if the operation is genuinely complex (up to 25s)
3. Never exceed 25s — the Figma plugin sandbox has a hard 30s limit

## Screenshot failures

**Symptom**: `figma_take_screenshot` returns empty or error

**Recovery**:
1. Check that the `nodeId` exists and is visible
2. Try `figma_capture_screenshot` as alternative (uses Desktop Bridge)
3. If both fail, continue building and screenshot at the end

## Property override failures

**Symptom**: `figma_set_instance_properties` has no effect

**Diagnosis**:
Property names are case-sensitive and must match exactly. Common mismatches:
- `"Label"` vs `"Label text"` — check the component's actual property names
- `"Icon leading"` vs `"⬅️ Icon leading"` — some libraries use emoji prefixes
  on property names (e.g., `⬅️`, `➡️`, `🔀`, `↳`). Missing the emoji = silent failure.
- Properties have `#nodeId` suffixes (e.g., `"Label text#3463:567"`) —
  `figma_set_instance_properties` handles this automatically, but the base
  name must match

**Recovery**:
1. Check the error response from `figma_set_instance_properties` — it lists
   all available property names including emoji prefixes
2. Retry with the exact property names from the error response
3. If property doesn't exist, it may be a variant axis (not a boolean prop)

## General retry strategy

1. **First failure**: Diagnose — read the error, check assumptions
2. **After diagnosis**: Fix the root cause and retry once
3. **Second failure**: Ask the user — don't loop
4. **Never retry identical calls** — if it failed, something is wrong
