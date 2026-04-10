// ============================================================================
// Design Kit — Figma Plugin API Helpers (CANONICAL SOURCE)
// ============================================================================
// This file is the single source of truth for Figma helper functions.
// Skills embed copies of these helpers in figma_execute calls — they cannot
// import from external files at runtime (Figma plugin sandbox limitation).
//
// If you update a helper here, also update the inline copy in build/SKILL.md.
// Skills that reference "build-helpers/figma-helpers.js" should copy from here.
//
// Embed these in figma_execute calls. Each function is self-contained.
// Copy the ones you need into your figma_execute code block.
//
// COMPONENT-FIRST RULE:
// If the plan says "library-component", use figma_instantiate_component.
// NEVER substitute with mkFrame() + createEllipse() shortcuts.
// These helpers are for TOKEN-BUILT elements only — elements where
// the plan explicitly says no library component exists.
//
// WRONG: Plan says Avatar label group → you use createEllipse() for a gray circle
// RIGHT: Plan says Avatar label group → you use figma_instantiate_component
// RIGHT: Plan says token-built avatar placeholder → you use createEllipse()
// ============================================================================

// --- 1. IMPORT TOKENS ---
// Build a variable map from a flat key object. Call once per figma_execute.
//
// Usage:
//   const V = await importTokens({ 'bg.p': 'b6157f22...', 's.xl': 'f4d6b399...' });
//   bf(frame, V['bg.p']);
//
async function importTokens(keys) {
  const vars = {};
  for (const [alias, key] of Object.entries(keys)) {
    vars[alias] = await figma.variables.importVariableByKeyAsync(key);
  }
  return vars;
}

// --- 2. BIND FILL / STROKE ---
// Shorthand for the verbose setBoundVariableForPaint pattern.
//
// Usage:
//   bf(frame, V['bg.p']);    // bind fill
//   bs(frame, V['bd.s']);    // bind stroke (1px)
//
function bf(node, variable) {
  node.fills = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable
  )];
}
function bs(node, variable) {
  node.strokes = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable
  )];
  node.strokeWeight = 1;
}

// --- 3. CREATE FRAME ---
// Creates an auto-layout frame with correct sizing (prevents 100px bug).
// MUST be called with a parent — appends immediately, then sets sizing.
//
// Usage:
//   const frame = mkFrame(parent, 'Section', 'VERTICAL', 'FILL', 'HUG');
//   frame.setBoundVariable('itemSpacing', V['s.xl']);
//   bf(frame, V['bg.p']);
//
// For root frames with explicit width:
//   const root = mkFrame(null, 'Root', 'HORIZONTAL');
//   root.resize(1440, 1);
//
function mkFrame(parent, name, direction, widthSizing, heightSizing) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = direction || 'VERTICAL';
  f.fills = [];           // transparent by default (set fill explicitly)
  f.clipsContent = false; // prevent silent overflow hiding
  if (parent) {
    parent.appendChild(f);
    f.layoutSizingHorizontal = widthSizing || 'HUG';
    f.layoutSizingVertical = heightSizing || 'HUG';
  }
  return f;
}

// --- 4. CREATE TEXT ---
// Creates a token-bound text node. Appends to parent, sets sizing, binds tokens.
// Prevents the #1 build bug: text clipping from missing sizing.
//
// Usage:
//   const t = mkText(parent, 'Hello', 'Semi Bold', V['tx.p'], V['fs.md'], V['lh.md']);
//
// For short labels (< 15 chars, won't grow):
//   const t = mkText(parent, 'Save', 'Medium', V['tx.p'], V['fs.sm'], V['lh.sm'], true);
//
async function mkText(parent, content, style, fillVar, fontSizeVar, lineHeightVar, hug) {
  await figma.loadFontAsync({ family: 'Inter', style: style || 'Regular' });
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: style || 'Regular' };
  t.characters = content;
  parent.appendChild(t);
  t.layoutSizingHorizontal = hug ? 'HUG' : 'FILL';
  t.layoutSizingVertical = 'HUG';
  t.setBoundVariable('fontSize', fontSizeVar);
  t.setBoundVariable('lineHeight', lineHeightVar);
  bf(t, fillVar);
  return t;
}

