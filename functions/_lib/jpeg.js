// Reads a JPEG's structure without decoding the picture, which keeps the CPU cost tiny.
// Photos prepared in the browser contain a JFIF header and, in Chrome, a colour profile. Any other metadata block is refused.

const MAX_SIDE = 4000;
const HEADER_BASE64 = 5464; // 4 KB of bytes
const START_OF_FRAME = new Set([0xc0, 0xc1, 0xc2]);
const TABLES = new Set([0xdb, 0xc4, 0xdd]); // quantisation, Huffman, restart interval

export function inspectJpegHeader(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return { ok: false, code: "not_jpeg" };
  let i = 2;
  let size = null;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return { ok: false, code: "not_jpeg" };
    const marker = b[i + 1];
    if (marker === 0xda) {
      if (!size) return { ok: false, code: "not_jpeg" };
      return { ok: true, ...size };
    }
    const length = (b[i + 2] << 8) | b[i + 3];
    if (length < 2) return { ok: false, code: "not_jpeg" };
    if (START_OF_FRAME.has(marker)) {
      if (i + 9 > b.length) return { ok: false, code: "not_jpeg" };
      size = { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
      if (!size.w || !size.h || size.w > MAX_SIDE || size.h > MAX_SIDE) return { ok: false, code: "bad_size" };
    } else if (marker !== 0xe0 && marker !== 0xe2 && !TABLES.has(marker)) {
      return { ok: false, code: "has_metadata" };
    }
    i += 2 + length;
  }
  return { ok: false, code: "not_jpeg" };
}

// Checks base64 JPEG text by decoding only its start and end.
export function inspectJpegBase64(text) {
  if (typeof text !== "string" || text.length < 16) return { ok: false, code: "not_jpeg" };
  try {
    // A browser-made JPEG has its whole header in the first 4 KB. Anything longer is refused.
    const head = atob(text.slice(0, Math.min(text.length - (text.length % 4), HEADER_BASE64)));
    const tail = atob(text.slice(-8));
    const bytes = new Uint8Array(head.length);
    for (let i = 0; i < head.length; i++) bytes[i] = head.charCodeAt(i);
    if (tail.charCodeAt(tail.length - 2) !== 0xff || tail.charCodeAt(tail.length - 1) !== 0xd9) {
      return { ok: false, code: "not_jpeg" };
    }
    return inspectJpegHeader(bytes);
  } catch {
    return { ok: false, code: "not_jpeg" };
  }
}
