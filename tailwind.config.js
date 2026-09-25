/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inst: {
          canvas: 'var(--color-canvas)',
          surface: 'var(--color-surface)',
          subtle: 'var(--color-subtle)',
          inset: 'var(--color-inset)',
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          muted: 'var(--color-muted)',
          border: 'var(--color-border)',
          'border-strong': 'var(--color-border-strong)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
          info: 'var(--color-info)',
        },
        fuelguard: {
          green: 'var(--fuelguard-green)',
          'green-hover': 'var(--fuelguard-green-hover)',
          'green-light': 'var(--fuelguard-green-light)',
          'green-border': 'var(--fuelguard-green-border)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        hairline: '0 0 0 1px var(--color-border)',
        raised: '0 1px 3px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--color-border)',
        overlay: '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--color-border-strong)',
      },
    },
  },
  plugins: [],
}
