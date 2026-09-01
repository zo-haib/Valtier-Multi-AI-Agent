import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { GlassCard } from "../../components/ui/GlassCard";
import { login } from "../../services/authApi";
import { useToast } from "../../components/ui/Toast";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast("Welcome back.", "success");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-brand-cream text-brand-dark lg:grid-cols-2">
      {/* Left: branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-brand-dark/10 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 " />
        <Link to="/" className="relative flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark border border-brand-dark/10 font-helvetica-neue text-xs">
            A
          </span>
          <span className="text-lg font-medium tracking-tight">Valtier</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-medium leading-tight tracking-tight">
            Your AI workforce for complex business operations.
          </h2>
          <p className="mt-4 max-w-sm text-brand-dark/50">
            Sign in to coordinate your specialized agents and pick up right where you left off.
          </p>
        </div>
        <p className="relative text-xs text-brand-dark/30">© 2026 Valtier</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <GlassCard padding="lg">
            <h1 className="text-xl font-medium">Welcome back</h1>
            <p className="mt-1 text-sm text-brand-dark/50">Sign in to your Valtier workspace.</p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                id="email"
                label="Email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end">
                <Link to="#" className="text-xs text-brand-dark/50 hover:text-brand-dark">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-brand-dark/5" />
              <span className="text-xs text-brand-dark/30">or</span>
              <div className="h-px flex-1 bg-brand-dark/5" />
            </div>
            <Button variant="secondary" className="mt-4 w-full">
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-sm text-brand-dark/50">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-brand-dark hover:underline">
                Create one
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
