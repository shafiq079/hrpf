/** Resolve completed React HTML chunks for source-based content assertions.
 * Browser tests separately verify the temporary loading UI itself. */
export function completedHtml(source) {
  const chunks = new Map(), removals = [], replacements = new Map();
  for (const match of source.matchAll(/<div hidden(?:="")? id="([^"]+)">/g)) {
    const start = match.index + match[0].length;
    const tags = /<\/?div\b[^>]*>/g;
    tags.lastIndex = start;
    let depth = 1, tag;
    while ((tag = tags.exec(source))) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (!depth) {
        chunks.set(match[1], source.slice(start, tag.index));
        removals.push([match.index, tags.lastIndex]);
        break;
      }
    }
  }
  for (const match of source.matchAll(/\$(RC|RS)\("([^"]+)","([^"]+)"\)/g)) {
    const placeholder = match[1] === 'RC' ? match[2] : match[3];
    const chunk = match[1] === 'RC' ? match[3] : match[2];
    if (chunks.has(chunk)) replacements.set(placeholder, chunks.get(chunk));
  }
  for (const [start, end] of removals.sort((a, b) => b[0] - a[0])) source = source.slice(0, start) + source.slice(end);
  for (let pass = 0; pass < 64; pass++) {
    let changed = false;
    source = source.replace(/<template id="([^"]+)"><\/template>/g, (template, id) => {
      if (!replacements.has(id)) return template;
      changed = true;
      return replacements.get(id);
    });
    if (!changed) break;
  }
  return source.replace(/<main\b[^>]*data-page-loading="[^"]*"[^>]*>[\s\S]*?<\/main>/g, '');
}
