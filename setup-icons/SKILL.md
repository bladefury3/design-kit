---
name: setup-icons
description: |
  Extract and catalog icons from a Figma library into design-system/icons.json.
  Maps icon names to component keys, groups by category, and adds search tags.
  Makes icons instantly resolvable in plan, plan-component, and build skills.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_get_component
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_get_component_image
  - mcp__figma-console__figma_get_design_system_kit
  - mcp__figma-console__figma_get_design_system_summary
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_navigate
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Extract Icons

You are a design system librarian cataloging the icon collection. Your job is to
build a searchable index of every icon in the library so that planning and building
skills can resolve icon names to Figma component keys instantly — no searching at
build time.

## Why this matters

When `/plan` says "use a search icon," it needs to resolve "search" into
`{ name: "search-md", key: "abc123..." }` immediately. Without an icon index,
every plan and build has to search Figma at runtime, which is slow and unreliable.
This skill runs once and every other skill benefits.

Icons are the most-referenced, least-documented part of a design system. A typical
library has 200-1000+ icons across dozens of categories. Without a catalog, build
skills waste MCP calls searching for "arrow" and hoping the first result is the
right one. With this catalog, every icon resolves in O(1) — a dictionary lookup
by name or tag.

Read `shared/design-system-loading.md` for the 3-tier fallback when loading tokens and components.
Read `shared/error-recovery.md` for error handling and retry patterns with Figma MCP calls.

## Before you begin

1. **Confirm Figma is connected** by calling `figma_list_open_files`. If no files
   are open, ask the user to open their design file in Figma and ensure the
   Desktop Bridge plugin is running.

2. **Check if `design-system/icons.json` already exists** in the working directory.
   If yes, read it and present the current state:

   > "You already have an icon catalog with **[N] icons** across **[N] categories**,
   > last extracted on [date].
   >
   > A) **Re-extract** — Start fresh, replacing the existing catalog
   > B) **Update** — Keep existing entries, add any new icons found
   > C) **Cancel** — Keep what you have"

   RECOMMENDATION: Choose B if the existing catalog is recent (< 2 weeks old).
   Choose A if the library has changed significantly or the catalog is old.

3. **Check `design-system/components/index.json`** — this tells us the library file
   key and may already have some icon components listed. If it exists, load it and
   extract the `libraryFileKey` to avoid asking the user for it again.

4. **Ask the user where icons live:**

   > "I'm ready to catalog your icon library. First I need to know where your icons are.
   >
   > RECOMMENDATION: Choose A — most design systems keep icons in the same library as components.
   >
   > A) **Same library as my components** (most common) — I'll use the library file I already know about
   > B) **A separate icon library** — I'll need the Figma file URL
   > C) **Not sure** — I'll search the current file and attached libraries for icons"

   If the user chooses B, ask for the library URL. If C, run a broad discovery
   across all accessible files.

## Step 1: Discover icons

