import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Triangle } from "lucide-react";
import { cn } from "../../lib/cn";

const NAV_LINKS = ["Plans", "News"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition duration-300",
          scrolled ? "bg-brand-cream/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative flex items-center h-16 md:h-20">
            {/* Left links */}
            <div className="hidden md:flex items-center gap-8 animate-fade-down stagger-1">
              <button className="flex items-center gap-1 text-sm text-brand-dark tracking-wide uppercase hover:opacity-70 transition-opacity">
                Solutions <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-brand-dark tracking-wide uppercase hover:opacity-70 transition-opacity"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Center logo */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 animate-fade-down stagger-2"
            >
              <Triangle className="w-5 h-5 text-brand-dark fill-brand-dark" />
              <span className="text-xl text-brand-dark tracking-tight font-helvetica-neue">Valtier</span>
            </Link>

            {/* Desktop CTA */}
            <Link
              to="/signup"
              className="hidden md:inline-flex items-center ml-auto px-5 py-2.5 bg-brand-dark text-white text-sm tracking-wide uppercase rounded-full hover:bg-brand-green transition-colors animate-fade-down stagger-3"
            >
              Try It Free
            </Link>

            {/* Mobile hamburger */}
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden ml-auto z-50 w-10 h-10 relative"
            >
              <span
                className={cn(
                  "absolute left-2 top-[6px] w-6 h-[2px] bg-brand-dark rounded transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]",
                  mobileOpen && "rotate-45 translate-y-[5px]"
                )}
              />
              <span
                className={cn(
                  "absolute left-2 top-[13px] w-6 h-[2px] bg-brand-dark rounded transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]",
                  mobileOpen && "-rotate-45"
                )}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-brand-cream z-40 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center h-full gap-8 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] delay-100",
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
          )}
        >
          <button onClick={closeMenu} className="text-3xl text-brand-dark tracking-tight">
            Solutions
          </button>
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" onClick={closeMenu} className="text-3xl text-brand-dark tracking-tight">
              {link}
            </a>
          ))}
          <Link
            to="/signup"
            onClick={closeMenu}
            className="mt-4 inline-flex items-center px-8 py-3.5 bg-brand-dark text-white text-lg tracking-wide rounded-full"
          >
            Try It Free
          </Link>
        </div>
      </div>
    </>
  );
}
