/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./Server Vocabulary Test/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'custom-image': "url('../img/christopher-gower-vjMgqUkS8q8-unsplash.jpg')",
      },
    },
  },
  plugins: [],
}

