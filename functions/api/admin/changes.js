// The list behind the Undo screen, newest first.

import { requireLogin } from "../../_lib/auth.js";
import { UNDO_REACH, readLog, reply, undoable } from "../../_lib/change.js";
import { gitHub, publishBranch } from "../../_lib/github.js";

export async function onRequestGet(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  const { env } = context;
  const branch = publishBranch(env);
  if (!branch || !env.GITHUB_REPO || !env.GITHUB_TOKEN) return reply(500, { ok: false, code: "not_configured" });
  try {
    const api = gitHub(env);
    const log = await readLog(api, await api.head(branch));
    const changes = log.slice(0, UNDO_REACH).map((e, i) => ({ id: e.id, at: e.at, summary: e.summary, canUndo: undoable(log, i) }));
    return reply(200, { ok: true, practice: branch === "practice", changes });
  } catch {
    return reply(502, { ok: false, code: "try_later" });
  }
}
