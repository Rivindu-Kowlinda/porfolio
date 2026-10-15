import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "preserve-portfolio-assets",
      closeBundle() {
        copyFileSync("CV.pdf", "dist/CV.pdf");
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
