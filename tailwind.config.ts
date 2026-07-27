import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    // Dentro de `extend`, nunca reemplazando `theme.colors`: definir la paleta
    // fuera de extend borra la de Tailwind y deja muertas todas las clases
    // gray-*, red-*, etc.
    extend: {
      colors: {
        // Muestreados del catálogo y del logo — el fondo de ambos es el mismo.
        arena: "#e7d2b7",
        oliva: "#3b4628",
        sage: "#b6ad8c",
        caramelo: "#cb9a6a",
        crudo: "#f4e9dc",
        tinta: "#1a1a1a",
      },
      fontFamily: {
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
        sans: ["var(--font-lato)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
