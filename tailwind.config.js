/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // عشان تدعم الوضع الليلي لو حبيت تفعله مستقبلاً
  theme: {
    extend: {
      colors: {
        "primary": "#2C3E87",
        "secondary": "#FF6B35",
        "background-light": "#F8F9FA",
        "background-dark": "#14161e",
        "card-background": "#FFFFFF",
        "text-primary": "#212529",
        "text-secondary": "#6C757D",
        "border-color": "#DEE2E6",
        "status-green": "#28A745",
        "status-yellow": "#FFC107",
        "status-red": "#DC3545",
      },
      fontFamily: {
        "display": ["Cairo", "Inter", "sans-serif"],
        "body": ["Inter", "Cairo", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}