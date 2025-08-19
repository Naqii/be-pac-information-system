export function formatSlug(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}
