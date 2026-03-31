import { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};

export default config;
