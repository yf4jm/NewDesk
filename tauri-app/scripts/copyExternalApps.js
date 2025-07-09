const fs = require("fs");
const path = require("path");

const manifest = require("../src-tauri/resources/data/apps_manifest.json");
const destRoot = path.join(__dirname, "../public/apps");

manifest.apps.forEach(app => {
  if (app.type === "external" && app.path) {
    // Remove leading slash for local path
    const src = path.join(__dirname, "..", app.path.replace(/^\//, ""));
    const dest = path.join(destRoot, app.name, "dist", "bundle.js");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} -> ${dest}`);
  }
});
