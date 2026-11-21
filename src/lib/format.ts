/** Zero-pads an index or count to two digits ("01", "12"). */
export function twoDigit(value: number): string {
  return String(value).padStart(2, "0");
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** Spells small counts out ("two"); larger ones stay as digits. */
export function spelledCount(count: number): string {
  return NUMBER_WORDS[count] ?? String(count);
}

/** Upper-cases the first letter and leaves the rest as written. */
export function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
