import { defineConfig } from "vite";
import { cpSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function copyRootStaticAssets(){
  return {
    name: "copy-root-static-assets",
    apply: "build",
    closeBundle(){
      const outputDir = resolve("dist");
      ["CNAME", "sw.js", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"]
        .forEach(file => cpSync(resolve(file), resolve(outputDir, file)));
      cpSync(resolve("images"), resolve(outputDir, "images"), { recursive: true });

      const assetUrls = readdirSync(resolve(outputDir, "assets"))
        .map(file => `./assets/${file}`);
      const serviceWorkerPath = resolve(outputDir, "sw.js");
      const serviceWorker = readFileSync(serviceWorkerPath, "utf8")
        .replace("const VITE_BUILD_ASSETS = [];", `const VITE_BUILD_ASSETS = ${JSON.stringify(assetUrls)};`);
      writeFileSync(serviceWorkerPath, serviceWorker);
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [copyRootStaticAssets()],
  server: {
    allowedHosts: ["vn7591g.tail12ac60.ts.net"]
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0
  }
});
