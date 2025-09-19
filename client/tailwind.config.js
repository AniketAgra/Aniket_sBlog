import flowbitePlugin from 'flowbite/plugin';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: {
          900: '#0b1020',
          800: '#111827',
        },
      },
      boxShadow: {
        glow: '0 10px 40px rgba(168, 85, 247, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [
    flowbitePlugin,
  ],
};
