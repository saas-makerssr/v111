# Connectivity audit: admin + superadmin

I went through every admin and superadmin screen and checked which controls actually do something. Navigation is complete — every tab, More-sheet link, and the Admin/Control switchers all point to real pages. What's missing is a set of buttons that look active but currently do nothing.

## Dead buttons found

Admin
- Settings: "Save profile", "Save languages/hours", and the logo "Upload" button do nothing.
- QR Codes: the PNG/SVG/PDF download buttons and "Save link" (short link) do nothing. Print and both Copy buttons work.
- Analytics: "Export" does nothing; the range chips work.
- Billing: "Update payment method", "Download invoice" (each row), and the top-right action do nothing. Plan switching works.
- Menu: the dashed "+ New menu" chip and the category "+" chip do nothing; item editing, duplicate, bulk actions and delete all work.
- Dashboard: setup checklist, "Go" links and stats all work.

Superadmin
- Platform settings: "Save defaults" and "Save banner" do nothing; the switches work locally.
- Restaurants: "Open workspace" goes to the generic `/admin` for every row, so it doesn't carry the restaurant context. Suspend/delete and the guest-menu link work.
- Plans / Users: fully wired.

## Proposed fix (frontend only, still mock data)

1. Give every currently-dead button a real local action plus a toast confirmation (sonner), so the prototype behaves consistently:
   - Save buttons: persist to local component state and show "Saved" toast.
   - QR downloads: generate and download the QR as PNG/SVG client-side; PDF falls back to print.
   - Analytics export: download the visible table as CSV.
   - Billing: "Download invoice" produces a simple generated invoice file; "Update payment method" opens a dialog with card fields that closes with a toast.
   - Menu: "+ New menu" and category "+" open a small inline dialog that adds the entry to local state.
   - Settings logo upload: file picker that previews the chosen image.
2. Superadmin "Open workspace": link to `/admin` with the restaurant id as a search param and show that restaurant's name in the admin header, so the context carries across.
3. Mount `<Toaster />` once in the root route (it isn't mounted today) so the confirmations show up.

## Technical notes

- All changes stay in `src/routes/*.tsx` plus one line in `src/routes/__root.tsx`; no backend, no schema.
- Use `sonner` via `@/components/ui/sonner` for toasts.
- QR/CSV/invoice downloads use a client-side Blob + object URL, no new dependency beyond the QR renderer already used on the QR page.
- Restaurant context passed as a router search param, read in `src/routes/admin.tsx` for the header subtitle.
