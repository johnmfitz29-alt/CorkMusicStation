// The editable data files are strict JSON inside `window.NAME = ...;`, with optional leading comments.
// Workers cannot run the files as JavaScript, so this is the only way they are read.

export function parseDataFile(text, name) {
  const match = text.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)*window\.([A-Z_]+)\s*=\s*([\s\S]*?);?\s*$/);
  if (!match || match[1] !== name) throw new Error(`Expected window.${name} in data file`);
  return JSON.parse(match[2]);
}

// Replaces the value and keeps any leading comment.
export function replaceDataFile(text, name, body) {
  // The comment at the top may mention the name, so skip past it first.
  const lead = text.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)*/)[0];
  if (!text.startsWith(`window.${name}`, lead.length)) throw new Error(`Expected window.${name} in data file`);
  return `${lead}window.${name} = ${body};\n`;
}
