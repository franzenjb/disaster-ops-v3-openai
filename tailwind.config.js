/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'red-cross-red': '#ed1b2e',
        'red-cross-gray': '#6d6e70',
        'red-cross-light': '#f9f9f9',
      },
    },
  },
  plugins: [],
}