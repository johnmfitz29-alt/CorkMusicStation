// Applies the answers saved from review/approvals.html.
//   node tools/apply-approvals.mjs path\to\approvals.json            shows what would change, writes nothing
//   node tools/apply-approvals.mjs path\to\approvals.json --apply    writes the changes (it never commits or pushes)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDataFile } from "../functions/_lib/datafile.js";
import { checkSite } from "./check-site.mjs";

const NAME_LISTS = ["presenters", "events", "venues", "protected"];
const REQUIRED_LISTS = ["presenters", "events", "venues"];
const QUESTIONS = { willie: ["same", "different"], george: ["same", "different"], seanFada: ["leave", "change"], morrisseyStop: ["leave", "change"] };
const INTERVIEW_EDITS = {
  seanFada: ["Sean Interviews Ger Wolfe", "Seán Interviews Ger Wolfe"],
  morrisseyStop: ["Willie Interviews Louise Morrissey.", "Willie Interviews Louise Morrissey"],
};

function realDate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

function cleanName(value) {
  return typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= 120 && !/[<>\u0000-\u001f]/.test(value);
}

// Works out every change without writing anything.
export function planApprovals(root, answers, { interviewsText } = {}) {
  const problems = [];
  const summary = [];
  const notes = [];
  const writes = {};
  const dataPath = (name) => path.join(root, "site/data", name);

  if (!answers || answers.version !== 1) return { problems: ["This is not an answers file from the approvals page."], summary, notes, writes };

  const postersText = fs.readFileSync(dataPath("posters.js"), "utf8");
  const posters = parseDataFile(postersText, "POSTERS");
  const given = answers.posters || {};
  for (const file of Object.keys(given)) {
    if (!posters.some((p) => p.file === file)) problems.push(`Answer for a poster that isn't on the site: ${file}`);
  }
  const updated = posters.map((poster) => {
    const answer = given[poster.file];
    const { lastDate, noEnd, ...base } = poster;
    if (answer?.noEnd === true && answer.lastDate === undefined) {
      summary.push(`Poster ${poster.file.split("/").pop()}: no end date`);
      return { ...base, noEnd: true };
    }
    if (answer && realDate(answer.lastDate) && answer.noEnd === undefined) {
      summary.push(`Poster ${poster.file.split("/").pop()}: last date ${answer.lastDate}`);
      return { ...base, lastDate: answer.lastDate };
    }
    problems.push(`No valid date for poster ${poster.file}`);
    return poster;
  });
  const body = `[\n${updated.map((p) => `  ${JSON.stringify(p)}`).join(",\n")}\n]`;
  const header = postersText.slice(0, postersText.indexOf("window.POSTERS"));
  writes["site/data/posters.js"] = `${header}window.POSTERS = ${body};\n`;

  const names = {};
  const lists = answers.names || {};
  for (const key of NAME_LISTS) {
    const list = lists[key];
    if (!Array.isArray(list) || (REQUIRED_LISTS.includes(key) && list.length === 0)) {
      problems.push(`The ${key} list is missing or empty`);
      names[key] = [];
      continue;
    }
    for (const name of list) if (!cleanName(name)) problems.push(`Name not allowed in ${key}: ${JSON.stringify(name)}`);
    if (new Set(list).size !== list.length) problems.push(`A name appears twice in ${key}`);
    names[key] = list;
  }

  const correct = new Set(NAME_LISTS.flatMap((key) => names[key]));
  const pairs = answers.pairs && typeof answers.pairs === "object" ? answers.pairs : {};
  for (const [wrong, right] of Object.entries(pairs)) {
    if (!cleanName(wrong) || !cleanName(right)) problems.push(`Misspelling pair not allowed: ${wrong}`);
    if (correct.has(wrong)) problems.push(`"${wrong}" is listed as both a correct name and a misspelling`);
  }
  names.misspellings = pairs;

  const nameBody = `{\n${[...NAME_LISTS, "misspellings"].map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(names[k])}`).join(",\n")}\n}`;
  writes["site/data/names.js"] = `/* Master names list, approved by the owner. The admin area reads this and can never change it. */\nwindow.NAMES = ${nameBody};\n`;
  summary.push(`Names list: ${names.presenters.length} presenters, ${names.events.length} events and acts, ${names.venues.length} venues, ${names.protected.length} protected, ${Object.keys(pairs).length} misspelling pairs`);

  const replies = answers.answers || {};
  for (const [id, allowed] of Object.entries(QUESTIONS)) {
    if (!allowed.includes(replies[id])) problems.push(`Question not answered: ${id}`);
  }
  const interviewsBefore = interviewsText ?? fs.readFileSync(dataPath("interviews.js"), "utf8");
  let interviews = interviewsBefore;
  for (const [id, [from, to]] of Object.entries(INTERVIEW_EDITS)) {
    if (replies[id] !== "change") continue;
    const count = interviews.split(`"${from}"`).length - 1;
    if (count !== 1) { problems.push(`Could not find exactly one "${from}" in the Archives`); continue; }
    interviews = interviews.replace(`"${from}"`, `"${to}"`);
    summary.push(`Archives title: "${from}" becomes "${to}"`);
  }
  if (interviews !== interviewsBefore) writes["site/data/interviews.js"] = interviews;

  for (const [id, label] of [["willie", "Willie and Willie Fitzgerald"], ["george", "George and George F Langan"]]) {
    if (replies[id]) notes.push(`${label}: ${replies[id] === "same" ? "same person" : "different people"} (no change to the site)`);
  }

  if (!problems.length) {
    const check = checkSite(root, { overrides: { "posters.js": writes["site/data/posters.js"] }, gitLog: "" });
    problems.push(...check.failures);
  }
  return { problems, summary, notes, writes };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const file = args.find((a) => a !== "--apply");
  if (!file) {
    console.error("Say where the answers file is: node tools/apply-approvals.mjs path\\to\\approvals.json");
    process.exit(2);
  }
  let answers;
  try {
    answers = JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch (e) {
    console.error(`Could not read that file: ${e.message}`);
    process.exit(2);
  }
  const plan = planApprovals(root, answers);
  if (plan.problems.length) {
    console.error("Nothing was changed, because:");
    for (const p of plan.problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  for (const s of plan.summary) console.log(s);
  for (const n of plan.notes) console.log(`Noted: ${n}`);
  console.log(`\nFiles: ${Object.keys(plan.writes).join(", ")}`);
  if (!apply) {
    console.log("\nThis was a preview. Nothing was changed. Add --apply to write these.");
  } else {
    for (const [name, text] of Object.entries(plan.writes)) fs.writeFileSync(path.join(root, name), text);
    console.log("\nWritten. Nothing was committed or pushed.");
  }
}