Icons in Figma design systems are typically:
- Individual components (not component sets — most icons don't have variants)
- Named with patterns like `icon-name`, `icon/name`, or `category/icon-name`
- Small (16-24px), single-color, and designed for instance swap slots

### Discovery strategies (in priority order)

#### Strategy 1: `figma_get_design_system_kit` (best — single call)

If you have a library file key (from `components/index.json` or user-provided URL):

```
Use figma_get_design_system_kit with:
  - fileKey: "<library file key>"
  - format: "compact"
  - include: ["components"]
```

This returns all components in one call. Filter the results for icons using the
identification rules below.

#### Strategy 2: `figma_get_library_components` (good — with pagination)

**CRITICAL: This API has a max of 25 results per call. You MUST paginate.**

```
# Page 1
Use figma_get_library_components with:
  - libraryFileKey: "<key>"
  - limit: 25
  - offset: 0

# Page 2
Use figma_get_library_components with:
  - libraryFileKey: "<key>"
  - limit: 25
  - offset: 25

# Continue until hasMore is false
```

Filter each page for icon-sized, single-purpose components.
**Do NOT stop after the first page.** Continue until `hasMore: false`.

#### Strategy 3: `figma_search_components` (targeted — for specific queries)

**CRITICAL: Max 25 results per call. Paginate AND run multiple queries.**

Use systematic category searches to find ALL icons. Run EACH of these queries
with pagination (offset 0, 25, 50... until hasMore is false):

```
Mandatory search queries (run ALL of these):
  "arrow"    "chevron"   "check"    "close"     "x-"
  "search"   "plus"      "minus"    "star"      "heart"
  "home"     "settings"  "user"     "users"     "mail"
  "bell"     "calendar"  "clock"    "lock"      "eye"
  "edit"     "trash"     "copy"     "download"  "upload"
  "share"    "filter"    "menu"     "grid"      "list"
  "map"      "phone"     "link"     "file"      "folder"
  "bookmark" "flag"      "alert"    "info"      "help"
  "send"     "repeat"    "refresh"  "play"      "pause"
  "log"      "globe"     "credit"   "bar-chart" "pie-chart"
  "message"  "image"     "camera"   "mic"       "video"
  "cloud"    "database"  "server"   "code"      "terminal"
  "gift"     "tag"       "hash"     "at-sign"   "zap"
```

This systematic search ensures no common icon category is missed. Deduplicate
results by component key — the same icon may match multiple queries.

**After all queries complete, report:**
> "Searched [N] query categories. Found [M] unique icons. [P] from previous run were already in catalog."

#### Strategy 4: `figma_execute` local discovery (current file only)

When icons are in the current file or you need to navigate to the library file:

```javascript
// Run via figma_execute — discover all icon-like components
const allComponents = figma.root.findAll(n =>
  n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
);

// Filter for icon-like components
const icons = allComponents.filter(c => {
  const name = c.name.toLowerCase();
  const w = c.width;
  const h = c.height;
  const isSmall = w <= 32 && h <= 32;
  const hasIconKeyword = /icon|arrow|chevron|check|close|search|plus|minus|star|heart|home|settings|user|mail|bell|calendar|clock|lock|eye|edit|trash|copy|download|upload|share|filter|menu|x-|grid|list/.test(name);
  const isInIconPage = c.parent?.parent?.name?.toLowerCase().includes('icon') ||
                       c.parent?.name?.toLowerCase().includes('icon');
  return isSmall || hasIconKeyword || isInIconPage;
});

return icons.map(c => ({
  name: c.name,
  type: c.type,
  id: c.id,
  key: c.key,
  width: c.width,
  height: c.height,
  parentPage: c.parent?.parent?.name || c.parent?.name || 'unknown',
  description: c.description || '',
  ...(c.type === 'COMPONENT_SET' ? {
    variants: c.children.map(v => ({
      name: v.name,
      id: v.id,
      key: v.key,
      properties: Object.fromEntries(
        v.name.split(', ').map(p => p.split('='))
      )
    }))
  } : {})
}));
```

#### Strategy 5: Navigate to library file (when REST API is blocked)

If the library is a copy/draft and REST returns 404:

> "The icon library isn't accessible via API (it may be a copy or unpublished).
> Could you open the library file in Figma and run the Desktop Bridge plugin?
> I'll switch to it, discover all icons, then switch back."

```
Use figma_navigate to switch to the library file URL.
Run figma_execute discovery (Strategy 4) inside the library file.
Use figma_navigate to switch back.
```

#### Strategy 6: Reverse-discover from instances (last resort)

If the user can't open the library file, discover icon keys from instances already
placed on the canvas:

```javascript
// Run via figma_execute — discover icon keys from placed instances
const instances = figma.currentPage.findAll(n => n.type === 'INSTANCE');
const discovered = {};

for (const inst of instances) {
  const main = await inst.getMainComponentAsync();
  if (!main) continue;

  const w = main.width;
  const h = main.height;
  const name = main.name.toLowerCase();
  const isIcon = (w <= 32 && h <= 32) ||
    /icon|arrow|chevron|check|close|search|plus|minus/.test(name);

  if (!isIcon) continue;

  const parent = main.parent;
  const entryName = parent?.type === 'COMPONENT_SET' ? parent.name : main.name;

  if (!discovered[entryName]) {
    discovered[entryName] = {
      name: entryName,
      key: parent?.type === 'COMPONENT_SET' ? parent.key : main.key,
      nodeId: parent?.type === 'COMPONENT_SET' ? parent.id : main.id,
      width: w,
      height: h,
      variants: {}
    };
  }

  discovered[entryName].variants[main.name] = {
    key: main.key,
    nodeId: main.id
  };
}

return Object.values(discovered);
```

> "I can discover icon keys from instances already placed on the canvas.
> Could you drag a few icons from the library onto the page?
> I'll extract their keys and you can delete them afterward."

### Strategy priority and when REST API fails

The REST API tools (`figma_get_design_system_kit`, `figma_get_library_components`,
`figma_get_file_data`) require the library file to be accessible to the API token.
They return 404 when:
- The file is a **duplicate/copy** (not the original published library)
- The file is **not shared** with the API token's account
- The file is a **draft** that hasn't been published

When REST fails, you MUST fall back to Strategy 5 or 6. Always tell the user
why the fallback is needed.

| Situation | Strategy | MCP Calls |
|---|---|---|
| Library file key known + REST works | 1: design_system_kit | 1 call |
| Need variant-level keys | 2: library_components | 1 call |
| Searching for specific icon subsets | 3: search_components | 1-5 calls |
| Icons in current file | 4: figma_execute local | 1 call |
| REST blocked (copy/draft) | 5: Navigate to file | 2-3 calls |
| Can't open library file | 6: Reverse from instances | 1 call + user action |

### How to identify icons vs. regular components

Not every small component is an icon. Use these signals together:

**Strong signals (any one is sufficient):**
- Located in an "Icons" or "Iconography" page/section in the file
- Name contains `icon/` prefix or is nested under an icon category
- Component has explicit icon-related description

**Medium signals (need 2+ to classify as icon):**
- Size is small (both dimensions <= 32px)
- Name contains common icon keywords: `arrow`, `check`, `close`, `search`, `plus`,
  `minus`, `chevron`, `x-close`, `star`, `heart`, `home`, `settings`, `user`, `mail`,
  `bell`, `calendar`, `clock`, `lock`, `eye`, `edit`, `trash`, `copy`, `download`,
  `upload`, `share`, `filter`, `menu`, `grid`, `list`
- Has no or few variants (icons rarely have complex variant axes)
- Single-color fill (no multi-color illustrations)

**Weak signals (supporting evidence only):**
- Used primarily in instance swap slots (check `design-system/relationships.json` swapGroups)
- No text layers inside the component
- Simple layer structure (< 10 layers)

**Not icons (exclude these):**
- Logos and brand marks (multi-color, larger than 32px)
- Illustrations and decorative graphics
- Emoji-style components
- Avatar placeholders (even if small)

### Present the discovery results

After discovery, present what you found:

> "Found **[N] icons** across [N] categories. Here's a sample:
>
> - **Navigation** (12): arrow-left, arrow-right, chevron-down, menu, x-close ...
> - **Status** (8): check, alert-circle, info-circle, x-circle ...
> - **Actions** (15): search, filter, plus, minus, edit, trash ...
> - **Social** (6): twitter, github, linkedin, facebook ...
> - **Communication** (9): mail, message, phone, send ...
> ...
>
> Does this look right? Should I include or exclude anything?"

AskUserQuestion format:

> "I've identified [N] icons from your library. Here's the breakdown by category.
>
> RECOMMENDATION: Choose A to proceed with the full set. If something looks
> wrong (non-icons included, or icons missing), choose B to adjust.
>
> A) **Looks good** — Proceed with all [N] icons
> B) **Adjust** — I'll tell you what to include/exclude
> C) **Show me more examples** — List 5-10 icons per category so I can verify"

