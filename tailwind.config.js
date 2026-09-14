const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function cssPalette(name) {
  return Object.fromEntries(
    steps.map((step) => [step, `rgb(var(--color-${name}-${step}) / <alpha-value>)`]),
  );
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        memorial: cssPalette('purple'),
        gold: cssPalette('gold'),
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        bronze: 'rgb(var(--color-bronze) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        heritage: 'rgb(var(--color-heritage) / <alpha-value>)',
      },
      fontFamily: {
        // Programme display face
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        // Programme body face — Aptos where installed (Office / Windows), then close system fallbacks
        sans: [
          'Aptos',
          'Aptos Display',
          'Segoe UI',
          'Calibri',
          'Candara',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
