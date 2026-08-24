import { createFileRoute } from "@tanstack/react-router";
import { HapApp } from "@/components/hap-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hap — Digital Menus for Restaurants" },
      {
        name: "description",
        content:
          "Hap is the digital menu platform for restaurants: manage your menu, promotions, QR codes, analytics and billing from one app.",
      },
      { property: "og:title", content: "Hap — Digital Menus for Restaurants" },
      {
        property: "og:description",
        content:
          "Manage your menu, promotions, QR codes, analytics and billing from one app, and preview exactly what guests see.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <HapApp path="/" title="Hap" />,
});
