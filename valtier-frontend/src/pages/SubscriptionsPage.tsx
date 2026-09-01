import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/Feedback";
import { createCheckoutSession, getMySubscription, listPlans } from "../services/subscriptionApi";
import type { PlanFeature } from "../types";
import { cn } from "../lib/cn";
import { useToast } from "../components/ui/Toast";

export function SubscriptionsPage() {
  const { showToast } = useToast();
  const [yearly, setYearly] = useState(false);
  const [plans, setPlans] = useState<PlanFeature[] | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanFeature["id"] | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listPlans(), getMySubscription()])
      .then(([plansList, subscription]) => {
        setPlans(plansList);
        setCurrentPlan(subscription.plan);
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Could not load billing info.", "error");
        setPlans([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpgrade(plan: PlanFeature) {
    const priceId = yearly ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
    if (!priceId) {
      showToast("This plan isn't connected to a Stripe price yet — set the price ID env vars on the backend.", "error");
      return;
    }
    setCheckingOut(plan.id);
    try {
      const { checkoutUrl } = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not start checkout.", "error");
    } finally {
      setCheckingOut(null);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          Choose the right AI workforce for your business.
        </h1>
        <p className="mt-2 text-brand-dark/50">Scale usage as your operations grow.</p>

        <div className="mx-auto mt-6 flex w-fit items-center gap-1 rounded-full border border-brand-dark/10 bg-brand-light p-1">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setYearly(cycle === "yearly")}
              className="relative rounded-full px-4 py-1.5 text-sm capitalize text-brand-dark/70"
            >
              {((cycle === "yearly") === yearly) && (
                <motion.span
                  layoutId="billing-toggle"
                  className="absolute inset-0 rounded-full bg-white/15"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{cycle === "yearly" ? "Yearly · save 17%" : "Monthly"}</span>
            </button>
          ))}
        </div>
      </div>

      {!plans ? (
        <LoadingState label="Loading plans…" />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isCurrent = plan.id === currentPlan;
            return (
              <GlassCard
                key={plan.id}
                padding="lg"
                hover
                className={cn(
                  "flex flex-col gap-6",
                  plan.highlighted && "border-brand-dark/25 bg-brand-light "
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{plan.name}</h3>
                    {plan.highlighted && (
                      <span className="rounded-full border border-brand-dark/20 bg-brand-dark/5 px-2.5 py-0.5 text-xs">Popular</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    {price === null ? (
                      <span className="font-helvetica-neue text-3xl">Custom</span>
                    ) : (
                      <>
                        <span className="font-helvetica-neue text-3xl">${price}</span>
                        <span className="mb-1 text-sm text-brand-dark/40">/{yearly ? "year" : "month"}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-brand-dark/70">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-dark/40" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? "secondary" : plan.highlighted ? "primary" : "secondary"}
                  disabled={isCurrent || checkingOut === plan.id}
                  className="w-full"
                  onClick={() => (plan.id === "enterprise" ? undefined : handleUpgrade(plan))}
                >
                  {checkingOut === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCurrent ? "Current plan" : plan.id === "enterprise" ? "Contact sales" : "Upgrade"}
                </Button>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
