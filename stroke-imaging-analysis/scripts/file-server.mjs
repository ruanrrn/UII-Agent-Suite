import { createReadStream, promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8080);
// 默认根目录指向 skill 自带的 imaging-data，使该 skill 可独立分发运行。
const ROOT_DIR = path.resolve(
  process.env.ROOT_DIR || path.join(__dirname, "..", "imaging-data"),
);
const ACCESS_LOG =
  process.env.ACCESS_LOG === "1" || process.env.ACCESS_LOG === "true";

const mimeTypes = new Map([
  [".7z", "application/x-7z-compressed"],
  [".avif", "image/avif"],
  [".bmp", "image/bmp"],
  [".css", "text/css; charset=utf-8"],
  [".csv", "text/csv; charset=utf-8"],
  [".gif", "image/gif"],
  [".gz", "application/gzip"],
  [".htm", "text/html; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".tar", "application/x-tar"],
  [".txt", "text/plain; charset=utf-8"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".zip", "application/zip"],
]);

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toDisplaySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unit]}`;
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://${HOST}:${PORT}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const normalizedPath = path
    .normalize(decodedPath)
    .replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.resolve(ROOT_DIR, `.${normalizedPath}`);

  if (
    absolutePath !== ROOT_DIR &&
    !absolutePath.startsWith(`${ROOT_DIR}${path.sep}`)
  ) {
    return null;
  }

  return { absolutePath, pathname: url.pathname };
}

async function sendDirectory(res, absolutePath, pathname) {
  const entries = await fs.readdir(absolutePath, { withFileTypes: true });
  const rows = await Promise.all(
    entries
      .sort(
        (a, b) =>
          Number(b.isDirectory()) - Number(a.isDirectory()) ||
          a.name.localeCompare(b.name),
      )
      .map(async (entry) => {
        const entryPath = path.join(absolutePath, entry.name);
        const stat = await fs.stat(entryPath);
        const href = `${pathname.replace(/\/?$/, "/")}${encodeURIComponent(entry.name)}${entry.isDirectory() ? "/" : ""}`;
        const name = `${entry.name}${entry.isDirectory() ? "/" : ""}`;
        return `<tr><td><a href="${href}">${htmlEscape(name)}</a></td><td>${entry.isDirectory() ? "-" : toDisplaySize(stat.size)}</td><td>${stat.mtime.toLocaleString()}</td></tr>`;
      }),
  );

  const parent =
    pathname === "/"
      ? ""
      : `<tr><td><a href="${path.posix.dirname(pathname.replace(/\/$/, "")) || "/"}">../</a></td><td>-</td><td>-</td></tr>`;

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>File Server - ${htmlEscape(pathname)}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 32px; color: #1f2937; }
    h1 { font-size: 22px; margin: 0 0 18px; }
    table { border-collapse: collapse; width: 100%; max-width: 980px; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
    th { color: #4b5563; font-size: 13px; }
    a { color: #0f766e; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${htmlEscape(pathname)}</h1>
  <table>
    <thead><tr><th>Name</th><th>Size</th><th>Modified</th></tr></thead>
    <tbody>${parent}${rows.join("")}</tbody>
  </table>
</body>
</html>`;

  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
  });
  res.end(html);
}

async function sendFile(req, res, absolutePath, stat) {
  const type =
    mimeTypes.get(path.extname(absolutePath).toLowerCase()) ||
    "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
    "Last-Modified": stat.mtime.toUTCString(),
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(absolutePath).pipe(res);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

const server = http.createServer(async (req, res) => {
  if (ACCESS_LOG) {
    console.log(
      `[access] ${new Date().toISOString()} ${req.socket.remoteAddress} ${req.method} ${req.url}`,
    );
  }
  try {
    if (!["GET", "HEAD"].includes(req.method || "")) {
      sendText(res, 405, "Method Not Allowed");
      return;
    }

    const resolved = resolveRequestPath(req.url || "/");
    if (!resolved) {
      sendText(res, 403, "Forbidden");
      return;
    }

    const stat = await fs.stat(resolved.absolutePath);
    if (stat.isDirectory()) {
      await sendDirectory(res, resolved.absolutePath, resolved.pathname);
      return;
    }

    if (stat.isFile()) {
      await sendFile(req, res, resolved.absolutePath, stat);
      return;
    }

    sendText(res, 404, "Not Found");
  } catch (error) {
    if (error?.code === "ENOENT") {
      sendText(res, 404, "Not Found");
      return;
    }
    console.error(error);
    sendText(res, 500, "Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`File server root: ${ROOT_DIR}`);
  console.log(`Listening on: http://${HOST}:${PORT}`);
});
