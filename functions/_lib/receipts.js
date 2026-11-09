// A receipt proves the server already checked an uploaded picture, so publishing need not fetch every one again.

const encoder = new TextEncoder();

// Setting up the key is the slow part, and a 60-photo publish has 120 receipts, so it's done once.
let cached = { secret: null, key: null };

async function key(secret) {
  if (cached.secret !== secret) {
    cached = { secret, key: await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]) };
  }
  return cached.key;
}

const toBase64Url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function fromBase64Url(text) {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function signReceipt(secret, payload) {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(body));
  return `${body}.${toBase64Url(signature)}`;
}

// Returns the payload, or null if the receipt is not genuine.
export async function readReceipt(secret, receipt) {
  if (typeof receipt !== "string" || receipt.length > 1000) return null;
  const parts = receipt.split(".");
  if (parts.length !== 2) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await key(secret), fromBase64Url(parts[1]), encoder.encode(parts[0]));
    return valid ? JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0]))) : null;
  } catch {
    return null;
  }
}
