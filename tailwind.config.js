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
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