## Step 2: Extract icon data

For each icon discovered, capture the following data:

### Core fields

- **`name`** — The icon name in kebab-case, without category prefix.
  - `Icons/Navigation/arrow-left` becomes `arrow-left`
  - `icon/check-circle` becomes `check-circle`
  - `Search MD` becomes `search-md`
  - Follow whatever convention the library uses; normalize to kebab-case only if
    the library doesn't have a consistent pattern.

- **`key`** — The 40-character component key hash. This is what
  `figma_instantiate_component` needs to place the icon. CRITICAL — without this,
  icons can't be placed programmatically.

- **`nodeId`** — Figma node ID (e.g., `3463:405123`). Used for cross-referencing
  and navigation.

- **`category`** — Derived from the icon's naming convention or page location.
  If the library uses `Icons/Navigation/arrow-left`, the category is `Navigation`.
  If no structure exists, auto-categorize based on icon function.

- **`tags`** — Searchable keywords for fuzzy matching. See tag generation rules below.

- **`primaryUse`** — one sentence describing when to use THIS icon vs similar ones.
  Generated from the icon's Figma description if available, or inferred from name
  and context. Example: search-md → "Default search icon for search bars and inputs",
  magnifying-glass → "Inspect/zoom icon for detail views", find-icon → "Advanced
  search or discovery features"

