# Fix Hap Control styling to match the Admin app

## Confirmed state

`public/hap/ops.js` renders the Hap Control screens with a component vocabulary that has no matching CSS in `public/hap/styles.css`. Every one of these classes is used in `ops.js` and defined nowhere:

`kpi`, `kpi-grid`, `list-card`, `data-row`, `data-copy`, `plan-card`, `plan-top`, `plan-price`, `feature-list`, `feature-row`, `form-card`, `inline-input`, `soft-chip`, `chip-wrap`, `removable`, `empty-state`, `empty-orb`, `empty-inline`, `link-btn`, `compact`, `static`

So Overview, Restaurants (+ detail), Users, Plans and Settings fall back to unstyled stacked blocks, while Admin screens look right because they use styled classes (`.card`, `.section`, `.settings-row`, `.filter-chip`, `.signal-row`, …).

Tour boot: `app.js` already limits the first-run tour to `bootPath === '/' || '/admin'`, but a tour saved as `active` in local storage is re-mounted on any boot path, including `/super` — that is the remaining path to the reported behaviour.

## The fix

### 1. Hap Control component styles (`public/hap/styles.css`)

One appended block, reusing the existing custom properties (`--surface`, `--surface-2`, `--line`, `--muted`, `--brand`, `--radius`, `--radius-sm`, `--shadow-sm`, `--ease`) so light/dark switching keeps working. No new visual language:

- **KPI tiles** (`kpi`, `kpi-grid`): two-column grid; uppercase label, large tabular value, small delta line (positive/negative tinted with `--success` / `--danger`). Card framing identical to `.card`.
- **List rows** (`list-card`, `data-row`, `data-copy`): surface card with 1px hairline dividers between rows; avatar/initial square (34px, `--radius-sm`, `--surface-2`), name + meta line, status pill, chevron; matches `.signal-row` / `.admin-item` metrics.
- **Plan cards** (`plan-card`, `plan-top`, `plan-price`, `feature-list`, `feature-row`): card with name + price header, check-marked feature rows, action row at the bottom.
- **Forms** (`form-card`, `inline-input`): card-framed field groups reusing the existing `.field` input styling; `inline-input` is a compact label-left / input-right row aligned with `.settings-row`.
- **Chips** (`soft-chip`, `chip-wrap`, `removable`): the `.filter-chip` look at a smaller scale; `removable` adds the trailing × affordance.
- **Empty states** (`empty-state`, `empty-orb`, `empty-inline`): centred orb (like `.status-orb`) + title + copy for full states; `empty-inline` is the one-line "no results — clear filters" row.
- **Modifiers**: `compact` tightens row padding, `static` removes press/hover affordance on non-interactive rows, `link-btn` is the text-button style already implied by `.section-link`.

### 2. Tour boot guard (`public/hap/app.js`)

On boot, when the path is anything other than `/` (or the public context), force `state.tour.active = false` so a persisted active tour cannot appear over Hap Control or a deep-linked admin subpage. A first visit to `/` still starts the tour, and "Replay tour" from More still works.

### 3. Verification

Playwright screenshots at mobile width, light and dark, of `/super`, `/super/restaurants`, a restaurant detail + its menu editor, `/super/users`, `/super/plans`, `/super/settings`, compared against the equivalent Admin screens.

## Technical notes

- Changes limited to `public/hap/styles.css` (appended Hap Control block) and one boot line in `public/hap/app.js`.
- No React route, component, or data-model changes; no new tokens introduced.
