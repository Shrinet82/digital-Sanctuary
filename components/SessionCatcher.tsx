"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Catches Supabase's *default* email-confirmation flow.
 *
 * Supabase's stock template sends users to the project's verify endpoint,
 * which then redirects back to the Site URL with the session in the URL
 * hash (#access_token=...). The browser client picks that up and writes
 * it to cookies; we then forward the user to their dashboard.
 *
 * This means email confirmation works with zero email-template edits.
 * Renders nothing unless it actually catches a session.
 */
export function SessionCatcher() {
  const router = useRouter();
  const [caught, setCaught] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.includes("access_token") && !hash.includes("error")) return;

    // Surface an error from the confirmation link, if any.
    if (hash.includes("error")) {
      const params = new URLSearchParams(hash.slice(1));
      const description =
        params.get("error_description") ?? "That link didn't work.";
      router.replace(`/login?message=${encodeURIComponent(description)}`);
      return;
    }

    setCaught(true);
    const supabase = createClient();

    // The browser client parses the hash and persists the session to cookies.
    supabase.auth.getSession().then(({ data }) => {
      // Clean the tokens out of the address bar either way.
      window.history.replaceState(null, "", window.location.pathname);
      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setCaught(false);
      }
    });
  }, [router]);

  if (!caught) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/90 backdrop-blur-sm p-6">
      <div className="ds-card text-center max-w-sm">
        <p className="font-display font-extrabold text-lg mb-1">
          ✦ Email confirmed
        </p>
        <p className="text-sm text-ink-soft m-0">Taking you to your space…</p>
      </div>
    </div>
  );
}
