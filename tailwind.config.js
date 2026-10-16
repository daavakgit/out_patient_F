/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: '#3D81E3',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0284c7", // Medical Sky Blue
          hover: "#0369a1",
          light: "#e0f2fe",
          dark: "#075985",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0d9488", // Medical Soft Teal
          hover: "#0f766e",
          light: "#ccfbf1",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#f0f9ff",
          foreground: "#0369a1",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        sidebar: {
          DEFAULT: "#0f172a", // Dark Navy Sidebar
          foreground: "#f8fafc",
          accent: "#1e293b",
          active: "#0284c7",
        },
        clinical: {
          sidebar: "#172D35",
          primary: "#087F8C",
          primaryHover: "#076E79",
          accent: "#12A89D",
          bg: "#F4F7F8",
          card: "#FFFFFF",
          text: "#1D3038",
          muted: "#647780",
          border: "#DFE8EA",
          success: "#13866D",
          warning: "#D9972F",
          error: "#C94F50",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shiny: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.2s ease-out forwards",
        fadeSlideUp: "fadeSlideUp 0.8s ease both",
        shiny: "shiny 6s linear infinite",
      },
    },
  },
  plugins: [],
}
