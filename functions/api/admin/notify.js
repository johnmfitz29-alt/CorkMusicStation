// Get Help, and "that didn't reach the website" reports, sent to the owner.

import { requireLogin } from "../../_lib/auth.js";
import { reply } from "../../_lib/change.js";
import { emailOwner } from "../../_lib/email.js";

const MAX_BODY = 8 * 1024;
const SUBJECTS = { help: "Get Help was pressed", failed: "A website change did not go live" };

export async function onRequestPost(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  const { request, env } = context;
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return reply(413, { ok: false, code: "too_big" });
  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return reply(413, { ok: false, code: "too_big" });
    body = JSON.parse(text);
  } catch {
    return reply(400, { ok: false, code: "bad_request" });
  }
  if (!Object.hasOwn(SUBJECTS, body?.type || "")) return reply(400, { ok: false, code: "bad_request" });
  const sent = await emailOwner(env, SUBJECTS[body.type], `${login.email}\n\n${String(body.details ?? "").slice(0, 4000)}`);
  return reply(200, { ok: true, sent });
}
