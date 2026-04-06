/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scrollUp: {
          '0%': { transform: 'translateY(0)' },
          '12%': { transform: 'translateY(0)' },
          '15%': { transform: 'translateY(-36px)' },
          '27%': { transform: 'translateY(-36px)' },
          '30%': { transform: 'translateY(-72px)' },
          '42%': { transform: 'translateY(-72px)' },
          '45%': { transform: 'translateY(-108px)' },
          '57%': { transform: 'translateY(-108px)' },
          '60%': { transform: 'translateY(-144px)' },
          '72%': { transform: 'translateY(-144px)' },
          '75%': { transform: 'translateY(-180px)' },
          '87%': { transform: 'translateY(-180px)' },
          '90%': { transform: 'translateY(-216px)' },
          '100%': { transform: 'translateY(-216px)' },
        },
      },
      animation: {
        scrollUp: 'scrollUp 30s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
