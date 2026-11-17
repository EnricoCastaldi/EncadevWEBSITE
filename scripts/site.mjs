import { readFile } from "node:fs/promises";

export const publicDir = new URL("../src/public/", import.meta.url);
export const distDir = new URL("../dist/", import.meta.url);

const template = new URL("../src/index.html", import.meta.url);
const pages = ["home", "solutions", "contact"];
const pageSlot = "<!-- SITE_PAGES -->\n";

export async function renderSite() {
  const [layout, ...sections] = await Promise.all([
    readFile(template, "utf8"),
    ...pages.map((page) => readFile(new URL(`../src/pages/${page}.html`, import.meta.url), "utf8"))
  ]);
  if (!layout.includes(pageSlot)) throw new Error("Missing SITE_PAGES placeholder in src/index.html");
  return layout.replace(pageSlot, () => sections.join(""));
}
