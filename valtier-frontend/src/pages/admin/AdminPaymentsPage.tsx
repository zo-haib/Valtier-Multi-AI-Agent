import { Banknote, FileText, Download } from "lucide-react";

export function AdminPaymentsPage() {
  const invoices = [
    { id: "INV-2026-001", user: "Acme Corp", amount: "$149.00", status: "Paid", date: "Oct 01, 2026" },
    { id: "INV-2026-002", user: "Globex", amount: "$49.00", status: "Paid", date: "Oct 02, 2026" },
    { id: "INV-2026-003", user: "Initech", amount: "$49.00", status: "Failed", date: "Oct 03, 2026" },
    { id: "INV-2026-004", user: "Stark Ind.", amount: "$1,250.00", status: "Paid", date: "Oct 04, 2026" },
    { id: "INV-2026-005", user: "Wayne Ent.", amount: "$149.00", status: "Pending", date: "Oct 05, 2026" },
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <Banknote className="w-8 h-8 text-valtier-emerald" />
          Payments & Invoices
        </h1>
        <p className="text-valtier-muted">Review transactions and revenue stream. Payment provider: Stripe (Lemon Squeezy not integrated yet).</p>
      </div>

      <div className="flex items-center gap-4">
        <select className="bg-valtier-surface border border-valtier-border text-white px-4 py-2 rounded-lg focus:outline-none text-sm">
          <option>All Statuses</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Failed</option>
        </select>
        <select className="bg-valtier-surface border border-valtier-border text-white px-4 py-2 rounded-lg focus:outline-none text-sm">
          <option>Last 30 Days</option>
          <option>Last Quarter</option>
          <option>Year to Date</option>
        </select>
      </div>

      <div className="glass rounded-2xl border border-valtier-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-valtier-surface/50 border-b border-valtier-border">
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-valtier-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-valtier-border/50 hover:bg-valtier-surface/30">
                <td className="px-6 py-4 font-mono text-sm text-valtier-muted">{inv.id}</td>
                <td className="px-6 py-4 font-bold text-white">{inv.user}</td>
                <td className="px-6 py-4 text-sm font-bold text-white">{inv.amount}</td>
                <td className="px-6 py-4 text-sm text-valtier-muted">{inv.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-valtier-emerald/20 text-valtier-emerald' : inv.status === 'Failed' ? 'bg-valtier-rose/20 text-valtier-rose' : 'bg-valtier-amber/20 text-valtier-amber'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-1.5 bg-valtier-surface rounded-md border border-valtier-border hover:bg-valtier-border text-valtier-muted hover:text-white" title="View PDF">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 bg-valtier-surface rounded-md border border-valtier-border hover:bg-valtier-border text-valtier-muted hover:text-white" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
