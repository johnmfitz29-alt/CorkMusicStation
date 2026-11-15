// The only places the admin area may write. GitHub tokens cannot be limited by folder, so this list is the limit.
// names.js, config.js and the other data files are deliberately absent.

export const DATA_FILES = new Set([
  "site/data/schedule.js",
  "site/data/posters.js",
  "site/data/gallery.js",
  "site/data/home-photos.js",
  "site/data/links.js",
  "site/data/change-log.js",
  "site/data/last-change.json",
]);

// Presenter photos can be added, because a new presenter needs one. The station's own presenter photos
// can never be removed. One the admin area added itself, which has a generated name, can be removed
// again when that change is undone.
const GENERATED_NAME = /^[0-9a-f]{16}(-[a-z0-9-]+)?\.jpg$/;
const IMAGE_FOLDERS = {
  posters: ["create", "delete"],
  gallery: ["create", "delete"],
  collection: ["create", "delete"],
  presenters: ["create"],
  links: ["create", "delete"],
};

// Underscores and .png appear only in older photos' names, which can still be taken down or put back.
// New pictures always get a generated .jpg name.
const IMAGE_PATH = /^site\/images\/([a-z]+)\/([a-z0-9][a-z0-9_-]{0,99}\.(?:jpg|png))$/;

// action is "create", "update" or "delete".
export function isAllowedWrite(path, action) {
  if (typeof path !== "string" || !["create", "update", "delete"].includes(action)) return false;
  if (DATA_FILES.has(path)) return action === "update" || action === "create";
  const match = path.match(IMAGE_PATH);
  if (!match) return false;
  const actions = Object.hasOwn(IMAGE_FOLDERS, match[1]) ? IMAGE_FOLDERS[match[1]] : null;
  if (match[1] === "presenters" && action === "delete") return GENERATED_NAME.test(match[2]);
  return !!actions && actions.includes(action);
}
