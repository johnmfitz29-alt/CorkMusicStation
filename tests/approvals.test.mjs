import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDataFile } from "../functions/_lib/datafile.js";
import { planApprovals } from "../tools/apply-approvals.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const posters = parseDataFile(fs.readFileSync(path.join(root, "site/data/posters.js"), "utf8"), "POSTERS");
const BEFORE = '{ title: "Sean Interviews Ger Wolfe" }, { title: "Willie Interviews Louise Morrissey." }';
const stale = (f) => fs.readFileSync(path.join(root, f), "utf8");

function answers(change = {}) {
  const dates = Object.fromEntries(posters.map((p, i) => [p.file, i ? { lastDate: "2027-05-01" } : { noEnd: true }]));
  return {
    version: 1, posters: dates,
    names: { presenters: ["Seán Radley"], events: ["Glór Tíre"], venues: ["Salthill"], protected: ["Castleahan"] },
    pairs: { "Glor Tire": "Glór Tíre" },
    answers: { willie: "same", george: "same", seanFada: "leave", morrisseyStop: "leave" },
    ...change,
  };
}

test("good answers plan the right files and write nothing", () => {
  const before = stale("site/data/posters.js");
  const plan = planApprovals(root, answers());
  assert.deepEqual(plan.problems, []);
  assert.deepEqual(Object.keys(plan.writes).sort(), ["site/data/names.js", "site/data/posters.js"]);
  assert.equal(stale("site/data/posters.js"), before);
  const out = parseDataFile(plan.writes["site/data/posters.js"], "POSTERS");
  assert.equal(out[0].noEnd, true);
  assert.equal(out[1].lastDate, "2027-05-01");
  assert.equal(out[1].w, posters[1].w);
  const names = parseDataFile(plan.writes["site/data/names.js"], "NAMES");
  assert.deepEqual(names.presenters, ["Seán Radley"]);
  assert.deepEqual(names.misspellings, { "Glor Tire": "Glór Tíre" });
});

test("only chosen Archives titles change", () => {
  const plan = planApprovals(root, answers({ answers: { willie: "same", george: "different", seanFada: "change", morrisseyStop: "leave" } }), { interviewsText: BEFORE });
  assert.deepEqual(plan.problems, []);
  const text = plan.writes["site/data/interviews.js"];
  assert.ok(text.includes('"Seán Interviews Ger Wolfe"'));
  assert.ok(text.includes('"Willie Interviews Louise Morrissey."'));
});

test("bad answers are refused", () => {
  const first = posters[0].file;
  const cases = {
    "wrong file": { version: 2 },
    "impossible date": { posters: { ...answers().posters, [first]: { lastDate: "2027-02-29" } } },
    "date and no end": { posters: { ...answers().posters, [first]: { lastDate: "2027-02-20", noEnd: true } } },
    "blank poster": { posters: { ...answers().posters, [first]: {} } },
    "unknown poster": { posters: { ...answers().posters, "images/posters/nope.jpg": { noEnd: true } } },
    "empty list": { names: { ...answers().names, presenters: [] } },
    "script in a name": { names: { ...answers().names, venues: ["<script>"] } },
    "duplicate name": { names: { ...answers().names, venues: ["Salthill", "Salthill"] } },
    "misspelling also correct": { pairs: { Salthill: "Salthill Park" } },
    "unanswered": { answers: { willie: "same" } },
  };
  for (const [name, change] of Object.entries(cases)) {
    assert.ok(planApprovals(root, answers(change)).problems.length > 0, name);
  }
});
