import { deflateSync, crc32 } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "public", "icons");
mkdirSync(OUT_DIR, { recursive: true });

const BG = [0x34, 0x66, 0xff]; // brand-500
const FG = [0xff, 0xff, 0xff];

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput) >>> 0, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/** Draws a simple rounded "AI" monogram glyph mask (1 = foreground pixel) at the given size. */
function buildGlyphMask(size) {
  const mask = Array.from({ length: size }, () => new Array(size).fill(false));
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;

  // A simple circle-with-checkmark-ish glyph: filled circle ring.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < r && dist > r * 0.45) mask[y][x] = true;
    }
  }
  return mask;
}

function generatePng(size) {
  const glyph = buildGlyphMask(size);
  const rowBytes = size * 4;
  const raw = Buffer.alloc((rowBytes + 1) * size);

  for (let y = 0; y < size; y++) {
    const rowStart = y * (rowBytes + 1);
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      const isFg = glyph[y][x];
      const [r, g, b] = isFg ? FG : BG;
      raw[pixelStart] = r;
      raw[pixelStart + 1] = g;
      raw[pixelStart + 2] = b;
      raw[pixelStart + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  const filePath = path.join(OUT_DIR, `icon${size}.png`);
  writeFileSync(filePath, png);
  console.log(`Wrote ${filePath}`);
}

[16, 48, 128].forEach(generatePng);
