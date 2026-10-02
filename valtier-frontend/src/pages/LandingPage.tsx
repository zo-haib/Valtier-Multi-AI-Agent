import { Link } from 'react-router-dom';
import { 
  Bot, 
  Brain, 
  Code, 
  Database, 
  Globe, 
  LineChart, 
  MessageSquare, 
  Search, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-valtier-bg text-valtier-text font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-valtier-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-valtier flex items-center justify-center">
              <Bot className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">VALTIER</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#how-it-works" className="text-valtier-muted hover:text-white transition-colors">How it works</a>
            <a href="#workforce" className="text-valtier-muted hover:text-white transition-colors">AI Workforce</a>
            <a href="#pricing" className="text-valtier-muted hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-valtier-text hover:text-white">Sign In</Link>
            <Link to="/signup" className="text-sm font-medium bg-valtier-accent hover:bg-valtier-accent-hover text-white px-5 py-2.5 rounded-lg transition-all shadow-glow-sm hover:shadow-glow-md">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-valtier-accent opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-valtier-border mb-6">
              <span className="w-2 h-2 rounded-full bg-valtier-emerald animate-pulse"></span>
              <span className="text-xs font-medium text-valtier-emerald">Valtier Engine v2.0 Live</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
              AI Workforce. <br />
              <span className="gradient-text">Orchestrated.</span>
            </h1>
            <p className="text-lg text-valtier-muted mb-8 max-w-xl leading-relaxed">
              Deploy autonomous AI agents that collaborate, share memory, and execute complex workflows across your enterprise. The ultimate command center for the modern AI workforce.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto text-center bg-valtier-accent hover:bg-valtier-accent-hover text-white px-8 py-4 rounded-xl font-medium transition-all shadow-glow-md hover:shadow-glow-lg flex items-center justify-center gap-2">
                Start Orchestrating <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-full sm:w-auto text-center glass hover:bg-valtier-surface px-8 py-4 rounded-xl font-medium transition-all border border-valtier-border flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Orchestrator Animation */}
          <div className="relative h-[500px] animate-fade-in z-10 flex items-center justify-center">
            <div className="absolute w-full h-full animate-spin-slow opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-valtier-accent border-dashed"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-valtier-purple border-dashed"></div>
            </div>
            
            {/* Center Orchestrator */}
            <div className="relative z-20 w-32 h-32 rounded-2xl bg-gradient-valtier p-1 shadow-glow-lg">
              <div className="w-full h-full bg-valtier-card rounded-xl flex items-center justify-center flex-col gap-2">
                <Brain className="w-10 h-10 text-white" />
                <span className="text-xs font-bold text-white">ORCHESTRATOR</span>
              </div>
            </div>

            {/* Orbiting Agents */}
            {[Code, Search, Database, LineChart, Globe, MessageSquare].map((Icon, i) => (
              <div key={i} className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6" 
                   style={{
                     animation: `orbit 10s linear infinite`,
                     animationDelay: `-${i * 1.66}s`,
                   }}>
                <div className="w-full h-full bg-valtier-surface rounded-xl border border-valtier-border flex items-center justify-center shadow-card shadow-valtier-accent/20">
                  <Icon className="w-5 h-5 text-valtier-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-y border-valtier-border bg-valtier-surface/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-8 md:gap-16 text-sm font-medium text-valtier-muted">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-valtier-emerald" /> 1,842 tasks completed</div>
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-valtier-amber" /> 97.8% success rate</div>
          <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-valtier-accent" /> 6 specialized AI agents</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-valtier-purple" /> Enterprise-grade security</div>
        </div>
      </div>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Command your digital workforce</h2>
            <p className="text-valtier-muted max-w-2xl mx-auto">From single tasks to complex autonomous workflows, Valtier makes it easy to orchestrate multiple agents to achieve your goals.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: "1. Define the Mission", desc: "Simply state your goal in natural language. The Orchestrator analyzes the requirement." },
              { icon: Cpu, title: "2. Automatic Delegation", desc: "The Orchestrator intelligently assigns subtasks to the most capable specialized agents." },
              { icon: CheckCircle2, title: "3. Execution & Synthesis", desc: "Agents work in parallel, share context via memory, and deliver a synthesized result." }
            ].map((step, i) => (
              <div key={i} className="glass p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-valtier-surface border border-valtier-border flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-valtier-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-valtier-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workforce Section */}
      <section id="workforce" className="py-24 px-6 bg-valtier-surface/30 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet your AI Workforce</h2>
            <p className="text-valtier-muted max-w-2xl mx-auto">Purpose-built agents with specific capabilities, ready to collaborate on your toughest challenges.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Researcher", role: "Web & Data Gathering", icon: Search, color: "text-blue-400" },
              { name: "Coder", role: "Software Engineering", icon: Code, color: "text-purple-400" },
              { name: "Analyst", role: "Data Processing", icon: LineChart, color: "text-emerald-400" },
              { name: "Writer", role: "Content Creation", icon: MessageSquare, color: "text-amber-400" },
              { name: "Manager", role: "Project Coordination", icon: Brain, color: "text-rose-400" },
              { name: "Integrator", role: "API & Systems", icon: Database, color: "text-indigo-400" },
            ].map((agent, i) => (
              <div key={i} className="glass p-6 rounded-2xl hover:shadow-glow-sm hover:border-valtier-accent/50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-valtier-surface border border-valtier-border flex items-center justify-center group-hover:scale-110 transition-transform ${agent.color}`}>
                    <agent.icon className="w-6 h-6" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-valtier-emerald bg-valtier-emerald/10 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-valtier-emerald animate-pulse"></span> Online
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">{agent.name}</h3>
                <p className="text-sm text-valtier-muted">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Scale your intelligence</h2>
            <p className="text-valtier-muted max-w-2xl mx-auto">Transparent pricing for teams of all sizes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Explorer", price: "Free", desc: "Perfect for trying out Valtier.", features: ["2 Active Agents", "100 Tasks/mo", "Basic Memory", "Community Support"] },
              { name: "Pro", price: "$49", period: "/mo", desc: "For professionals automating daily work.", features: ["5 Active Agents", "1,000 Tasks/mo", "Long-term Memory", "API Access"], highlighted: true },
              { name: "Business", price: "$149", period: "/mo", desc: "For teams scaling operations.", features: ["Unlimited Agents", "10,000 Tasks/mo", "Enterprise Knowledge", "Priority Support"] },
              { name: "Enterprise", price: "Custom", desc: "For large organizations with custom needs.", features: ["Custom Agent Training", "Unlimited Tasks", "SSO & Audit Logs", "Dedicated Success Manager"] }
            ].map((tier, i) => (
              <div key={i} className={`glass p-8 rounded-2xl relative ${tier.highlighted ? 'border-valtier-accent shadow-glow-md transform lg:-translate-y-4' : ''}`}>
                {tier.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-valtier-accent text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-valtier-muted">{tier.period}</span>}
                </div>
                <p className="text-sm text-valtier-muted mb-6">{tier.desc}</p>
                <Link to="/signup" className={`block text-center w-full py-2.5 rounded-lg font-medium transition-all mb-8 ${tier.highlighted ? 'bg-valtier-accent hover:bg-valtier-accent-hover text-white shadow-glow-sm' : 'bg-valtier-surface hover:bg-valtier-border text-white border border-valtier-border'}`}>
                  Get Started
                </Link>
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-valtier-muted">
                      <CheckCircle2 className="w-4 h-4 text-valtier-emerald shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-valtier-border bg-valtier-surface py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Bot className="text-valtier-accent w-6 h-6" />
            <span className="font-bold tracking-tight">VALTIER</span>
          </div>
          <p className="text-sm text-valtier-muted">© {new Date().getFullYear()} Valtier AI Inc. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-valtier-muted">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
