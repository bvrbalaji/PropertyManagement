/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8dfff',
          300: '#7bc5ff',
          400: '#36a8ff',
          500: '#0c8ce8',
          600: '#006fcc',
          700: '#0057a5',
          800: '#054988',
          900: '#0a3d70',
        },
      },
    },
  },
  plugins: [],
}
