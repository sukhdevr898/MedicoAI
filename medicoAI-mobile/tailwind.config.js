/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#49c140', // Forest green (HSL 142, 57%, 48%)
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#49c140',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        background: {
          DEFAULT: '#f4f8f5', // Very light green (HSL 150, 17%, 96%)
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#87e550', // Lime green (HSL 112, 51%, 53%)
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#87e550',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
        text: {
          primary: '#1a1a1a',
          secondary: '#6b7280',
          muted: '#9ca3af',
          white: '#ffffff',
        },
        border: {
          DEFAULT: '#e5e7eb',
          light: '#f3f4f6',
          dark: '#374151',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'code': ['SourceCodePro', 'Monaco', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      shadows: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}

