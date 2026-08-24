import { useEffect, useRef, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

type HapAppProps = {
  /** Canonical pathname of the screen to open, e.g. "/admin/menu". */
  path: string;
  /** Public menu context: no admin shell, no mode switch, no editor controls. */
  publicContext?: boolean;
  /** Restaurant slug, used only in the public menu context. */
  slug?: string;
  title?: string;
};

/**
 * Mounts the Hap master application on a given screen.
 *
 * Routing is pathname based: the requested path is handed to the application on
 * load and kept in sync afterwards. Navigation performed inside the application
 * is reported back so the browser URL always matches the visible screen.
 */
export function HapApp({ path, publicContext = false, slug, title = "Hap" }: HapAppProps) {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastSent = useRef(path);
  const [src] = useState(
    () =>
      `/hap/index.html?p=${encodeURIComponent(path)}${
        publicContext ? `&ctx=public${slug ? `&slug=${encodeURIComponent(slug)}` : ""}` : ""
      }`,
  );


  // Push route changes that happened outside the app (links, back/forward).
  useEffect(() => {
    if (publicContext) return;
    if (lastSent.current === path) return;
    lastSent.current = path;
    frameRef.current?.contentWindow?.postMessage({ type: "hap:route", path }, window.location.origin);
  }, [path, publicContext]);

  // Receive navigation performed inside the app.
  useEffect(() => {
    if (publicContext) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; path?: string } | null;
      if (!data || data.type !== "hap:navigate" || typeof data.path !== "string") return;
      const next = data.path;
      if (next === pathname) return;
      lastSent.current = next;
      void router.navigate({ to: next, replace: false });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router, pathname, publicContext]);

  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none">
      <iframe
        ref={frameRef}
        src={src}
        title={title}
        className="h-full w-full border-0"
        onLoad={() => {
          if (publicContext) return;
          lastSent.current = path;
          frameRef.current?.contentWindow?.postMessage(
            { type: "hap:route", path },
            window.location.origin,
          );
        }}
      />
    </div>
  );
}