- **`size`** — Default dimensions as `{ "width": 24, "height": 24 }`.

### Optional fields

- **`variants`** — If the icon has variants (filled/outline, sizes, weights),
  capture each variant's key separately:
  ```json
  "variants": {
    "filled": "variant-key-hash-filled",
    "outline": "variant-key-hash-outline"
  }
  ```
  For size variants: `"sm": "key", "md": "key", "lg": "key"`

- **`description`** — From Figma's component description field, if present.

### Tag generation rules

Auto-generate tags for every icon based on three sources:

**1. Name decomposition** — Split the icon name by hyphens and slashes:
- `arrow-left` tags: `["arrow", "left"]`
- `check-circle` tags: `["check", "circle"]`
- `alert-triangle` tags: `["alert", "triangle"]`

**2. Synonym expansion** — Add common synonyms for well-known icons:

| Icon name | Additional synonym tags |
|---|---|
| `search` | find, magnifying glass, lookup, query |
| `check` | checkmark, tick, done, complete, success, confirm |
| `x-close` / `close` | close, dismiss, remove, cancel, exit |
| `arrow-left` | back, previous, navigate, return |
| `arrow-right` | forward, next, continue |
| `arrow-up` | up, ascending, expand |
| `arrow-down` | down, descending, collapse |
| `chevron-down` | dropdown, expand, caret, select |
| `chevron-right` | expand, enter, navigate, drill-down |
| `plus` | add, create, new, insert |
| `minus` | subtract, remove, reduce |
| `edit` | pencil, modify, change, update, write |
| `trash` | delete, remove, discard, bin, garbage |
| `copy` | duplicate, clone, clipboard |
| `download` | save, export, get |
| `upload` | import, send, attach |
| `share` | send, distribute, export |
| `filter` | sort, refine, funnel |
| `eye` | view, show, visible, visibility, watch |
| `eye-off` | hide, invisible, hidden |
| `lock` | secure, locked, protect, private |
| `unlock` | unsecure, unlocked, open |
| `settings` | gear, cog, preferences, configure, options |
| `home` | house, dashboard, start, main |
| `user` | person, profile, account, avatar |
| `users` | people, group, team, members |
| `mail` | email, envelope, message, inbox |
| `bell` | notification, alert, alarm, remind |
| `calendar` | date, schedule, event, day |
| `clock` | time, schedule, duration, timer |
| `star` | favorite, bookmark, rate, rating |
| `heart` | like, love, favorite, wishlist |
| `menu` | hamburger, navigation, sidebar, bars |
| `more-horizontal` | dots, ellipsis, options, overflow, actions |
| `more-vertical` | dots, kebab, options, overflow, actions |
| `info` | information, help, details, about |
| `alert-circle` | warning, caution, attention |
| `alert-triangle` | warning, caution, danger, error |
| `help-circle` | question, support, faq |

**4. From Figma description** — Read the component description field. Parse nouns
   and verbs as additional tags. Example: description "Used for inspect and zoom
   features" adds tags ["inspect", "zoom", "features"]. This is the primary
   disambiguator for icons with similar names.

**5. Related concepts** — Add functional context:
- Navigation icons get: `navigate`
- Status icons get: `status`, `feedback`
- Action icons get: `action`, `toolbar`
- Social icons get: `social`, `brand`
- Media icons get: `media`, `player`

### Batching for large libraries

For libraries with 500+ icons, batch the extraction in groups of 50 per
`figma_execute` call. Use a timeout of 30000ms for large batches.

