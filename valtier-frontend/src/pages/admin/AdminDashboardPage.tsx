import { LayoutGrid, Users, CreditCard, Activity, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Mon', revenue: 4000, users: 240 },
  { name: 'Tue', revenue: 3000, users: 139 },
  { name: 'Wed', revenue: 2000, users: 980 },
  { name: 'Thu', revenue: 2780, users: 390 },
  { name: 'Fri', revenue: 1890, users: 480 },
  { name: 'Sat', revenue: 2390, users: 380 },
  { name: 'Sun', revenue: 3490, users: 430 },
];

export function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <LayoutGrid className="w-8 h-8 text-valtier-accent" />
          Platform Overview
        </h1>
        <p className="text-valtier-muted">Key metrics and system performance across Valtier.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-valtier-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-16 h-16 text-white" />
          </div>
          <p className="text-sm font-bold text-valtier-muted uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-4xl font-bold text-white mb-4">12,482</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-valtier-emerald"><ArrowUpRight className="w-4 h-4" /> 12%</span>
            <span className="text-valtier-muted">vs last month</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-valtier-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="w-16 h-16 text-white" />
          </div>
          <p className="text-sm font-bold text-valtier-muted uppercase tracking-wider mb-2">Monthly Recurring Revenue</p>
          <p className="text-4xl font-bold text-white mb-4">$84,200</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-valtier-emerald"><ArrowUpRight className="w-4 h-4" /> 8%</span>
            <span className="text-valtier-muted">vs last month</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-valtier-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-16 h-16 text-white" />
          </div>
          <p className="text-sm font-bold text-valtier-muted uppercase tracking-wider mb-2">AI Tasks Today</p>
          <p className="text-4xl font-bold text-white mb-4">42.5K</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-valtier-emerald"><ArrowUpRight className="w-4 h-4" /> 24%</span>
            <span className="text-valtier-muted">vs yesterday</span>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-valtier-border h-[400px]">
        <h2 className="text-lg font-bold text-white mb-6">Revenue & User Growth</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
            <XAxis dataKey="name" stroke="#8b9cb5" />
            <YAxis stroke="#8b9cb5" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d1526', borderColor: '#1e2d45', borderRadius: '12px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
