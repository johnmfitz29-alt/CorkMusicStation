// What a name or title may contain. Used by the admin functions and by the build check,
// so both apply exactly the same rule.
//
// Refused: markup, control characters, look-alike spaces, and every way of making one name pass
// for another or of hiding characters inside it: invisible and direction-changing characters,
// letters from other alphabets that look like ours (a Cyrillic "o"), stand-alone accents that
// stack on a letter, full-width and styled letter forms, and blank symbols.
// Accented letters such as the fadas in Seán and Glór Tíre are ordinary Latin letters and pass.

const span = (from, to) => `${String.fromCharCode(from)}-${String.fromCharCode(to)}`;
const MARKUP_OR_CONTROL = /[<>\u0000-\u001f\u007f-\u009f]/;
const ODD_SPACE = /[^\P{Z} ]/u; // Any space or separator other than the ordinary space.
// Format characters (soft hyphen, zero-width, direction marks, tags), private-use, unassigned and broken halves.
const INVISIBLE = /[\p{Cf}\p{Co}\p{Cn}\p{Cs}]/u;
const STACKING_ACCENT = /\p{M}/u;
const FOREIGN_LETTER = /[^\P{L}\p{Script=Latin}]/u;
// Full-width forms, blank braille patterns and the "specials" block.
const STYLED_OR_BLANK = new RegExp(`[${span(0x2800, 0x28ff)}${span(0xff00, 0xffff)}]`);

export function badText(value) {
  return typeof value !== "string"
    || MARKUP_OR_CONTROL.test(value)
    || ODD_SPACE.test(value)
    || INVISIBLE.test(value)
    || STACKING_ACCENT.test(value)
    || FOREIGN_LETTER.test(value)
    || STYLED_OR_BLANK.test(value)
    || value !== value.normalize("NFC");
}
