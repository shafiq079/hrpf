// Accept individual public videos only. Never accept arbitrary embed markup/hosts.
export function videoLink(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');else id = /^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
    } else if (host === 'youtu.be') id = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return {
      provider: 'youtube' as const,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`
    };
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host) && !url.search) {
      id = /^(?:\/video)?\/([0-9]{6,12})\/?$/.exec(url.pathname)?.[1] ?? null;
      if (id) return {
        provider: 'vimeo' as const,
        watchUrl: `https://vimeo.com/${id}`,
        embedUrl: `https://player.vimeo.com/video/${id}`
      };
    }
  } catch {/* Invalid URL. */}
  return null;
}
// Saved links are normalized; match before counting/paginating public interviews.
export const canonicalVideoPattern = /^https:\/\/(?:www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}|vimeo\.com\/[0-9]{6,12})$/;
