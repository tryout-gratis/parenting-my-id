/**
 * Video Embed Utility
 * Supports YouTube, TikTok, and Instagram responsive embeds for articles and editors.
 */

export interface ParsedVideo {
  type: 'youtube' | 'tiktok' | 'instagram';
  platform: 'youtube' | 'tiktok' | 'instagram';
  id: string;
  originalUrl: string;
  embedUrl: string;
  embedHtml: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Match:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://m.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID
  const patterns = [
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract TikTok video ID from URL
 */
export function extractTikTokId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Match:
  // https://www.tiktok.com/@username/video/1234567890123456789
  // https://www.tiktok.com/embed/v2/1234567890123456789
  // https://m.tiktok.com/v/1234567890123456789.html
  const patterns = [
    /tiktok\.com\/@[^/?#]+\/video\/(\d+)/i,
    /tiktok\.com\/embed\/v2\/(\d+)/i,
    /tiktok\.com\/v\/(\d+)/i,
    /^(\d{15,25})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Instagram post/reel ID from URL
 */
export function extractInstagramId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Match:
  // https://www.instagram.com/p/CODE/
  // https://www.instagram.com/reel/CODE/
  // https://instagr.am/p/CODE/
  // https://www.instagram.com/tv/CODE/
  const patterns = [
    /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i,
    /instagr\.am\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate responsive HTML embed for YouTube
 */
export function generateYouTubeEmbed(videoId: string): string {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  return `<div class="video-embed-wrapper video-youtube-wrapper my-8 w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-black"><iframe src="${embedUrl}" class="w-full h-full border-0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
}

/**
 * Generate responsive HTML embed for TikTok
 */
export function generateTikTokEmbed(videoId: string): string {
  const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
  return `<div class="video-embed-wrapper video-tiktok-wrapper my-8 flex justify-center w-full"><div class="w-full max-w-[360px] aspect-[9/16] min-h-[580px] max-h-[680px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-black"><iframe src="${embedUrl}" class="w-full h-full border-0" title="TikTok video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div>`;
}

/**
 * Generate responsive HTML embed for Instagram (Posts / Reels)
 */
export function generateInstagramEmbed(postId: string): string {
  const embedUrl = `https://www.instagram.com/p/${postId}/embed/`;
  return `<div class="video-embed-wrapper video-instagram-wrapper my-8 flex justify-center w-full"><div class="w-full max-w-[460px] min-h-[520px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><iframe src="${embedUrl}" class="w-full h-[540px] sm:h-[580px] border-0" title="Instagram post or reel" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy"></iframe></div></div>`;
}

/**
 * Parse any supported video URL (YouTube, TikTok, Instagram)
 */
export function parseVideoUrl(input: string): ParsedVideo | null {
  if (!input) return null;
  const cleanInput = input.trim();

  // 1. YouTube
  const ytId = extractYouTubeId(cleanInput);
  if (ytId) {
    return {
      type: 'youtube',
      platform: 'youtube',
      id: ytId,
      originalUrl: cleanInput,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`,
      embedHtml: generateYouTubeEmbed(ytId),
    };
  }

  // 2. TikTok
  const ttId = extractTikTokId(cleanInput);
  if (ttId) {
    return {
      type: 'tiktok',
      platform: 'tiktok',
      id: ttId,
      originalUrl: cleanInput,
      embedUrl: `https://www.tiktok.com/embed/v2/${ttId}`,
      embedHtml: generateTikTokEmbed(ttId),
    };
  }

  // 3. Instagram
  const igId = extractInstagramId(cleanInput);
  if (igId) {
    return {
      type: 'instagram',
      platform: 'instagram',
      id: igId,
      originalUrl: cleanInput,
      embedUrl: `https://www.instagram.com/p/${igId}/embed/`,
      embedHtml: generateInstagramEmbed(igId),
    };
  }

  return null;
}

/**
 * Transforms standalone video URLs in Markdown or HTML into responsive embed containers
 */
export function transformVideoEmbeds(content: string): string {
  if (!content) return content;

  let result = content;

  // 1. Transform markdown custom tokens if any: [video:URL] or [youtube:ID]
  result = result.replace(/\[(?:video|embed):([^\s\]]+)\]/gi, (_match, url) => {
    const parsed = parseVideoUrl(url);
    return parsed ? `\n\n${parsed.embedHtml}\n\n` : url;
  });

  result = result.replace(/\[youtube:([a-zA-Z0-9_-]{11})\]/gi, (_match, id) => {
    return `\n\n${generateYouTubeEmbed(id)}\n\n`;
  });

  result = result.replace(/\[tiktok:(\d+)\]/gi, (_match, id) => {
    return `\n\n${generateTikTokEmbed(id)}\n\n`;
  });

  result = result.replace(/\[instagram:([a-zA-Z0-9_-]+)\]/gi, (_match, id) => {
    return `\n\n${generateInstagramEmbed(id)}\n\n`;
  });

  // 2. Transform standalone URLs on their own lines in Markdown:
  // e.g. https://www.youtube.com/watch?v=...
  // or https://www.tiktok.com/@user/video/...
  // or https://www.instagram.com/p/...
  const linePattern = /^(https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be|tiktok\.com|instagram\.com|instagr\.am)\/[^\s<"'>]+)$/gim;
  result = result.replace(linePattern, (url) => {
    const parsed = parseVideoUrl(url);
    if (parsed) {
      return `\n\n${parsed.embedHtml}\n\n`;
    }
    return url;
  });

  // 3. Transform paragraphs containing ONLY a video link in generated HTML:
  // e.g. <p><a href="https://www.youtube.com/watch?v=...">https://www.youtube.com/...</a></p>
  // or <p>https://www.youtube.com/watch?v=...</p>
  result = result.replace(/<p>\s*(?:<a[^>]+href="([^"]+)"[^>]*>[^<]+<\/a>|(https?:\/\/[^\s<]+))\s*<\/p>/gi, (match, href1, href2) => {
    const targetUrl = href1 || href2;
    if (targetUrl) {
      const parsed = parseVideoUrl(targetUrl);
      if (parsed) {
        return parsed.embedHtml;
      }
    }
    return match;
  });

  return result;
}
