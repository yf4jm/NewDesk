const fs = require("fs");
const path = require("path");

function addToAppRegistry(appName) {
  const registryPath = path.join(__dirname, "../src/appRegistry.js");
  const importPath = `../apps/${appName}/app.jsx`;

  let content = fs.readFileSync(registryPath, "utf-8");

  // Add import if not present
  const importStatement = `import ${camelCase(appName)} from "${importPath}";`;
  if (!content.includes(importStatement)) {
    content = importStatement + "\n" + content;
  }

  // Add to registry object
  const registryRegex = /export const appRegistry = \{([\s\S]*?)\};/m;
  content = content.replace(registryRegex, (match, inner) => {
    if (inner.includes(`"${appName}"`)) return match; // already present
    return `export const appRegistry = {${inner}\n  "${appName}": ${camelCase(appName)},\n};`;
  });

  fs.writeFileSync(registryPath, content, "utf-8");
}

function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Usage: node scripts/addToAppRegistry.js my-new-app
if (require.main === module) {
  const appName = process.argv[2];
  if (!appName) {
    console.error("Usage: node addToAppRegistry.js <app-name>");
    process.exit(1);
  }
  addToAppRegistry(appName);
  console.log(`Added ${appName} to appRegistry.js`);
}

module.exports = addToAppRegistry;