// --- 5. CANVAS SCAN ---
// Finds clear space on the canvas. Returns { originX, originY }.
// Accounts for selection-aware placement and existing content.
//
// Usage:
//   const { originX, originY } = canvasScan();
//   root.x = originX;
//   root.y = originY;
//
function canvasScan() {
  const children = figma.currentPage.children;
  const selection = figma.currentPage.selection;
  let originX = 0, originY = 0;

  if (selection.length > 0) {
    const sel = selection[0];
    originX = sel.x + sel.width + 300;
    originY = sel.y;
  } else if (children.length > 0) {
    let maxRight = -Infinity, minY = Infinity;
    for (const child of children) {
      const right = child.x + child.width;
      if (right > maxRight) maxRight = right;
      if (child.y < minY) minY = child.y;
    }
    originX = maxRight + 300;
    originY = minY >= 0 ? 0 : minY;
  }
  return { originX, originY };
}

// --- 6. SWEEP TEXT ---
// Walks a component instance and replaces placeholder text.
// Handles mixed-font nodes (the "Cannot unwrap symbol" error).
//
// CRITICAL: Sweep BY SECTION, not by flat tree walk.
// If you have Avatar label groups inside blog post cards AND in a contacts
// list, sweeping all Avatar label groups at once will assign the wrong names.
// Instead, sweep each section's components separately:
//
//   // WRONG — flat walk assigns names to wrong instances:
//   const allAvatars = root.findAll(n => n.name === 'Avatar label group');
//   for (let i = 0; i < allAvatars.length; i++) sweepText(allAvatars[i], ...);
//
//   // RIGHT — sweep by parent section:
//   const sidebar = root.findOne(n => n.name === 'Left Sidebar');
//   const sidebarAvatar = sidebar.findOne(n => n.name === 'Avatar label group');
//   await sweepText(sidebarAvatar, { 'Olivia Rhye': 'Sid' });
//
//   const contacts = root.findOne(n => n.name === 'Contacts');
//   const contactAvatars = contacts.findAll(n => n.name === 'Avatar label group');
//   contactAvatars.forEach((a, i) => sweepText(a, { 'Olivia Rhye': contactNames[i] }));
//
// Usage:
//   await sweepText(instanceNode, {
//     'Olivia Rhye': 'Alex Morgan',
//     'Product Designer': 'Engineering Manager',
//     '20 Jan 2025': '2h ago'
//   });
//
async function sweepText(node, overrides) {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

  const texts = node.findAll(n => n.type === 'TEXT');
  for (const t of texts) {
    const match = overrides[t.characters];
    if (match) {
      try {
        if (typeof t.fontName === 'object' && 'family' in t.fontName) {
          await figma.loadFontAsync(t.fontName);
        } else {
          // Mixed font — normalize before setting
          t.setRangeFontName(0, t.characters.length, { family: 'Inter', style: 'Regular' });
        }
        t.characters = match;
      } catch (e) {
        // Fallback: force normalize, then set
        t.setRangeFontName(0, t.characters.length, { family: 'Inter', style: 'Regular' });
        t.characters = match;
      }
    }
  }
}

// --- 7. SET INSTANCE SIZING ---
// Sets FILL sizing on a component instance after instantiation.
// Library components default to fixed sizing — this makes them responsive.
//
// Usage:
//   await setInstanceFill(instanceId);
//
async function setInstanceFill(instanceId) {
  const inst = await figma.getNodeByIdAsync(instanceId);
  if (inst) {
    inst.layoutSizingHorizontal = 'FILL';
    inst.layoutSizingVertical = 'HUG';
  }
}
