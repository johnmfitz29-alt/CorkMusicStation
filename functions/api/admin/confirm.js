// Says whether a change has really reached the live website, by reading the file visitors are served.

import { requireLogin } from "../../_lib/auth.js";
import { reply, validChangeId } from "../../_lib/change.js";

export async function onRequestGet(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!validChangeId(id)) return reply(400, { ok: false, code: "bad_request" });
  try {
    // Cloudflare's runtime rejects a "cache" option here unless newer settings are switched on, so none is passed.
    const response = await env.ASSETS.fetch(new URL("/data/last-change.json", url.origin));
    if (!response.ok) return reply(200, { ok: true, live: false });
    const current = await response.json();
    return reply(200, { ok: true, live: current.id === id });
  } catch {
    return reply(200, { ok: true, live: false });
  }
}
