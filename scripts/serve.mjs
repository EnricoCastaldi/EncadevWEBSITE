import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { distDir, publicDir, renderSite } from "./site.mjs";

const dev = process.argv.includes("--dev");
const hostname = "127.0.0.1";
const port = Number(process.env.PORT ?? (dev ? 5173 : 8000));
const root = fileURLToPath(dev ? publicDir : distDir);
const htmlType = "text/html; charset=utf-8";
const contentTypes = new Map([
  [".html", htmlType],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".pdf", "application/pdf"]
]);

function send(response, status, body, contentType, headOnly = false) {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(headOnly ? undefined : body);
}

const textType = "text/plain; charset=utf-8";

const server = createServer(async (request, response) => {
  const headOnly = request.method === "HEAD";
  if (request.method !== "GET" && !headOnly) {
    response.setHeader("Allow", "GET, HEAD");
    send(response, 405, "Method not allowed", textType);
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    send(response, 400, "Invalid URL", textType, headOnly);
    return;
  }

  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/favicon.ico") pathname = "/encadev-icon.png";
  if (/[\\:\u0000]/.test(pathname)) {
    send(response, 400, "Invalid path", textType, headOnly);
    return;
  }

  const path = resolve(root, "." + pathname);
  const relativePath = relative(root, path);
  const contentType = contentTypes.get(extname(path));
  if (relativePath === ".." || relativePath.startsWith(".." + sep) || isAbsolute(relativePath) || !contentType) {
    send(response, 404, "File not found", textType, headOnly);
    return;
  }

  try {
    const body = dev && pathname === "/index.html" ? await renderSite() : await readFile(path);
    send(response, 200, body, contentType, headOnly);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      send(response, 404, "File not found", textType, headOnly);
    } else {
      console.error(error);
      send(response, 500, "Unable to serve the website", textType, headOnly);
    }
  }
});

server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE" ? `Port ${port} is already in use.` : error);
  process.exitCode = 1;
});
server.listen(port, hostname, () => {
  console.log(`${dev ? "Development" : "Built site"}: http://${hostname}:${server.address().port}`);
});
