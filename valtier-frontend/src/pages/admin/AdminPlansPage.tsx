import { useState } from "react";
import { Edit2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

const INITIAL_PLANS = [
  { id: "free", name: "Explorer", monthlyPrice: "Free", aiCredits: "100", rag: false, memory: false, api: false },
  { id: "pro", name: "Pro", monthlyPrice: "49", aiCredits: "1,000", rag: true, memory: true, api: true },
  { id: "business", name: "Business", monthlyPrice: "149", aiCredits: "10,000", rag: true, memory: true, api: true },
  { id: "enterprise", name: "Enterprise", monthlyPrice: "Custom", aiCredits: "Unlimited", rag: true, memory: true, api: true },
];

export function AdminPlansPage() {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [editing, setEditing] = useState<any>(null);

  const save = () => {
    if (editing) {
      setPlans(prev => prev.map(p => p.id === editing.id ? editing : p));
      setEditing(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Plans & Pricing</h1>
        <p className="text-valtier-muted">Manage subscription tiers, limits, and features.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="glass p-6 rounded-2xl border border-valtier-border relative">
            <button 
              onClick={() => setEditing(plan)}
              className="absolute top-4 right-4 p-2 bg-valtier-surface rounded-lg text-valtier-muted hover:text-white"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-white mb-6">
              {plan.monthlyPrice !== "Free" && plan.monthlyPrice !== "Custom" ? "$" : ""}{plan.monthlyPrice}
              {plan.monthlyPrice !== "Free" && plan.monthlyPrice !== "Custom" && <span className="text-sm text-valtier-muted font-normal">/mo</span>}
            </div>
            
            <div className="space-y-3 pt-4 border-t border-valtier-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-valtier-muted">AI Credits</span>
                <span className="font-bold text-white">{plan.aiCredits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-valtier-muted">RAG Support</span>
                <span className="font-bold text-white">{plan.rag ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-valtier-muted">Memory</span>
                <span className="font-bold text-white">{plan.memory ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-valtier-muted">API Access</span>
                <span className="font-bold text-white">{plan.api ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal open={true} onClose={() => setEditing(null)} title={`Edit ${editing.name} Plan`}>
          <div className="flex flex-col gap-4 p-2">
            <Input label="Monthly Price" value={editing.monthlyPrice} onChange={(e) => setEditing({...editing, monthlyPrice: e.target.value})} />
            <Input label="AI Credits" value={editing.aiCredits} onChange={(e) => setEditing({...editing, aiCredits: e.target.value})} />
            
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" checked={editing.rag} onChange={(e) => setEditing({...editing, rag: e.target.checked})} /> RAG Support
            </label>
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" checked={editing.memory} onChange={(e) => setEditing({...editing, memory: e.target.checked})} /> Memory Support
            </label>
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" checked={editing.api} onChange={(e) => setEditing({...editing, api: e.target.checked})} /> API Access
            </label>

            <button onClick={save} className="mt-4 bg-valtier-accent text-white py-2 rounded-xl font-bold">Save Changes</button>
            <p className="text-xs text-valtier-muted text-center mt-2">Changes will be recorded in audit logs.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
