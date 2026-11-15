// Reverses one earlier change with a new commit. History is never rewritten.

import { requireLogin } from "../../_lib/auth.js";
import { readText } from "../../_lib/body.js";
import { reply, runChange, undoable, validChangeId } from "../../_lib/change.js";
import { Refusal } from "../../_lib/ops.js";

export async function onRequestPost(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  const { request, env } = context;
  const text = await readText(request, 2048);
  if (text === null) return reply(413, { ok: false, code: "too_big" });
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400, { ok: false, code: "bad_request" });
  }
  const { changeId, target } = body || {};
  if (!validChangeId(target)) return reply(400, { ok: false, code: "bad_request" });

  let chosen;
  return runChange({
    env,
    changeId,
    who: login.email,
    origin: new URL(request.url).origin,
    makeOps: (log) => {
      const index = log.findIndex((e) => e.id === target);
      if (index < 0) throw new Refusal("no_such_change");
      if (!undoable(log, index)) throw new Refusal("not_safe_to_undo");
      chosen = log[index];
      return chosen.undo;
    },
    summaryFor: () => `undid: ${chosen.summary}`,
  });
}
