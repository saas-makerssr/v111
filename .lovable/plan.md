# Admin cleanup + per-restaurant currency system

Two pieces of work: (A) the admin UI fixes you listed, and (B) a complete per-restaurant currency architecture. Currency lives inside the existing Settings screen — no new navigation item, no duplicate settings page.

## A. Admin interface fixes

1. **Promote button** — remove the spark icon from the item-row Promote button; text-only, same style.
2. **Restock all** — replaced by **Share menu** (copies the public menu link, toast confirmation). Restocking stays possible per item via the status cycle, so nothing is lost. *(Default choice — say the word if you'd rather just remove it.)*
3. **Preview duplication** — today the same action exists 5 times (top Admin/Preview toggle, eye icons on Home/Promote/Design headers, "Preview" link on every subpage header, "Your menu is live → Open" card). Fix:
   - Keep **one** mode switch: the Admin/Preview toggle at the top.
   - Remove the eye icons from page headers and the Preview link from subpage headers.
   - The "Your menu is live" card keeps its status info but its button becomes **Share** (copy link) — distinct purpose from the mode toggle. *(Default choice.)*
4. **Superadmin scroll bug** — `.super-shell{min-height:100%}` lets content grow past the phone frame and get clipped; change to `height:100%` with a flex column so the scroll region stays inside the frame.
5. **Insights** — add a time-range switcher (24h / 7d / 30d / All time); keep item views, avg. time on menu, most-viewed category.
6. **Roles** — fixed slots (Owner, Manager 1, Manager 2) with per-person permissions and recent activity per person.
7. **Settings toggles** — keep the sign-ups toggle; remove the maintenance-mode toggle.

## B. Currency architecture

### Two fully separate currency systems

```text
1. Hap platform billing        → always Albanian Lek (ALL)
   One plan: 2,500 Lek / month. Never affected by menu currency.

2. Restaurant menu currency    → chosen per restaurant
   Primary currency (ALL, EUR, USD, GBP, CHF, …) is what guests
   see beside every item: "1,800 Lek" or "€18".
```

Billing and menu currency are never connected. The current hardcoded `money()` (`€x.xx`) is replaced by a currency-aware formatter; billing always formats ALL, menu always formats the restaurant's primary currency. The three old plans (starter/growth/scale at €19/49/129) collapse into the single 2,500 ALL/month plan everywhere (Billing screen, Hap Control plans).

### Data model (frontend state, localStorage like the rest of the prototype)

```text
restaurant.currency: {
  primary: 'ALL',                  // ISO 4217 code
  conversionsEnabled: true,
  rates: [                         // max 5, display-ordered
    {
      code: 'EUR',
      rate: 107,                   // ONE format: 1 EUR = 107 ALL (primary)
      source: 'manual',            // reserved for future rate providers
      updatedAt: '2026-08-24'
    }
  ]
}
menu item: { price: 1000 }         // ONE source price, in primary currency
```

- One normalized rate format throughout: **1 [guest currency] = [rate] [primary currency]**. No arbitrary formats.
- One source price per item. Converted prices are **calculated**, never stored or edited separately.
- `source: 'manual'` and the per-rate record shape leave room for automatic rate providers later without redesigning the feature. No external exchange-rate API in this phase.
- Demo data: Sofra's primary becomes **ALL** with realistic Lek prices; EUR, USD, GBP pre-configured as guest currencies.

### Settings UX — integrated into existing Settings

Settings gains a **Menu currency** card next to the existing Identity / Contact / Public menu cards (no new top-level page):

```text
Menu currency
  Primary currency        [ ALL — Albanian Lek ▼ ]

Guest currency conversions
  [ Enable currency conversion ]          (toggle)
  EUR   1 EUR = [ 107  ] ALL      ↑↓  ✕
  USD   1 USD = [  96  ] ALL      ↑↓  ✕
  GBP   1 GBP = [ 121  ] ALL      ↑↓  ✕
  + Add currency                  (max 5)

  Preview: 1,000 Lek ≈ €9.35 · $10.42 · £8.26   (live while typing)
  Last updated: 12 Aug 2026 (per rate)
```

- Reorder handles match the existing menu-item reorder pattern.
- **Preview conversion** updates live as a rate is typed, before saving.
- Changing the **primary** currency keeps numeric item prices unchanged and shows a clear notice ("existing prices are now read as EUR — review your prices"); base prices are never silently converted.
- **Rate freshness**: each rate shows "Last updated: [date]"; if a rate is untouched for 30+ days the admin sees a subtle line — "Exchange rates haven't been reviewed recently." Guests never see warnings.

### Public menu UX

- Items still show **only the primary currency**: `Seafood Pasta … 1,000 Lek`.
- Beside the price, a small **currency affordance** — a compact chip with the ≈ symbol and a tiny chevron (`1,000 Lek ≈`) — visually distinct from any action menu, and only rendered when conversions are enabled.
- Tapping it opens a small bottom sheet: **"Approximate price"** listing the enabled currencies with calculated values, labelled as approximate/reference conversions.
- The menu never shows all currencies under every item.

### Validation & money math

Reject: zero/negative rates, non-numeric text, duplicate currencies, the primary currency added as a guest currency, more than 5 guest currencies.

- Calculations in **integer minor units** (cents / whole Lek) with round-half-up — no raw floating-point money math.
- Display via `Intl.NumberFormat` per currency: ALL → 0 decimals ("1,800 Lek"), EUR/USD/GBP/CHF → 2 decimals ("€18.00").
- Editing a rate re-renders all conversions automatically; item prices are never touched.

### Superadmin

- Platform billing stays 2,500 ALL/month regardless of any restaurant's menu currency.
- Superadmin gets a **read-only** view of a restaurant's currency configuration inside that restaurant's detail view (for troubleshooting). No global rate editing — rates belong to the restaurant.

## What changes in code

- `public/hap/app.js`: new currency-aware `money()`/formatter, currency section in `settingsPage`, conversion sheet on the public menu, admin fixes (promote icon, toolbar, preview de-duplication, status card, insights range, roles), single-plan billing at 2,500 ALL.
- `public/hap/styles.css`: `.super-shell` scroll fix, currency chip + conversion sheet styles.
- State: `restaurant.currency` defaults added on load for existing saved state; billing plan data simplified to one plan.

No backend, no external rate API, no new navigation items.
