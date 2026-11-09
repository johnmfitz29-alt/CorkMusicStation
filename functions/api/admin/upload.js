// Takes one picture, already prepared in the browser, checks it, and stores it where it stays invisible until published.

import { requireLogin } from "../../_lib/auth.js";
import { reply, validChangeId } from "../../_lib/change.js";
import { inspectJpegBase64 } from "../../_lib/jpeg.js";
import { signReceipt } from "../../_lib/receipts.js";

const MAX_BASE64 = 700000;
const LIMITS = { poster: [800, 4000], photo: [600, 4000], thumb: [80, 800], presenter: [200, 4000] };

export async function onRequestPost(context) {
  const login = await requireLogin(context);
  if (login instanceof Response) return login;

  const { request, env } = context;
  if (!env.GITHUB_REPO || !env.GITHUB_TOKEN || !env.RECEIPT_KEY) return reply(500, { ok: false, code: "not_configured" });

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const change = url.searchParams.get("change");
  if (!Object.hasOwn(LIMITS, kind || "") || !validChangeId(change)) return reply(400, { ok: false, code: "bad_request" });

  if (Number(request.headers.get("content-length") || 0) > MAX_BASE64) return reply(413, { ok: false, code: "too_big" });
  const data = await request.text();
  if (data.length > MAX_BASE64) return reply(413, { ok: false, code: "too_big" });

  const jpeg = inspectJpegBase64(data);
  if (!jpeg.ok) return reply(422, { ok: false, code: jpeg.code });
  const longest = Math.max(jpeg.w, jpeg.h);
  if (longest < LIMITS[kind][0]) return reply(422, { ok: false, code: "too_small" });
  if (longest > LIMITS[kind][1]) return reply(422, { ok: false, code: "bad_size" });

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
  if (response.status === 403 || response.status === 429) {
    return reply(503, { ok: false, code: "slow_down", retryAfter: Number(response.headers.get("retry-after")) || 60 });
  }
  if (!response.ok) return reply(502, { ok: false, code: "try_later" });

  const { sha } = await response.json();
  const receipt = await signReceipt(env.RECEIPT_KEY, { sha, kind, w: jpeg.w, h: jpeg.h, change });
  return reply(200, { ok: true, receipt, w: jpeg.w, h: jpeg.h });
}
