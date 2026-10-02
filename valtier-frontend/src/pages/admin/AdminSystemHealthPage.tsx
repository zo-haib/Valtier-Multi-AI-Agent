import { Server, Activity, Database, CheckCircle, AlertTriangle } from "lucide-react";

export function AdminSystemHealthPage() {
  const services = [
    { name: "API Gateway", status: "healthy", latency: "45ms", uptime: "99.99%" },
    { name: "Database (Postgres)", status: "healthy", latency: "12ms", uptime: "99.99%" },
    { name: "AI Engine (OpenAI)", status: "degraded", latency: "1200ms", uptime: "98.50%" },
    { name: "Stripe Billing", status: "healthy", latency: "110ms", uptime: "100%" },
    { name: "Vector DB (Pinecone)", status: "healthy", latency: "85ms", uptime: "99.95%" },
    { name: "Redis Cache", status: "healthy", latency: "2ms", uptime: "100%" },
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <Server className="w-8 h-8 text-valtier-accent" />
          System Health
        </h1>
        <p className="text-valtier-muted">Monitor infrastructure and external dependencies.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-valtier-border relative">
            <div className="absolute top-6 right-6">
              {service.status === "healthy" ? (
                <CheckCircle className="w-5 h-5 text-valtier-emerald" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-valtier-amber animate-pulse" />
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-valtier-surface border border-valtier-border flex items-center justify-center">
                {service.name.includes("Database") || service.name.includes("Vector") ? (
                  <Database className="w-5 h-5 text-valtier-muted" />
                ) : (
                  <Activity className="w-5 h-5 text-valtier-muted" />
                )}
              </div>
              <h3 className="font-bold text-white">{service.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-valtier-border/50">
              <div>
                <div className="text-xs text-valtier-muted uppercase tracking-wider mb-1">Latency</div>
                <div className={`font-mono text-lg font-bold ${service.status === 'degraded' ? 'text-valtier-amber' : 'text-white'}`}>
                  {service.latency}
                </div>
              </div>
              <div>
                <div className="text-xs text-valtier-muted uppercase tracking-wider mb-1">Uptime</div>
                <div className="font-mono text-lg font-bold text-white">{service.uptime}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-6 rounded-2xl border border-valtier-border mt-4">
        <h2 className="text-lg font-bold text-white mb-4">Cost Metrics (Month to Date)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-valtier-surface p-4 rounded-xl border border-valtier-border text-center">
            <div className="text-sm text-valtier-muted mb-1">Total AI Spend</div>
            <div className="text-2xl font-bold text-white">$4,250.40</div>
          </div>
          <div className="bg-valtier-surface p-4 rounded-xl border border-valtier-border text-center">
            <div className="text-sm text-valtier-muted mb-1">API Requests</div>
            <div className="text-2xl font-bold text-white">1.2M</div>
          </div>
          <div className="bg-valtier-surface p-4 rounded-xl border border-valtier-border text-center">
            <div className="text-sm text-valtier-muted mb-1">Error Rate</div>
            <div className="text-2xl font-bold text-valtier-emerald">0.04%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
