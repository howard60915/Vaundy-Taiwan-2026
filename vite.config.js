import { defineConfig } from "vite";
import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function copyRootStaticAssets(){
  return {
    name: "copy-root-static-assets",
    apply: "build",
    closeBundle(){
      const outputDir = resolve("dist");
      ["CNAME", "sw.js", "manifest.json", "robots.txt", "sitemap.xml", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"]
        .forEach(file => cpSync(resolve(file), resolve(outputDir, file)));
      cpSync(resolve("images"), resolve(outputDir, "images"), { recursive: true });

      const indexPath = resolve(outputDir, "index.html");
      const criticalCss = readFileSync(resolve("src/guide-critical.css"), "utf8");
      let indexHtml = readFileSync(indexPath, "utf8");
      const stylesheetMatch = indexHtml.match(/<link rel="stylesheet" crossorigin href="(\.\/assets\/[^\"]+\.css)">/);
      if(stylesheetMatch){
        const [, stylesheetUrl] = stylesheetMatch;
        const deferredStylesheet = `<style data-critical-guide>${criticalCss}</style>\n<link rel="stylesheet" data-app-styles href="${stylesheetUrl}" disabled><noscript><link rel="stylesheet" href="${stylesheetUrl}"></noscript>`;
        indexHtml = indexHtml.replace(stylesheetMatch[0], deferredStylesheet);
        writeFileSync(indexPath, indexHtml);
      }
      const assetUrls = [...new Set([...indexHtml.matchAll(/(?:src|href)="(\.\/assets\/[^\"]+)"/g)]
        .map(([, url]) => url))];
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
