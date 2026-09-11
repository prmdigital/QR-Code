// Release build for the single-file QR generator.
//
//   npm run build   →   dist/qr-code-generator.html
//                       dist/qr-code-generator-v<version>.zip
//                       dist/SHA256SUMS.txt
//
// There is no compile step — index.html already runs as-is. The build stamps
// the version and packages the page with its README and license notices.
// No dependencies: Node >= 22 (for zlib.crc32).

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { deflateRawSync, crc32 } from "node:zlib";

const root = new URL("../", import.meta.url);
const read = p => readFileSync(new URL(p, root));
const out = p => new URL(`dist/${p}`, root);

const { version } = JSON.parse(read("package.json"));
const date = new Date().toISOString().slice(0, 10);

let html = read("index.html").toString("utf8");
const MARK = "<!--BUILD-->";
if (!html.includes(MARK)) throw new Error(`index.html is missing the ${MARK} marker`);
html = html.replace(MARK, ` · v${version} · built ${date}`);

const page = Buffer.from(html, "utf8");
const zipName = `qr-code-generator-v${version}.zip`;
const archive = zip([
  { name: "qr-code-generator.html", data: page },
  { name: "README.md", data: read("README.md") },
  { name: "THIRD_PARTY_LICENSES.md", data: read("THIRD_PARTY_LICENSES.md") }
]);

rmSync(new URL("dist/", root), { recursive: true, force: true });
mkdirSync(new URL("dist/", root));
writeFileSync(out("qr-code-generator.html"), page);
writeFileSync(out(zipName), archive);

const sha = b => createHash("sha256").update(b).digest("hex");
writeFileSync(out("SHA256SUMS.txt"),
  `${sha(page)}  qr-code-generator.html\n${sha(archive)}  ${zipName}\n`);

const kb = b => `${(b.length / 1024).toFixed(1)} KB`;
console.log(`Built v${version} (${date})`);
console.log(`  dist/qr-code-generator.html   ${kb(page)}`);
console.log(`  dist/${zipName}   ${kb(archive)}`);
console.log(`  dist/SHA256SUMS.txt`);

// Minimal ZIP writer (deflate, UTF-8 names) — avoids a dependency for three files.
function zip(files) {
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const day = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const parts = [], central = [];
  let offset = 0;

  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const body = deflateRawSync(f.data, { level: 9 });
    const crc = crc32(f.data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);   // local file header signature
    local.writeUInt16LE(20, 4);           // version needed to extract
    local.writeUInt16LE(0x0800, 6);       // flag: UTF-8 file name
    local.writeUInt16LE(8, 8);            // method: deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(f.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    parts.push(local, name, body);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);   // central directory signature
    entry.writeUInt16LE(20, 4);           // version made by
    entry.writeUInt16LE(20, 6);           // version needed
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(8, 10);
    entry.writeUInt16LE(time, 12);
    entry.writeUInt16LE(day, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(f.data.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(offset, 42);      // offset of local header
    central.push(entry, name);

    offset += local.length + name.length + body.length;
  }

  const dir = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);       // end of central directory
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, dir, end]);
}
