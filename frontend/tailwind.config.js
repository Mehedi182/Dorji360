/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2C5282',      // Deep Blue - Primary Accent
        'success': '#38A169',       // Emerald Green - Success/Action
        'text-primary': '#1A202C',  // Dark Grey - Primary Text
        'text-secondary': '#718096', // Medium Grey - Secondary Text
        'border': '#E2E8F0',        // Light Grey - Shadow/Border
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
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

