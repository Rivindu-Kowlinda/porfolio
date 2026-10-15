import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "preserve-portfolio-assets",
      closeBundle() {
        copyFileSync("Rivindu_Kowlinda_CV.pdf", "dist/Rivindu_Kowlinda_CV.pdf");
        copyFileSync("fonts/OFL-Manrope.txt", "dist/OFL-Manrope.txt");
        copyFileSync(
          "fonts/OFL-IBM-Plex-Mono.txt",
          "dist/OFL-IBM-Plex-Mono.txt",
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      input: [
        "index.html",
        "axion.html",
        "bug-brain-chess.html",
        "snake.html",
        "OOP.html",
        "SD1.html",
        "SD2.html",
        "3d_portfolio.html",
      ],
    },
    chunkSizeWarningLimit: 600,
  },
});
