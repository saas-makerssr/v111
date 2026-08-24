# One app: `/` becomes the whole product

## What exists today

- `/` renders the real product: a self-contained prototype (`public/hap/`) with the Admin experience (Home, Menu, Promote, Design, QR, More → Appearance / Analytics / Settings), Guest Preview, and Hap Control (SuperAdmin: overview, restaurants, users, plans, settings, emails, staff).
- In parallel, a second, older implementation exists as separate pages with their own layout and design: `/admin`, `/admin/menu`, `/admin/promotions`, `/admin/qr`, `/admin/analytics`, `/admin/settings`, `/admin/billing`, `/super`, `/super/restaurants`, `/super/plans`, `/super/users`, `/super/settings`, `/menu/:slug`. These duplicate what `/` already does, with a different look.
- Functionality that exists only in the legacy pages and is missing from `/`: restaurant-side **Billing** (plan, payment method, invoices).

## The target architecture

`/` is the master application and the only UI/UX source of truth. URLs stay useful for deep linking, but every URL renders the same application shell and design.

```text
/                     Master app (Admin · Guest Preview · Hap Control)
  /admin              Dashboard        -> Admin Home screen in /
  /admin/menu         Menu             -> Admin Menu screen in /
  /admin/promotions   Promotions       -> Admin Promote screen in /
  /admin/design       Design           -> Admin Design screen in /
  /admin/qr           QR               -> Admin QR screen in /
  /admin/analytics    Analytics        -> Admin Analytics screen in /
  /admin/settings     Settings         -> Admin Settings screen in /
  /admin/billing      Billing          -> NEW Billing screen built inside /
  /preview            Guest Preview    -> Preview mode in /
  /menu/:slug         Public menu      -> Dedicated public context, shared menu components
  /super              Hap Control      -> Hap Control overview in /
  /super/restaurants  Restaurants      -> Hap Control restaurants
  /super/plans        Plans & billing  -> Hap Control plans/subscriptions
  /super/users        Users            -> Hap Control users
  /super/settings     Settings         -> Hap Control settings
```

Different URL, same application. No page keeps its own layout or design.

## Work to do

### 1. Route → screen mapping (no new UI)

- Routing is **pathname-based**. Real paths are the canonical architecture: each URL above resolves to a screen of the master application, with history, back/forward, refresh and link sharing all working on the path alone.
- The prototype gains an internal router driven by `location.pathname` (updated with the History API as the user navigates). URL fragments are not the routing mechanism.
- Backward compatibility only: an incoming `#preview` / `#admin` fragment is translated once into the equivalent path and then replaced. Existing QR/share links keep working.
- Legacy page components and their layouts are deleted; route files become thin wrappers onto the master application.

#### Not-found behaviour (scoped, not a catch-all redirect)

- `/menu/:slug` with an unknown slug → **public "Menu not found"** state, rendered in the public context (no admin chrome), with a 404 status.
- Unknown `/admin/*` → in-app not-found inside the Admin shell, with a link back to the Dashboard.
- Unknown `/super/*` → in-app not-found inside the Hap Control shell, with a link back to the overview.
- Any other unknown path → a proper application-level 404 page (404 status), not a redirect to Admin Home.

### 1b. Guest Preview vs the real public menu

- The public-menu rendering (header, category strip, item cards, templates, promotion styles, language handling) is extracted into **reusable components used by both** Guest Preview and `/menu/:slug`. One implementation, one design.
- They differ in **context, not UI**: Guest Preview runs inside the admin shell against the editor's working state (with the preview/mode controls); `/menu/:slug` runs as a standalone public page — no admin shell, no mode switch, no editor controls — driven by that restaurant's published data.


### 2. Migrate useful functionality, not old UI

Audit result and action per legacy page:

| Legacy page | Already in `/`? | Action |
| --- | --- | --- |
| /admin, /admin/menu, /admin/promotions, /admin/qr, /admin/analytics, /admin/settings | Yes, richer in `/` | Delete legacy page, route points at `/` screen |
| /admin/billing | No | Build Billing inside `/` (below), then delete legacy page |
| /super, /super/restaurants, /super/users, /super/settings | Yes, richer in `/` | Delete legacy page, route points at `/` screen |
| /super/plans | Partly | Extend Hap Control plans with subscription/manual-grant model, then delete legacy page |
| /menu/:slug | Partly (Preview mode) | Rebuilt as a standalone public context reusing the shared menu components; unknown slug → public "Menu not found" |

Legacy code is used only as a checklist of features to preserve — never as a design reference.

### 3. Billing inside `/` (new, built in the prototype's design language)

Reachable from Admin → More → Billing and at `/admin/billing`.

- **Current plan** card: plan name, status, "Active until 1 September 2027", billing interval.
- **Subscription**: change plan, manage subscription.
- **Payment method**: card on file, update payment method.
- **Invoices / billing history**: list with dates, amounts, status, view action.
- Actions that need a real provider are clearly non-functional placeholders. No Stripe/PayPal, no real invoice generation.

### 4. Subscription data model (frontend state / mock data)

A subscription record shaped for a future database and payment provider:

```text
subscription: {
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'expired',
  accessSource: 'trial' | 'manual' | 'billing',   // how access was obtained
  plan: 'starter' | 'growth' | 'scale',
  startedAt, endsAt,          // ISO dates; endsAt null = lifetime
  billingInterval: 'monthly' | 'yearly' | null,   // null when access is manual
  grant: { grantedBy, grantedAt, reason, duration } | null

}
```

- Every restaurant in Hap Control carries this record; the Admin Billing screen reads the current restaurant's.
- `status` describes the lifecycle of access; `accessSource` describes where it came from. A manually granted account is e.g. `status: 'active'`, `accessSource: 'manual'`, with the grant metadata retained — so manual access is never confused with a paid subscription.
- Hap Control → Restaurants detail and Plans gain **Grant access** with durations: 7 days, 1 month, 3 months, 6 months, 1 year, custom end date, lifetime — plus status/plan change and expiry display.
- Expiry is computed from `endsAt`, so access state is already expiration-based in the UI.


### 5. Navigation clarity

- One entry point at `/`, one shell, one bottom navigation. Admin, Guest Preview and Hap Control remain the three top-level modes exactly as designed today.
- Billing sits under More with Analytics / Settings / Appearance, so a first-time restaurant owner finds it where the other account topics live.

## Technical notes

- Route files under `src/routes/` are reduced to thin wrappers that mount the master application with a target screen; `src/routes/admin.*.tsx` and `src/routes/super.*.tsx` page bodies, plus their shared shell components, are removed.
- Routing is pathname-driven end to end: the requested path is handed to the master application on load and kept in sync with the History API afterwards; fragments are only read once for legacy `#preview` / `#admin` links.
- Not-found handling is scoped per section (public menu, admin, super, global 404) rather than a single redirect.
- Billing and subscription logic live in the prototype's own state module alongside the existing Hap Control data, persisted in local storage like the rest of the mock data. No backend in this step.

