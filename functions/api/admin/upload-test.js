// Stage 1 measuring tool only. Sends one prepared JPEG to GitHub as an unattached blob, which never
// appears on the site. Off unless UPLOAD_TEST_ENABLED is "1". Stage 2 replaces it with the real route.

import { requireLogin } from "../../_lib/auth.js";
import { inspectJpegBase64 } from "../../_lib/jpeg.js";

const MAX_BASE64 = 700000; // about 500 KB of JPEG. The body is plain base64 text, to avoid the cost of parsing JSON.

function reply(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  const { request, env } = context;
  if (env.UPLOAD_TEST_ENABLED !== "1") return reply(404, { ok: false, code: "off" });

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BASE64) return reply(413, { ok: false, code: "too_big" });

  const data = await request.text();
  if (data.length > MAX_BASE64) return reply(413, { ok: false, code: "too_big" });

  const jpeg = inspectJpegBase64(data);
  if (!jpeg.ok) return reply(422, { ok: false, code: jpeg.code });

  const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/git/blobs`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "cork-music-station-admin",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({ encoding: "base64", content: data }),
  });
  const remaining = response.headers.get("x-ratelimit-remaining");
  const retryAfter = response.headers.get("retry-after");
  if (!response.ok) return reply(502, { ok: false, code: "github", status: response.status, remaining, retryAfter });
  const { sha } = await response.json();
  return reply(200, { ok: true, sha, w: jpeg.w, h: jpeg.h, remaining });
}
