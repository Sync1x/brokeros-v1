function toTitleCaseWord(word: string) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function humanizeKey(value: string | null | undefined): string {
  if (!value?.trim()) return '';

  return value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(toTitleCaseWord)
    .join(' ');
}

export function humanizeList(values: string[] | null | undefined): string[] {
  if (!values?.length) return [];

  return values.map((value) => humanizeKey(value)).filter(Boolean);
}
