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
            DEFAULT: '#0052FF',
            hover: '#0043D1',
          },
          accent: {
            DEFAULT: '#E5E7EB',
            darker: '#D1D5DB',
            lighter: '#F9FAFB',
          },
          textMain: {
            DEFAULT: '#1F2937',
            muted: '#6B7280',
          },
          success: {
            DEFAULT: '#10B981',
          },
          background: {
            DEFAULT: '#FFFFFF',
            paper: '#F3F4F6'
          }
        },
        fontFamily: {
          sans: ['Inter', 'Poppins', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }
