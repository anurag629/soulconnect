import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wedding-inspired soft colors
        primary: {
          50: '#fdf4f6',
          100: '#fce8ed',
          200: '#f9d5df',
          300: '#f4b3c4',
          400: '#ed869f',
          500: '#e15c7c',
          600: '#cd3c61',
          700: '#ac2d4e',
          800: '#902845',
          900: '#7b263f',
          950: '#44101f',
        },
        secondary: {
          50: '#fef9ec',
          100: '#fdf0ca',
          200: '#fae091',
          300: '#f7c957',
          400: '#f4b02a',
          500: '#ee9311',
          600: '#d36f0c',
          700: '#af4f0d',
          800: '#8e3e11',
          900: '#753411',
          950: '#431906',
        },
        neutral: {
          50: '#f9f7f5',
          100: '#f3efe9',
          200: '#e6ddd2',
          300: '#d5c6b5',
          400: '#c2aa93',
          500: '#b3937a',
          600: '#a6826b',
          700: '#8a6a5a',
          800: '#72584c',
          900: '#5d4940',
          950: '#312521',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'wedding-pattern': "url('/patterns/wedding-pattern.svg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
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
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config
