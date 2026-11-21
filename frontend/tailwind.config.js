/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        govnavy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          800: "#102a43",
          900: "#0b192c",
          950: "#06101e",
        },
        govblue: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
        saffron: {
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        govgreen: {
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        }
      },
    },
  },
  plugins: [],
};