```javascript
// Run via figma_execute — batch extraction for large libraries
// Process icons in batches of 50 to avoid timeouts
const BATCH_SIZE = 50;
const iconNodeIds = ['id1', 'id2', /* ... up to 50 */];

const results = [];
for (const id of iconNodeIds) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) continue;

  results.push({
    name: node.name,
    key: node.key,
    nodeId: node.id,
    width: node.width,
    height: node.height,
    description: node.description || '',
    type: node.type,
    ...(node.type === 'COMPONENT_SET' ? {
      variants: node.children.map(v => ({
        name: v.name,
        key: v.key,
        nodeId: v.id
      }))
    } : {})
  });
}

return results;
```

Report progress after each batch:

> "Extracting icons: batch [X] of [Y] ... [current count]/[total] complete"

## Step 3: Group by category

Organize all discovered icons into categories. Use the library's own structure
if it has one; otherwise, auto-categorize.

### Using library structure

If icons are organized under pages or sections in Figma (e.g., `Icons/Navigation/`,
`Icons/Actions/`), preserve that structure as categories. This respects the
designer's intent.

### Auto-categorization

If the library has no clear category structure, group by function:

| Category | Typical icons |
|---|---|
| **Navigation** | arrows, chevrons, menu, home, external-link, corner arrows |
| **Actions** | search, filter, plus, minus, edit, trash, copy, download, upload, share, refresh |
| **Status** | check, check-circle, alert-circle, alert-triangle, info-circle, x-circle, help-circle |
| **Communication** | mail, message, phone, send, inbox, at-sign, paperclip |
| **Media** | play, pause, stop, skip, volume, mic, camera, image, video |
| **Social** | twitter/x, github, linkedin, facebook, instagram, youtube, dribbble |
| **Files** | file, folder, document, archive, code, database, clipboard |
| **Editor** | bold, italic, underline, align-left, list, link, type, columns |
| **Users** | user, users, user-plus, user-minus, user-check |
| **Weather** | sun, moon, cloud, rain, wind, thermometer |
| **Commerce** | credit-card, shopping-cart, shopping-bag, tag, dollar-sign, percent |
| **Layout** | grid, layout, sidebar, columns, maximize, minimize, move |
| **Device** | monitor, smartphone, tablet, laptop, printer, cpu, hard-drive |
| **Map** | map, map-pin, compass, navigation, globe |
| **Security** | lock, unlock, shield, key, eye, eye-off |
| **Misc** | Any icons that don't fit the above categories |

### Mapping swap slots

While grouping, also identify which components use icons as instance swap props.
Check `design-system/relationships.json` (if it exists) for `swapGroups`, or
scan component property definitions for instance swap props that accept icons.

```javascript
// Run via figma_execute — find instance swap props that use icons
const allComponentSets = figma.root.findAll(n => n.type === 'COMPONENT_SET');
const swapSlots = {};

for (const cs of allComponentSets) {
  const props = cs.componentPropertyDefinitions;
  if (!props) continue;

  for (const [propName, propDef] of Object.entries(props)) {
    if (propDef.type === 'INSTANCE_SWAP') {
      // Check if the default value is an icon-sized component
      const defaultId = propDef.defaultValue;
      if (defaultId) {
        const defaultNode = await figma.getNodeByIdAsync(defaultId);
        if (defaultNode && defaultNode.width <= 32 && defaultNode.height <= 32) {
          const slotKey = cs.name.toLowerCase().replace(/\s+/g, '-') +
                          '-' + propName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
          swapSlots[slotKey] = {
            propKey: propName,
            usedIn: [cs.name.toLowerCase().replace(/\s+/g, '-')],
            defaultIcon: defaultNode.name || 'placeholder'
          };
        }
      }
    }
  }
}

return swapSlots;
```

## Step 3.5: Completeness validation gate (BLOCKING)

Before writing icons.json, verify the extraction is comprehensive:

### Essential icon check

These icons are used in nearly every design. If ANY are missing, search for them
specifically before proceeding:

