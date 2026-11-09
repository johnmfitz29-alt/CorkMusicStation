// Puts one finished change on the website as a single commit.

import { requireLogin } from "../../_lib/auth.js";
import { reply, runChange } from "../../_lib/change.js";

const MAX_BODY = 256 * 1024;
const MAX_STEPS = 70;

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
  const { changeId, ops, allowDuplicate } = body || {};
  if (!Array.isArray(ops) || ops.length === 0 || ops.length > MAX_STEPS) return reply(400, { ok: false, code: "bad_request" });
  // Undo-only steps can never come from the browser.
  if (ops.some((op) => !op || typeof op.op !== "string" || op.op.startsWith("_"))) return reply(422, { ok: false, code: "unknown_step" });

  return runChange({
    env,
    changeId,
    makeOps: () => ops,
    who: login.email,
    allowDuplicate: allowDuplicate === true,
    typedNames: Array.isArray(body.newNames) ? body.newNames.filter((n) => typeof n === "string").slice(0, 5).map((n) => n.slice(0, 120)) : [],
    origin: new URL(request.url).origin,
  });
}
