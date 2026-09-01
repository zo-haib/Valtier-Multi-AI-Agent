import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { checkSession } from "../../services/authApi";

/**
 * Wraps user/admin route groups so visiting /dashboard, /admin, etc.
 * directly without a valid session bounces to /login instead of
 * silently rendering.
 *
 * Auth tokens now live in httpOnly cookies (never in localStorage —
 * see client.ts/authApi.ts), so there is no client-readable flag to
 * check synchronously anymore. This asks the backend once via
 * GET /auth/me and holds a brief "checking" state while that's in
 * flight, rather than assuming "no token in localStorage" means
 * logged-out (which used to be checked synchronously and could go
 * stale — e.g. after the cookie expired — without ever revalidating,
 * which is the redirect-loop / stale-session class of bug this
 * replaces).
 */
export function RequireAuth() {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    let cancelled = false;
    checkSession().then((user) => {
      if (cancelled) return;
      setStatus(user ? "authenticated" : "unauthenticated");
    });
    return () => {
      cancelled = true;
    };
    // Intentionally checked once per mount of the protected shell, not
    // on every nested navigation — RequireAuth wraps the whole
    // protected route group as a single parent element, so it doesn't
    // remount when moving between e.g. /dashboard and /agents. Re-
    // checking on every click would flash a loading state on every
    // navigation for no benefit; if the session expires mid-visit,
    // the individual page's own API calls will surface a 401 instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "checking") {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-cream text-brand-dark/40 font-helvetica-neue">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