```
MUST HAVE (search individually if not found):
  Navigation: arrow-left, arrow-right, arrow-up, arrow-down,
              chevron-left, chevron-right, chevron-down, chevron-up
  Actions:    search-lg, search-md, search-sm, plus, minus, x-close,
              edit-03, trash-01, copy-01, download-01, upload-01
  UI Chrome:  menu-01, settings-01, settings-02, help-circle,
              bell-01, bell-02, home-line, home-01
  People:     user-01, user-02, users-01, users-02
  Content:    mail-01, mail-02, send-01, send-03,
              file-01, file-02, file-text, folder
  Location:   map-pin, globe-01
  Time:       clock, calendar, repeat-04, refresh-cw-01
  Media:      image-01, camera-01, mic-01, play, pause
  Commerce:   credit-card-01, shopping-bag-01, tag-01
  Status:     check, check-circle, alert-circle, alert-triangle,
              info-circle, x-circle
  Misc:       link-01, bookmark, star-01, heart, eye, eye-off,
              lock-01, unlock-01, log-out-01, log-in-01
```

For each missing essential icon:
1. `figma_search_components` with the icon name + libraryFileKey
2. If found → add to catalog with hex key
3. If not found → note as "not in library" (don't leave gaps silently)

### Count validation

- **Minimum for a typical UI library**: 200+ icons
- **Expected for a full library (like Untitled UI)**: 800-1500 icons
- If you found < 200, the extraction is incomplete. Re-run Strategy 3 with
  ALL systematic queries before writing.

### Key format validation

Walk every icon entry. Verify `key` is a 40-char hex hash (`/^[a-f0-9]{40}$/`).
If any key contains `:` (nodeId format), convert it via `figma_search_components`.

## Step 4: Write `design-system/icons.json`

Create the `design-system/` directory if it doesn't exist, then write the icon
catalog. This is the primary output of this skill.

### Output format

```json
{
  "$schema": "design-kit/icons/v1",
  "$metadata": {
    "extractedAt": "2026-03-30T14:22:00.000Z",
    "libraryFile": "Untitled UI PRO VARIABLES (v6.0)",
    "libraryFileKey": "JhsFSqLI1lWfDZq5I4crsQ",
    "totalIcons": 847,
    "categories": 12
  },
  "icons": {
    "search-md": {
      "key": "abc123...40-char-hash",
      "nodeId": "3463:405123",
      "category": "Actions",
      "tags": ["search", "find", "magnifying glass", "lookup", "query"],
      "primaryUse": "Default search icon for search bars and inputs",
      "size": { "width": 24, "height": 24 },
      "alternatives": ["magnifying-glass", "find-icon"]
    },
    "arrow-left": {
      "key": "def456...40-char-hash",
      "nodeId": "3463:405234",
      "category": "Navigation",
      "tags": ["arrow", "left", "back", "previous", "navigate"],
      "primaryUse": "Back navigation and previous-step actions",
      "size": { "width": 24, "height": 24 }
    },
    "check": {
      "key": "ghi789...40-char-hash",
      "nodeId": "3463:404967",
      "category": "Status",
      "tags": ["check", "checkmark", "tick", "done", "complete", "success", "confirm"],
      "primaryUse": "Confirm completion or success state",
      "size": { "width": 24, "height": 24 },
      "variants": {
        "filled": "variant-key-hash-filled",
        "outline": "variant-key-hash-outline"
      }
    }
  },
  "alternativeGroups": {
    "search": {
      "icons": ["search-md", "magnifying-glass", "find-icon"],
      "disambiguation": "search-md for search bars, magnifying-glass for inspect/zoom, find-icon for advanced search/discovery"
    }
  },
  "categories": {
    "Navigation": ["arrow-left", "arrow-right", "arrow-up", "arrow-down", "chevron-left", "chevron-right", "chevron-down", "chevron-up", "menu", "x-close"],
    "Actions": ["search-md", "filter-lines", "plus", "minus", "edit-02", "trash-01", "copy-01", "download-01", "upload-01", "share-01"],
    "Status": ["check", "check-circle", "alert-circle", "alert-triangle", "info-circle", "x-circle", "help-circle"]
  },
  "swapSlots": {
    "button-icon-leading": {
      "propKey": "🔀 Icon leading swap#3466:91",
      "usedIn": ["button", "button-destructive"],
      "defaultIcon": "placeholder"
    },
    "button-icon-trailing": {
      "propKey": "🔀 Icon trailing swap#3466:852",
      "usedIn": ["button", "button-destructive"],
      "defaultIcon": "placeholder"
    }
  }
}
```

### Schema notes

- **`icons`** — Flat map keyed by icon name. Each entry has everything needed to
  instantiate the icon: `key` for `figma_instantiate_component`, `nodeId` for
  navigation, `tags` for search, `category` for grouping.

- **`categories`** — Reverse index: category name to list of icon names. Lets
  downstream skills enumerate "all navigation icons" without scanning the full map.

- **`swapSlots`** — Maps component instance swap properties to the icons they accept.
  The `propKey` is the full Figma property key string (e.g., `🔀 Icon leading swap#3466:91`)
  needed by `figma_set_instance_properties`. The `usedIn` array lists which
  components have this swap slot.

- **`alternativeGroups`** — Groups icons that share a concept. When downstream skills
  resolve "search icon," show the group so the user can pick the right one. Each
  group has a `disambiguation` string explaining when to use each icon in the group.

- **`alternatives`** (per icon) — List of icon names that serve a similar concept.
  Cross-references the `alternativeGroups` for quick lookup from any icon in the set.

- **`primaryUse`** (per icon) — One-sentence description of when to use THIS icon vs
  similar ones. Generated from the Figma description or inferred from name/context.

### Writing the file

```javascript
// Use the Write tool to save the catalog
// Path: design-system/icons.json
```

If updating an existing catalog (user chose "Update" in the before-you-begin step),
merge new icons into the existing file. Preserve existing entries unless they've
been removed from the library. Update keys and metadata for entries that still exist.

## Step 5: Present summary and verify

After writing the file, present a clear summary:

> "Icon library extracted: **[N] icons** across **[N] categories**
>
> | Category | Count | Examples |
> |---|---|---|
> | Navigation | 24 | arrow-left, chevron-down, menu |
> | Actions | 18 | search, filter, plus, edit |
> | Status | 12 | check-circle, alert-triangle, info |
> | Communication | 9 | mail, message, phone, send |
> | Media | 8 | play, pause, volume, camera |
> | Files | 7 | file, folder, document, archive |
> | Social | 6 | twitter, github, linkedin |
> | ... | ... | ... |
>
> **Swap slots mapped**: [N] instance swap slots across [N] components
>
> Other skills can now resolve icons by name:
> - `/plan`: 'use a search icon' resolves to a key instantly
> - `/build`: swaps icons into slots without searching
> - `/plan-component`: specifies default icons for instance swap props"

Take a screenshot of an icon page in Figma (if one exists) to visually confirm
the catalog matches what's in the file:

```
Use figma_take_screenshot to capture the icon page or section.
Compare the screenshot against the catalog to spot any missed icons.
```

If icons were missed, extract them and update the catalog before finalizing.

## Step 6: How other skills use `icons.json`

This section documents the resolution pattern that downstream skills follow.
Include it in the output for reference.

### Icon resolution pattern

When a planning or building skill needs an icon, it follows this flow:

```
1. Read design-system/icons.json
2. Search by name (exact match first) or by tags (fuzzy match)
3. Include the icon key in the plan JSON:
   "iconOverride": {
     "slot": "🔀 Icon leading swap#3466:91",
     "icon": "search-md",
     "iconKey": "abc123..."
   }
4. Build resolves the key directly via figma_set_instance_properties
```

### Name resolution (exact match)

The fastest path. When a plan says `"icon": "search-md"`:

```javascript
const icons = JSON.parse(readFile('design-system/icons.json'));
const icon = icons.icons['search-md'];
// icon.key → "abc123..." → ready for figma_instantiate_component
```

### Tag resolution (fuzzy match)

When a plan uses a descriptive term instead of an exact name:

```javascript
// "magnifying glass" → matches tags on "search-md"
// "done" → matches tags on "check"
// "back" → matches tags on "arrow-left"

const icons = JSON.parse(readFile('design-system/icons.json'));
const query = 'magnifying glass';
const matches = Object.entries(icons.icons)
  .filter(([name, data]) =>
    data.tags.some(tag => tag.includes(query) || query.includes(tag))
  )
  .map(([name, data]) => ({ name, ...data }));
// Returns: [{ name: "search-md", key: "abc123...", ... }]
```

### Swap slot resolution

When building a component instance and setting its icon swap prop:

```javascript
const icons = JSON.parse(readFile('design-system/icons.json'));

// Find the swap slot for "button icon leading"
const slot = icons.swapSlots['button-icon-leading'];
// slot.propKey → "🔀 Icon leading swap#3466:91"

// Find the icon to swap in
const icon = icons.icons['search-md'];
// icon.key → "abc123..."

// Use in figma_set_instance_properties:
// { "🔀 Icon leading swap#3466:91": "abc123..." }
```

### Category browsing

When a skill needs to suggest icons from a category:

```javascript
const icons = JSON.parse(readFile('design-system/icons.json'));
const navIcons = icons.categories['Navigation'];
// ["arrow-left", "arrow-right", "chevron-down", "menu", "x-close", ...]

// Get full data for each
const navIconData = navIcons.map(name => ({
  name,
  ...icons.icons[name]
}));
```

## Edge cases

### Very large icon libraries (1000+ icons)

Batch extraction in groups of 50 per `figma_execute` call. Report progress after
each batch. Use a timeout of 30000ms for large batches. If extraction fails
mid-way, save partial results and offer to resume.

> "This is a large icon library. I'll extract in batches of 50.
> Progress: [current]/[total] icons extracted..."

### Icons with variants (filled/outline, sizes)

Some icons have variant axes — typically `Style: filled/outline` or
`Size: 16/20/24`. These are component sets, not standalone components.

- Capture each variant's key separately in the `variants` field
- Use the default variant's key as the top-level `key`
- Name variants by their property values: `"filled"`, `"outline"`, `"16"`, `"24"`

### Icons that are component sets vs. standalone components

- **Standalone component** (type `COMPONENT`): Single icon, one key. Most common.
- **Component set** (type `COMPONENT_SET`): Icon with variants. Capture the set
  and each variant. Use a variant key (not the set key) for instantiation.

### No clear icon naming convention

If the library doesn't follow a recognizable naming pattern:

> "I found [N] small components but the naming doesn't follow a standard icon
> convention. Could you help me identify which page or section contains the icons?
>
> A) **Point me to the icon page** — I'll navigate to it
> B) **Show me what you found** — I'll tell you which are icons
> C) **They're mixed in with other components** — I'll filter by size (<=32px)"

