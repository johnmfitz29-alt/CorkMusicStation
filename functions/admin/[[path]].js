// The admin screens. There is no plain file, so nothing can be reached without passing this login check.

import page from "../_lib/admin-page.js";
import { requireLogin } from "../_lib/auth.js";

export async function onRequestGet(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  return new Response(page, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-frame-options": "DENY",
      "x-robots-tag": "noindex",
      "referrer-policy": "same-origin",
    },
  });
}
