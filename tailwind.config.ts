import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta fresca e moderna — azuis e verdes vivos
        ink: "#0f1f2e",        // azul-petróleo escuro (texto)
        ocean: "#0a6cff",      // azul vivo principal
        ocean2: "#0850c4",     // azul escuro (hover)
        mint: "#10b981",       // verde vivo
        mint2: "#059669",      // verde escuro
        sky: "#e8f3ff",        // azul muito claro (fundos)
        cloud: "#f5f9fc",      // quase branco azulado (fundo base)
        slate: "#5a6b7b",      // cinza-azulado (texto secundário)
        // aliases antigos mantidos para não partir classes existentes
        soil: "#0f1f2e",
        clay: "#0a6cff",
        wheat: "#10b981",
        olive: "#059669",
        sage: "#10b981",
        cream: "#f5f9fc",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Public Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
