import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { HapApp } from "@/components/hap-app";
import { isAdminScreen } from "@/lib/hap-routes";

const TITLES: Record<string, [string, string]> = {
  menu: ["Menu — Hap Admin", "Add dishes, categories, photos and prices for your digital menu."],
  promotions: ["Promotions — Hap Admin", "Feature a dish or take over a category, tastefully."],
  design: ["Design — Hap Admin", "Pick a template, colour and background for your guest menu."],
  qr: ["QR Codes — Hap Admin", "Download and share the QR code that opens your menu."],
  analytics: ["Analytics — Hap Admin", "Scans, most viewed dishes and guest languages."],
  settings: ["Settings — Hap Admin", "Restaurant profile, opening hours, languages and payments."],
  billing: ["Billing — Hap Admin", "Your plan, subscription, payment method and invoices."],
  staff: ["Staff — Hap Admin", "Team roles and access for your restaurant."],
  appearance: ["Appearance — Hap Admin", "Template, colour and background of your public menu."],
};

export const Route = createFileRoute("/admin/$")({
  loader: ({ params }) => {
    const screen = (params._splat ?? "").replace(/\/+$/, "");
    if (!isAdminScreen(screen)) throw notFound();
    return { screen };
  },
  head: ({ params }) => {
    const screen = (params._splat ?? "").replace(/\/+$/, "");
    const [title, description] = TITLES[screen] ?? [
      "Not found — Hap Admin",
      "This admin screen does not exist.",
    ];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        ...(TITLES[screen] ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: AdminNotFound,
  component: AdminScreenRoute,
});

function AdminScreenRoute() {
  const { screen } = Route.useLoaderData();
  return <HapApp path={`/admin/${screen}`} title="Hap Admin" />;
}

function AdminNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Hap Admin
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">This admin page doesn't exist</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The screen you tried to open isn't part of the admin experience.
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
