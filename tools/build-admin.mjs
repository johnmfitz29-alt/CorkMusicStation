// Packs admin-src/ into a function module, so no plain admin file exists on the website.
//   node tools/build-admin.mjs
// Run after any change in admin-src/, and commit the result. A test fails if it has been forgotten.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function packAdmin() {
  const read = (f) => fs.readFileSync(path.join(root, "admin-src", f), "utf8").replace(/\r\n/g, "\n");
  const app = read("app.js").replace("/*WORDS-START*/", "").replace("/*WORDS-END*/", "");
  const page = read("index.html").replace("/*APP*/", () => app.replace(/<\/script/gi, "<\\/script"));
  return `// Made by tools/build-admin.mjs from admin-src/. Do not edit by hand.\nexport default ${JSON.stringify(page)};\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  fs.writeFileSync(path.join(root, "functions/_lib/admin-page.js"), packAdmin());
  console.log("Admin page packed.");
}
