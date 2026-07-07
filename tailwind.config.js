/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: "#0057B8",
        brandBlueDark: "#063A78",
        brandBlueDeep: "#061A3A",
        brandRed: "#E30613",
        brandRedLight: "#FF3040",
        brandWhite: "#FFFFFF",
        brandCream: "#F7FAFF",
        brandBlack: "#061A3A",
        brandGray: "#6b7280",
      },
    },
  },
  plugins: [],
};
