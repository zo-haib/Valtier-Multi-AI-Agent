import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TrustedBy } from "./TrustedBy";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4";

export function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-brand-cream">
      <div className="absolute inset-0">
        <video
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      <div className="relative z-10 flex flex-col items-start max-w-7xl mx-auto pt-28 md:pt-36 px-6 lg:px-8">
        {/* Announcement pill */}
        <a
          href="#"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-dark/15 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors mb-5 md:mb-6 animate-fade-up stagger-3"
        >
          <span className="text-sm text-brand-dark">AI agents that work as one.</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-dark" />
        </a>

        {/* Headline */}
        <h1 className="text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-4xl font-helvetica-neue animate-fade-up stagger-4">
          One unified system to build,
          <br className="hidden sm:block" />
          {" "}test, ship, and orchestrate AI agents
        </h1>

        {/* Positioning statement */}
        <p className="text-base md:text-lg text-brand-dark/70 max-w-2xl mt-5 animate-fade-up stagger-4">
          Coordinate your AI workforce from one intelligent workspace.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 mt-7 animate-fade-up stagger-5">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full hover:bg-brand-green transition-colors"
          >
            Start Building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 px-6 py-3 border border-brand-dark/20 text-brand-dark rounded-full hover:bg-white/60 transition-colors"
          >
            Explore Agents
          </Link>
        </div>

        <TrustedBy />
      </div>
    </section>
  );
}
