import LZString from 'lz-string';
import { GiftData } from '../types';
import dinoPantherLogo from '../assets/images/dino_panther_same_size_1788091439765.jpg';

const DEFAULT_LOGO_TOKEN = '__DEFAULT_LOGO__';

/**
 * Optimizes base64 image strings to crystal-clear, high-definition JPEGs (Full HD 2048px, 0.92 quality)
 * Prevents pixel distortion, blur, or artifacting while keeping storage snappy
 */
export async function optimizeImage(
  dataUrl: string,
  maxDimension = 2048,
  quality = 0.92
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  // If already reasonable (< 500KB), keep original to preserve 100% exact pixels
  if (dataUrl.length < 500000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        } else {
          // If smaller than maxDimension, keep original without re-compressing
          resolve(dataUrl);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      };

      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

/**
 * Strips huge static default assets and replaces them with tiny token keys
 */
export function prepareGiftForEncoding(gift: GiftData): Partial<GiftData> {
  const cloned: Partial<GiftData> = { ...gift };

  // Replace default logo references with tiny token
  if (cloned.coverImage === dinoPantherLogo) {
    cloned.coverImage = DEFAULT_LOGO_TOKEN;
  }
  if (cloned.photoUrl === dinoPantherLogo) {
    cloned.photoUrl = DEFAULT_LOGO_TOKEN;
  }
  if (cloned.locketPhoto === dinoPantherLogo) {
    cloned.locketPhoto = DEFAULT_LOGO_TOKEN;
  }
  if (cloned.captainsLogImage === dinoPantherLogo) {
    cloned.captainsLogImage = DEFAULT_LOGO_TOKEN;
  }

  return cloned;
}

/**
 * Restores tokens back into full asset URLs
 */
export function restoreGiftFromEncoding(gift: Partial<GiftData>): GiftData {
  const restored = { ...gift } as GiftData;

  if (restored.coverImage === DEFAULT_LOGO_TOKEN || !restored.coverImage) {
    restored.coverImage = dinoPantherLogo;
  }
  if (restored.photoUrl === DEFAULT_LOGO_TOKEN || !restored.photoUrl) {
    restored.photoUrl = dinoPantherLogo;
  }
  if (restored.locketPhoto === DEFAULT_LOGO_TOKEN || !restored.locketPhoto) {
    restored.locketPhoto = dinoPantherLogo;
  }
  if (restored.captainsLogImage === DEFAULT_LOGO_TOKEN || !restored.captainsLogImage) {
    restored.captainsLogImage = dinoPantherLogo;
  }

  // Ensure mandatory defaults
  if (!restored.enabledSlides || restored.enabledSlides.length === 0) {
    restored.enabledSlides = [0, 1, 2, 3, 4, 5, 6, 7];
  }
  if (!restored.toPerson) restored.toPerson = 'Panther 🐾✈️';
  if (!restored.fromPerson) restored.fromPerson = 'Dino 🦖';
  if (!restored.fromCity) restored.fromCity = 'Sialkot, Punjab (Pakistan)';
  if (!restored.toCity) restored.toCity = 'Ormara, Balochistan (Pakistan)';

  return restored;
}

/**
 * Encodes a GiftData object into a URL-safe hash fragment (#g=...)
 * Using URL fragments (#) guarantees that the browser NEVER sends the payload to the server,
 * completely eliminating HTTP 413 "Request Entity Too Large" errors on Cloud Run / Proxies!
 */
export function encodeGiftToUrl(gift: GiftData): string {
  try {
    // Also save in localStorage for fast local retrieval
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`panther_gift_${gift.id}`, JSON.stringify(gift));
        if (gift.shareCode) {
          localStorage.setItem(`panther_gift_${gift.shareCode}`, JSON.stringify(gift));
        }
      } catch {
        // ignore quota limits
      }
    }

    const compactGift = prepareGiftForEncoding(gift);
    const jsonString = JSON.stringify(compactGift);

    // Compress with LZString for high efficiency
    const compressed = LZString.compressToEncodedURIComponent(jsonString);

    if (typeof window === 'undefined') {
      return `https://ai.studio/#g=${compressed}`;
    }

    const origin = window.location.origin;
    const pathname = window.location.pathname;

    // Use URL hash fragment (#g=...) so the server never receives a huge GET request
    return `${origin}${pathname}#g=${compressed}`;
  } catch (e) {
    console.error('Error encoding gift payload to URL:', e);
    const code = gift.shareCode || gift.id || 'panther-gift';
    if (typeof window === 'undefined') return `https://ai.studio/#gift=${code}`;
    return `${window.location.origin}${window.location.pathname}#gift=${encodeURIComponent(code)}`;
  }
}

/**
 * Returns a shareable URL for a GiftData object (or share code string)
 * Generates robust hybrid links: embeds ?gift=code for server/cloud lookup AND
 * #g=compressed payload for instant zero-dependency client-side decoding on any device!
 */
