/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{html,js,tsx}", './components/**/*.{js,ts,jsx,tsx}',],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
}