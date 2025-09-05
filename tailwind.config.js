/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(210, 70%, 95%)',
          100: 'hsl(210, 70%, 90%)',
          500: 'hsl(210, 70%, 50%)',
          600: 'hsl(210, 70%, 45%)',
          700: 'hsl(210, 70%, 40%)',
        },
        accent: {
          50: 'hsl(130, 70%, 95%)',
          100: 'hsl(130, 70%, 90%)',
          500: 'hsl(130, 70%, 50%)',
          600: 'hsl(130, 70%, 45%)',
        },
        bg: 'hsl(210, 36%, 96%)',
        surface: 'hsl(210, 36%, 100%)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '14px',
      },
      spacing: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      boxShadow: {
        'card': '0 6px 16px hsla(0, 0%, 0%, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}