/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "helvetica-neue": ['"Helvetica Neue Light"', "Helvetica", "Arial", "sans-serif"],
        playfair: ['"Playfair Display"', "serif"],
        oswald: ["Oswald", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        "roboto-slab": ['"Roboto Slab"', "serif"],
        raleway: ["Raleway", "sans-serif"],
      },
      colors: {
        brand: {
          dark: "#2d3a2e",
          green: "#3d5a3e",
          light: "#f5f3ef",
          cream: "#faf8f5",
        },
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-down": "fade-down 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
