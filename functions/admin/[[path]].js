// The admin screens. There is no plain file, so nothing can be reached without passing this login check.

import page from "../_lib/admin-page.js";
import { requireLogin } from "../_lib/auth.js";

export async function onRequestGet(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  // Only this page's own script and style carry the one-time code, so nothing injected can run.
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
  const policy = [
    "default-src 'none'",
    `script-src 'nonce-${nonce}' 'self' 'wasm-unsafe-eval'`,
    `style-src 'nonce-${nonce}'`,
    "img-src 'self' blob: data:",
    "font-src 'self' data: blob:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");

  return new Response(page.replaceAll("__NONCE__", nonce), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": policy,
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex",
      "referrer-policy": "same-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      "strict-transport-security": "max-age=31536000",
    },
  });
}
