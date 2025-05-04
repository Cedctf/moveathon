import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        'default': '#ffffff',
        'input': '#ffffff',
      },
      textColor: {
        'default': '#000000',
        'input': '#000000',
        'input-placeholder': '#94a3b8',
      },
      borderColor: {
        'input': '#e2e8f0',
      },
      colors: {
        // Define a custom color palette for form elements
        form: {
          background: '#ffffff',
          text: '#000000',
          placeholder: '#94a3b8',
          border: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};
export default config;
