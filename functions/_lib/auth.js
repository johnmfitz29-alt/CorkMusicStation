// Verifies the Cloudflare Access login. Every handler calls this first, so a mistake
// in the Access settings still cannot expose a function. It refuses if anything is unset.

const KEY_CACHE_MS = 60 * 60 * 1000;
let cache = { team: null, at: 0, keys: new Map() };

function refuse(status, code) {
  return new Response(JSON.stringify({ ok: false, code }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function base64UrlBytes(text) {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function base64UrlJson(text) {
  return JSON.parse(new TextDecoder().decode(base64UrlBytes(text)));
}

async function loadKeys(team, fetcher) {
  const response = await fetcher(`https://${team}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error("certs unavailable");
  const { keys } = await response.json();
  const map = new Map();
  for (const jwk of keys) {
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    map.set(jwk.kid, key);
  }
  cache = { team, at: Date.now(), keys: map };
}

// An unknown key ID forces a refresh, because Cloudflare rotates its keys.
async function keyFor(kid, team, fetcher) {
  const fresh = cache.team === team && Date.now() - cache.at < KEY_CACHE_MS;
  if (!fresh || !cache.keys.has(kid)) await loadKeys(team, fetcher);
  return cache.keys.get(kid);
}

export function clearKeyCache() {
  cache = { team: null, at: 0, keys: new Map() };
}

// Returns { email } if the login is valid, otherwise a Response to return straight away:
//   const login = await requireLogin(context);
//   if (login instanceof Response) return login;
export async function requireLogin(context, fetcher = fetch) {
  const { request, env } = context;
  const team = env.ACCESS_TEAM_DOMAIN;
  const audience = env.ACCESS_AUD;
  const allowed = (env.ALLOWED_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!team || !audience || allowed.length === 0) return refuse(500, "not_configured");

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return refuse(401, "not_signed_in");

  let claims;
  try {
    const [head, body, signature, ...extra] = token.split(".");
    if (!head || !body || !signature || extra.length) return refuse(401, "not_signed_in");
    const header = base64UrlJson(head);
    if (header.alg !== "RS256" || !header.kid) return refuse(401, "not_signed_in");
    const key = await keyFor(header.kid, team, fetcher);
    if (!key) return refuse(401, "not_signed_in");
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      base64UrlBytes(signature),
      new TextEncoder().encode(`${head}.${body}`),
    );
    if (!valid) return refuse(401, "not_signed_in");
    claims = base64UrlJson(body);
  } catch {
    return refuse(401, "not_signed_in");
  }

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== `https://${team}`) return refuse(401, "not_signed_in");
  if (!audiences.includes(audience)) return refuse(401, "not_signed_in");
  if (typeof claims.exp !== "number" || claims.exp <= now) return refuse(401, "login_expired");
  if (typeof claims.nbf === "number" && claims.nbf > now + 60) return refuse(401, "not_signed_in");

  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  if (!allowed.includes(email)) return refuse(403, "not_allowed");
  return { email };
}
