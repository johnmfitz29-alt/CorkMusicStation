// Turns a set of steps into exactly one commit, or nothing at all.

import { parseDataFile, replaceDataFile } from "./datafile.js";
import { emailOwner } from "./email.js";
import { GitHubProblem, gitHub, publishBranch } from "./github.js";
import { Refusal, applyOps, describe, neededFiles, receiptsIn } from "./ops.js";
import { isAllowedWrite } from "./paths.js";
import { readReceipt } from "./receipts.js";

const ATTEMPTS = 4;
const LOG_KEEP = 40;
export const UNDO_REACH = 20;
const FILE_WARN = 18000;
const ID = /^[a-z0-9-]{16,64}$/;

const FILES = {
  posters: ["site/data/posters.js", "POSTERS"],
  gallery: ["site/data/gallery.js", "GALLERY"],
  home: ["site/data/home-photos.js", "HOME_PHOTOS"],
  schedule: ["site/data/schedule.js", "SCHEDULE"],
};
const LOG_PATH = "site/data/change-log.js";
const VERSION_PATH = "site/data/last-change.json";

const lines = (list) => `[\n${list.map((x) => JSON.stringify(x)).join(",\n")}\n]`;
const SERIAL = {
  posters: lines,
  gallery: lines,
  home: lines,
  schedule: (s) => `{\n"weekly": [\n${s.weekly.map((d) => `{ "day": ${JSON.stringify(d.day)}, "shows": [\n${d.shows.map((x) => `  ${JSON.stringify(x)}`).join(",\n")}\n]}`).join(",\n")}\n],\n"oneOffs": ${lines(s.oneOffs)}\n}`,
};

export const validChangeId = (id) => typeof id === "string" && ID.test(id);

export function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export async function readLog(api, ref) {
  const text = await api.readFile(LOG_PATH, ref);
  return text ? parseDataFile(text, "CHANGE_LOG") : [];
}

// An entry can be undone only if nothing newer has touched the same records.
export function undoable(log, index) {
  const entry = log[index];
  if (!entry || index >= UNDO_REACH) return false;
  const mine = new Set(entry.touched);
  return !log.slice(0, index).some((newer) => newer.touched.some((k) => mine.has(k)));
}

async function verifyReceipts(env, ops) {
  const out = new Map();
  for (const ref of receiptsIn(ops)) {
    const payload = await readReceipt(env.RECEIPT_KEY, ref);
    if (!payload) throw new Refusal("bad_receipt");
    out.set(ref, payload);
  }
  return out;
}

// makeOps(log) returns the steps. It runs afresh on each attempt, so it always sees the newest history.
export async function runChange({ env, changeId, makeOps, summaryFor, who, allowDuplicate, origin, typedNames = [] }) {
  const branch = publishBranch(env);
  if (!branch || !env.GITHUB_REPO || !env.GITHUB_TOKEN || !env.RECEIPT_KEY) return reply(500, { ok: false, code: "not_configured" });
  if (!validChangeId(changeId)) return reply(400, { ok: false, code: "bad_request" });

  const api = gitHub(env);
  try {
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      const head = await api.head(branch);
      const log = await readLog(api, head);
      if (log.some((e) => e.id === changeId)) return reply(200, { ok: true, changeId, already: true });

      const ops = makeOps(log);
      const receipts = await verifyReceipts(env, ops);
      const baseTree = await api.treeOf(head);
      const tree = await api.files(baseTree);

      const state = {};
      const texts = {};
      for (const name of neededFiles(ops)) {
        const [path, global] = FILES[name];
        texts[name] = await api.readFile(path, head);
        state[name] = parseDataFile(texts[name], global);
      }
      const before = JSON.stringify(state);
      const { undo, touched, images, newNames } = applyOps(state, ops, { tree, receipts, changeId, allowDuplicate });

      const entries = [];
      const add = (path, action, extra) => {
        if (!isAllowedWrite(path, action)) throw new Refusal("path_not_allowed", path);
        entries.push({ path, mode: "100644", type: "blob", ...extra });
      };
      const paths = new Map();
      for (const image of images) paths.set(image.path, image);
      for (const image of paths.values()) {
        if (image.action === "delete") add(image.path, "delete", { sha: null });
        else add(image.path, "create", { sha: image.sha });
      }
      const was = JSON.parse(before);
      for (const name of Object.keys(state)) {
        if (JSON.stringify(was[name]) === JSON.stringify(state[name])) continue;
        const [path, global] = FILES[name];
        const content = replaceDataFile(texts[name], global, SERIAL[name](state[name]));
        // Never save a file unless it reads back exactly as intended.
        if (JSON.stringify(parseDataFile(content, global)) !== JSON.stringify(state[name])) throw new Refusal("file_check_failed", name);
        add(path, "update", { content });
      }

      const summary = summaryFor ? summaryFor(ops, log) : describe(ops);
      const entry = { id: changeId, at: new Date().toISOString(), summary, touched, undo };
      const logText = `/* The record behind Undo. Written only by the admin area. */\nwindow.CHANGE_LOG = ${lines([entry, ...log].slice(0, LOG_KEEP))};\n`;
      add(LOG_PATH, "update", { content: logText });
      add(VERSION_PATH, "update", { content: `${JSON.stringify({ id: changeId })}\n` });

      const newTree = await api.createTree(baseTree, entries);
      const commit = await api.createCommit(`${summary}\n\nAdmin-Change: ${changeId}\n`, newTree, head);
      try {
        await api.moveBranch(branch, commit);
      } catch (e) {
        if (e instanceof GitHubProblem && e.status === 422) continue; // Someone else got in first, so rebuild.
        throw e;
      }

      const warnings = tree.size >= FILE_WARN ? `\n\nWarning: the project has ${tree.size} files, nearing the host's limit of 20,000.` : "";
      const allNames = [...newNames, ...typedNames];
      const named = allNames.length ? `\n\nNew names to check: ${allNames.join(", ")}` : "";
      await emailOwner(env, `Website changed: ${summary}`, `${who} ${summary}.${named}${warnings}\n\nCheck it or undo it: ${origin}/admin/\n`);
      return reply(200, { ok: true, changeId, summary });
    }
    await emailOwner(env, "Website change could not be saved", `A change kept colliding with other changes: ${changeId}`);
    return reply(503, { ok: false, code: "busy" });
  } catch (e) {
    if (e instanceof Refusal) return reply(422, { ok: false, code: e.code, detail: e.detail });
    if (e instanceof TypeError) return reply(422, { ok: false, code: "bad_request" }); // A malformed step.
    const status = e instanceof GitHubProblem ? e.status : 0;
    // A picture GitHub no longer holds, after a very old draft, has to be sent again.
    if (status === 422 && e.where === "createTree") return reply(409, { ok: false, code: "send_pictures_again" });
    if (status === 403 || status === 429) return reply(503, { ok: false, code: "slow_down" });
    await emailOwner(env, "Website change failed", `${who}: nothing was changed. ${e.message}. Change ${changeId}.`);
    return reply(502, { ok: false, code: "try_later" });
  }
}
