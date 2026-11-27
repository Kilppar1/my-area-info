import fs from "node:fs";
import path from "node:path";

type DictionaryEntry = {
  word: string;
  frequency: number;
};

let dictionary: Map<string, number> | null = null;

function loadDictionary(): Map<string, number> {
  if (dictionary) return dictionary;

  const filePath = path.join(process.cwd(), "src/data/english-frequency.txt");

  const contents = fs.readFileSync(filePath, "utf8");

  dictionary = new Map<string, number>();

  for (const line of contents.split(/\r?\n/)) {
    const [word, frequency] = line.trim().split(/\s+/);

    if (!word || !frequency) continue;

    dictionary.set(word.toLowerCase(), Number(frequency));
  }

  return dictionary;
}

// Check whether two words have exactly one edit difference.
function hasOneEditDifference(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;

  let i = 0;
  let j = 0;
  let differences = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }

    differences++;

    if (differences > 1) return false;

    if (a.length > b.length) {
      i++;
    } else if (b.length > a.length) {
      j++;
    } else {
      i++;
      j++;
    }
  }

  if (i < a.length || j < b.length) {
    differences++;
  }

  return differences === 1;
}

// Find a spelling suggestion.
export function suggestSpelling(word: string): string | null {
  const normalized = word.toLowerCase().trim();

  if (!normalized || !/^[a-z]+$/.test(normalized)) {
    return null;
  }

  const words = loadDictionary();

  // Don't suggest corrections for correctly spelled words.
  if (words.has(normalized)) return null;

  const matches: DictionaryEntry[] = [];

  for (const [candidate, frequency] of words) {
    if (hasOneEditDifference(normalized, candidate)) {
      matches.push({ word: candidate, frequency });
    }
  }

  matches.sort((a, b) => b.frequency - a.frequency);

  return matches[0]?.word ?? null;
}
