export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Keep existing brand colors for compatibility
        brand: {
          dark: "#2d3a2e",
          green: "#3d5a3e", 
          light: "#f5f3ef",
          cream: "#faf8f5",
        },
        // New Valtier dark palette
        valtier: {
          bg: "#080c14",
          surface: "#0d1526",
          card: "#111827",
          border: "#1e2d45",
          muted: "#8b9cb5",
          text: "#e2e8f0",
          accent: "#6366f1", // indigo
          'accent-hover': "#818cf8",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          purple: "#8b5cf6",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-valtier': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #10b981 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        'glow-indigo': 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99,102,241,0.3)',
        'glow-md': '0 0 30px rgba(99,102,241,0.4)',
        'glow-lg': '0 0 60px rgba(99,102,241,0.5)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-down': { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-left': { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'pulse-glow': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'bounce-subtle': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        'orbit': { from: { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' }, to: { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-down': 'fade-down 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'orbit': 'orbit 4s linear infinite',
      },
    },
  },
  plugins: [],
};
