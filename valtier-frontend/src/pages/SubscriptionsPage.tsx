import { useEffect, useState } from "react";
import { Check, Loader2, CreditCard, ExternalLink } from "lucide-react";
import { LoadingState } from "../components/ui/Feedback";
import { UsageBar } from "../components/ui/UsageBar";
import { createCheckoutSession, getMySubscription, listPlans } from "../services/subscriptionApi";
import type { PlanFeature } from "../types";
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
      showToast("This plan isn't connected to a Stripe price yet.", "error");
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
    <div className="flex flex-col gap-10 h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2 mb-2">
            <CreditCard className="w-8 h-8 text-valtier-emerald" />
            Billing & Plans
          </h1>
          <p className="text-valtier-muted">Manage your subscription and AI credit usage.</p>
        </div>
        <div className="w-full md:w-96">
           <UsageBar used={1842} total={5000} label="AI Credits (Billing Cycle)" resetsInDays={12} className="bg-valtier-surface border-valtier-border" />
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-valtier-border">
        <h2 className="text-lg font-bold text-white mb-6">Current Plan Details</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-valtier-surface p-5 rounded-xl border border-valtier-border">
            <div className="text-xs text-valtier-muted uppercase tracking-wider mb-1">Active Plan</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              Pro <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-valtier-emerald/20 text-valtier-emerald border border-valtier-emerald/20 uppercase tracking-normal">Active</span>
            </div>
          </div>
          <div className="bg-valtier-surface p-5 rounded-xl border border-valtier-border">
            <div className="text-xs text-valtier-muted uppercase tracking-wider mb-1">Billing Amount</div>
            <div className="text-2xl font-bold text-white">$49.00 <span className="text-sm font-normal text-valtier-muted">/ month</span></div>
          </div>
          <div className="bg-valtier-surface p-5 rounded-xl border border-valtier-border">
            <div className="text-xs text-valtier-muted uppercase tracking-wider mb-1">Next Invoice</div>
            <div className="text-2xl font-bold text-white">Oct 14, 2026</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="text-sm font-medium text-valtier-muted hover:text-white flex items-center gap-2 transition-colors">
            Manage via Stripe <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Available Plans</h2>
          <p className="text-valtier-muted mb-6">Upgrade to unlock more agents, memory, and credits.</p>
          <div className="inline-flex bg-valtier-surface p-1 rounded-xl border border-valtier-border">
            <button 
              onClick={() => setYearly(false)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${!yearly ? 'bg-valtier-card text-white shadow-sm' : 'text-valtier-muted hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setYearly(true)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${yearly ? 'bg-valtier-card text-white shadow-sm' : 'text-valtier-muted hover:text-white'}`}
            >
              Yearly <span className="px-2 py-0.5 rounded-md bg-valtier-emerald/20 text-valtier-emerald text-[10px] uppercase">Save 20%</span>
            </button>
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
                <div
                  key={plan.id}
                  className={`glass p-8 rounded-2xl flex flex-col gap-6 relative transition-all ${plan.highlighted ? 'border-valtier-accent shadow-glow-md transform lg:-translate-y-4' : 'border-valtier-border'}`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-valtier-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Recommended
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-end gap-1 text-white">
                      {price === null ? (
                        <span className="text-4xl font-bold">Custom</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">${price}</span>
                          <span className="mb-1 text-sm text-valtier-muted">/{yearly ? "yr" : "mo"}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isCurrent || checkingOut === plan.id}
                    onClick={() => (plan.id === "enterprise" ? undefined : handleUpgrade(plan))}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${isCurrent ? 'bg-valtier-surface text-valtier-muted border border-valtier-border cursor-not-allowed' : plan.highlighted ? 'bg-valtier-accent hover:bg-valtier-accent-hover text-white shadow-glow-sm' : 'bg-valtier-card hover:bg-valtier-surface border border-valtier-border text-white'}`}
                  >
                    {checkingOut === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCurrent ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade Plan"}
                  </button>

                  <ul className="flex flex-1 flex-col gap-3 pt-6 border-t border-valtier-border/50">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-valtier-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-valtier-emerald" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
