import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { GlassCard } from "../../components/ui/GlassCard";
import { signup } from "../../services/authApi";
import { useToast } from "../../components/ui/Toast";

export function SignupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup(fullName, email, password);
      showToast("Workspace created. Welcome to Valtier.", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12 text-brand-dark">
      <div className="pointer-events-none fixed inset-0 " />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark border border-brand-dark/10 font-helvetica-neue text-xs">
            A
          </span>
          <span className="text-lg font-medium tracking-tight">Valtier</span>
        </Link>

        <GlassCard padding="lg">
          <h1 className="text-xl font-medium">Create your Valtier workspace</h1>
          <p className="mt-1 text-sm text-brand-dark/50">Set up your AI workforce in under a minute.</p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              id="fullName"
              label="Full name"
              required
              placeholder="Muhammad Zohaib"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              id="email"
              label="Work email"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="company"
              label="Company (optional)"
              placeholder="Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="password"
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                id="confirmPassword"
                label="Confirm"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create workspace
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-brand-dark/40">
            By creating a workspace you agree to Valtier&apos;s Terms of Service and Privacy Policy.
          </p>

          <p className="mt-4 text-center text-sm text-brand-dark/50">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-dark hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