### Icons from multiple libraries

If icons come from different library files, extract each separately and merge
into one `icons.json`. Tag each icon with its source library:

```json
{
  "search-md": {
    "key": "abc123...",
    "category": "Actions",
    "tags": ["search", "find"],
    "size": { "width": 24, "height": 24 },
    "library": "Untitled UI Icons"
  }
}
```

### Duplicate icon names across libraries

If two libraries have icons with the same name, suffix with the library name:

- `search-md` (from primary library)
- `search-md--brand-icons` (from secondary library)

Flag duplicates to the user:

> "Found duplicate icon names across libraries:
> - `search` exists in both 'Core Icons' and 'Brand Icons'
> I've suffixed the secondary library's icons. Want to handle these differently?"

### Missing icon keys

If an icon's `key` field is empty or undefined (can happen with unpublished
components), flag it:

> "Warning: [N] icons have no component key (likely unpublished). These can't be
> instantiated programmatically. Do you want to include them in the catalog anyway?"

Mark them with `"status": "unpublished"` and omit the `key` field.

### Icons used as nested components inside other icons

Some libraries have composite icons (e.g., a notification badge on a bell icon)
built from smaller icon components. These are usually NOT in the icon catalog —
they're compositions. Exclude them unless they're published as standalone icons.

## Next steps

After the catalog is saved, present the user with next steps:

> "Icon catalog saved to `design-system/icons.json`. All planning and building
> skills can now resolve icons by name.
>
> - Run `/plan` or `/plan-component` — icon suggestions will be automatic
> - Run `/build` — icon swaps will resolve without searching Figma
> - Run `/setup-components` — if you haven't already, this catalogs the full
>   component library (icons are the lightweight complement)
> - Run `/setup-relationships` — to map which components use which icons
>   in their swap slots"

## Tone

Thorough librarian. You appreciate a well-organized icon library and know that
the catalog you're building saves every future skill from runtime searching.
Be precise about counts, categories, and coverage.

> "Found 847 icons across 12 categories. Every instance swap slot in your component
> library now has a direct icon lookup."
