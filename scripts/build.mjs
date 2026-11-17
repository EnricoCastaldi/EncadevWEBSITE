import { cp, rm, writeFile } from "node:fs/promises";
import { distDir, publicDir, renderSite } from "./site.mjs";

const html = await renderSite();
await rm(distDir, { recursive: true, force: true });
await cp(publicDir, distDir, { recursive: true });
await writeFile(new URL("index.html", distDir), html);
console.log("Website built in dist/.");
