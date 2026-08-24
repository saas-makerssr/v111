/**
 * Route map for the Hap master application.
 *
 * Every URL of the product resolves to a screen inside the single application
 * served from /hap. These lists are the shared source of truth used both by the
 * TanStack routes (for not-found handling) and by the application's own router.
 */

export const ADMIN_SCREENS = [
  "menu",
  "promotions",
  "design",
  "qr",
  "analytics",
  "settings",
  "billing",
  "staff",
  "appearance",
  "more",
] as const;


export const SUPER_SCREENS = ["restaurants", "users", "plans", "settings"] as const;

export const RESTAURANT_SLUGS = ["sofra", "bella", "marina", "kinema", "garden"] as const;

export const RESTAURANT_NAMES: Record<string, string> = {
  sofra: "Sofra",
  bella: "Bella Napoli",
  marina: "Marina",
  kinema: "Kinema Bistro",
  garden: "Garden 21",
};

export type AdminScreen = (typeof ADMIN_SCREENS)[number];
export type SuperScreen = (typeof SUPER_SCREENS)[number];

export function isAdminScreen(value: string): value is AdminScreen {
  return (ADMIN_SCREENS as readonly string[]).includes(value);
}

export function isSuperScreen(value: string): value is SuperScreen {
  return (SUPER_SCREENS as readonly string[]).includes(value);
}

export function isRestaurantSlug(value: string): boolean {
  return (RESTAURANT_SLUGS as readonly string[]).includes(value);
}
