// The kinds of page an entry on the Links page can have, and the only addresses each kind accepts.
// Used by the admin functions and by the build check, so both apply exactly the same rules.

const SOCIAL_HOSTS = {
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  instagram: ["instagram.com", "www.instagram.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
  spotify: ["open.spotify.com"],
};

export const LINK_TYPES = ["website", ...Object.keys(SOCIAL_HOSTS)];
export const MAX_LINK_ADDRESS = 200;

const NOT_ALLOWED = /[\s<>"'`\\^{}|]/;
const HOST_NAME = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

// Returns the address in its standard form, or null if it is not a safe address of that kind.
// Only https is accepted, with no sign-in details or port, so a link can never run code or hide where it goes.
export function cleanPageUrl(type, address) {
  if (!LINK_TYPES.includes(type) || typeof address !== "string") return null;
  if (!address || address.length > MAX_LINK_ADDRESS || NOT_ALLOWED.test(address)) return null;
  for (let i = 0; i < address.length; i++) {
    const code = address.charCodeAt(i);
    if (code < 33 || code > 126) return null;
  }
  let url;
  try {
    url = new URL(address);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  const host = url.hostname.toLowerCase();
  if (!HOST_NAME.test(host)) return null;
  if (type !== "website") {
    if (!SOCIAL_HOSTS[type].includes(host)) return null;
    if (url.pathname.length < 2) return null; // The service's front page is not anyone's page.
  }
  return url.href;
}