export function getShareableUrl(giftOrCode: GiftData | string): string {
  const code =
    typeof giftOrCode === 'string'
      ? giftOrCode
      : giftOrCode.id || giftOrCode.shareCode || 'panther-gift';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai.studio';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (typeof giftOrCode === 'string') {
    return `${origin}${pathname}?gift=${encodeURIComponent(code)}`;
  }

  try {
    const compactGift = prepareGiftForEncoding(giftOrCode);
    const jsonString = JSON.stringify(compactGift);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    if (compressed && compressed.length > 0) {
      return `${origin}${pathname}?gift=${encodeURIComponent(code)}#g=${compressed}`;
    }
  } catch (e) {
    console.warn('Could not compress gift for hash payload:', e);
  }

  return `${origin}${pathname}?gift=${encodeURIComponent(code)}`;
}

/**
 * Decodes a gift payload or share code from URL search query or hash
 * Supports all parameter names (?gift=, ?letter=, ?id=, ?giftId=, ?code=, ?share=, ?view=, ?g=)
 */
export function parseGiftFromUrl(): { gift: GiftData | null; shareCode: string | null } {
  if (typeof window === 'undefined') return { gift: null, shareCode: null };

  try {
    // 1. Check Query Parameters first (?gift=... or ?letter=... or ?id=... or ?g=...)
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);

      // Check compressed payload param (?g= or ?data= or ?giftData=)
      const queryPayload =
        urlParams.get('g') || urlParams.get('giftData') || urlParams.get('data');
      if (queryPayload && queryPayload.trim()) {
        const decoded = decodeGiftPayload(queryPayload.trim());
        if (decoded) {
          const restored = restoreGiftFromEncoding(decoded);
          return {
            gift: restored,
            shareCode: decoded.id || decoded.shareCode || null,
          };
        }
      }

      // Check ID/share code query parameter
      const giftParam =
        urlParams.get('gift') ||
        urlParams.get('letter') ||
        urlParams.get('id') ||
        urlParams.get('giftId') ||
        urlParams.get('code') ||
        urlParams.get('share') ||
        urlParams.get('view');

      if (giftParam && giftParam.trim()) {
        return { gift: null, shareCode: giftParam.trim() };
      }
    }

    // 2. Check Hash Fragment (#g=... or #gift=... or #letter=...)
    let hash = window.location.hash.replace(/^#\/?/, '');
    if (hash) {
      // Direct query string in hash (e.g. #?gift=...)
      if (hash.startsWith('?')) {
        hash = hash.slice(1);
      }

      // If hash contains query-like params
      if (hash.includes('=') || hash.includes('&')) {
        const hashParams = new URLSearchParams(hash);
        const hashPayload =
          hashParams.get('g') || hashParams.get('data') || hashParams.get('giftData');
        if (hashPayload && hashPayload.trim()) {
          const decoded = decodeGiftPayload(hashPayload.trim());
          if (decoded) {
            const restored = restoreGiftFromEncoding(decoded);
            return {
              gift: restored,
              shareCode: decoded.id || decoded.shareCode || null,
            };
          }
        }

        const hashGiftCode =
          hashParams.get('gift') ||
          hashParams.get('letter') ||
          hashParams.get('id') ||
          hashParams.get('giftId') ||
          hashParams.get('code') ||
          hashParams.get('share') ||
          hashParams.get('view');

        if (hashGiftCode && hashGiftCode.trim()) {
          return { gift: null, shareCode: hashGiftCode.trim() };
        }
      } else {
        // Direct string in hash (e.g. #gift-177245... or #letter-177245...)
        const trimmedHash = decodeURIComponent(hash.trim());
        if (
          trimmedHash.startsWith('gift-') ||
          trimmedHash.startsWith('letter-') ||
          trimmedHash.length >= 4
        ) {
          return { gift: null, shareCode: trimmedHash };
        }
      }
    }

    // 3. Check Pathname for /gift/:id or /letter/:id
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/\/(?:gift|letter|share)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch && pathMatch[1]) {
      return { gift: null, shareCode: decodeURIComponent(pathMatch[1]) };
    }
  } catch (e) {
    console.error('Error parsing gift payload from URL:', e);
  }

  return { gift: null, shareCode: null };
}

function tryGetStoredGift(code: string): GiftData | null {
  try {
    const raw = localStorage.getItem(`panther_gift_${code}`);
    if (raw) {
      return JSON.parse(raw) as GiftData;
    }
    const collectionRaw = localStorage.getItem('panther_dino_collection');
    if (collectionRaw) {
      const col = JSON.parse(collectionRaw) as GiftData[];
      const match = col.find(
        (g) => g.id === code || (g.shareCode && g.shareCode.toLowerCase() === code.toLowerCase())
      );
      if (match) return match;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Helper to decode a payload via LZString decompression or Base64 fallback
 */
function decodeGiftPayload(payload: string): GiftData | null {
  try {
    // 1. Try LZString decompression
    const decompressed = LZString.decompressFromEncodedURIComponent(payload);
    if (decompressed) {
      const parsed = JSON.parse(decompressed) as GiftData;
      if (parsed && typeof parsed === 'object' && parsed.title) {
        return parsed;
      }
    }
  } catch {
    // Not LZString, proceed to base64 fallback
  }

  try {
    // 2. Fallback to URL-safe Base64
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonString = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonString) as GiftData;

    if (parsed && typeof parsed === 'object' && parsed.title) {
      return parsed;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Standard cross-browser clipboard copy with robust fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Navigator clipboard failed, attempting fallback:', err);
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}
