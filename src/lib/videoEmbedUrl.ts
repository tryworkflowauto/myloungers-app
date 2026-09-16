/**
 * Converts a YouTube or Vimeo URL into a standard embed URL.
 * The video ID is always parsed from the given string; nothing is hardcoded.
 */

const YOUTUBE_EMBED_PREFIX = "https://www.youtube.com/embed/";
const VIMEO_EMBED_PREFIX = "https://player.vimeo.com/video/";

const YT_YOUTU_BE = /youtu\.be\/([\w-]{11})/i;
const YT_EMBED = /youtube\.com\/embed\/([\w-]{11})/i;
const YT_SHORTS = /youtube\.com\/shorts\/([\w-]{11})/i;
const YT_WATCH_V = /[?&]v=([\w-]{11})/;
const YT_HOST = /youtube\.com/i;
const VIMEO_PLAYER = /player\.vimeo\.com\/video\/(\d+)/i;
const VIMEO_PAGE = /vimeo\.com\/(\d+)/i;

function extractYoutubeId(raw: string): string | null {
  const youtuBe = raw.match(YT_YOUTU_BE);
  if (youtuBe) return youtuBe[1];

  const embed = raw.match(YT_EMBED);
  if (embed) return embed[1];

  const shorts = raw.match(YT_SHORTS);
  if (shorts) return shorts[1];

  if (YT_HOST.test(raw)) {
    const fromQuery = raw.match(YT_WATCH_V);
    if (fromQuery) return fromQuery[1];
  }

  return null;
}

function extractVimeoId(raw: string): string | null {
  const player = raw.match(VIMEO_PLAYER);
  if (player) return player[1];
  const page = raw.match(VIMEO_PAGE);
  if (page) return page[1];
  return null;
}

export function toEmbedUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return raw;

  const youtubeId = extractYoutubeId(raw);
  if (youtubeId) return `${YOUTUBE_EMBED_PREFIX}${youtubeId}`;

  const vimeoId = extractVimeoId(raw);
  if (vimeoId) return `${VIMEO_EMBED_PREFIX}${vimeoId}`;

  return raw;
}
