import { createFileRoute } from "@tanstack/react-router";
import { HapApp } from "@/components/hap-app";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Guest Preview — Hap" },
      {
        name: "description",
        content: "See your digital menu exactly as guests see it, in the live guest preview.",
      },
      { property: "og:title", content: "Guest Preview — Hap" },
      {
        property: "og:description",
        content: "See your digital menu exactly as guests see it, in the live guest preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <HapApp path="/preview" title="Hap Guest Preview" />,
});
