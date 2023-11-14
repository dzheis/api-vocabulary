/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./Server Vocabulary Test/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roboto', 'sans-serif'],
      },
      backgroundColor: {
        'f4edea': '#f4edea',
      },
      backgroundImage: {
        'custom-image': "url('../img/christopher-gower-vjMgqUkS8q8-unsplash.jpg')",
      },
      width: {
        '1000': '1000px',
      },
      height: {
        '450': '450px',
      },
    },
  },
  plugins: [],
}

