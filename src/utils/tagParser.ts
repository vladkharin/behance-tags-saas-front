/**
 * Smart tag parser for handling Excel columns, text lists, commas, semicolons, tabs, and bullet points.
 */
export function parseTagsInput(input: string): string[] {
  if (!input || typeof input !== "string") return [];

  // Split by newlines (\n, \r), tabs (\t), commas (,), semicolons (;), or pipe (|)
  const rawParts = input.split(/[\n\r\t,;|]+/);

  const cleanedTags: string[] = [];
  const seen = new Set<string>();

  for (const part of rawParts) {
    // Clean leading bullets (•, -, *), list numbers (1. ), hashes (#), quotes, and excess whitespace
    const tag = part
      .replace(/^[\s•\-*]+/g, "")
      .replace(/^\d+\.\s*/g, "")
      .replace(/^#+/g, "")
      .replace(/["']/g, "")
      .trim()
      .toLowerCase();

    if (tag.length > 0 && !seen.has(tag)) {
      seen.add(tag);
      cleanedTags.push(tag);
    }
  }

  return cleanedTags;
}
