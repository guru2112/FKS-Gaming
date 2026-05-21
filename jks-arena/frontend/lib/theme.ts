const THEME_CACHE_KEY = "jks_theme_bg";
const CACHE_VERSION = "v6";

interface ThemeCache {
  url: string;
  bgColor: string;
  neonColor: string;
  version: string;
}

/**
 * Convert RGB to a vivid neon hex color.
 */
function toNeon(r: number, g: number, b: number): string {
  // Boost saturation by pushing channels apart from mid-gray
  const boost = (v: number) => {
    if (v < 128) return Math.max(0, Math.round(v * 0.6));
    return Math.min(255, Math.round(v + (255 - v) * 0.5));
  };
  return `#${boost(r).toString(16).padStart(2, "0")}${boost(g).toString(16).padStart(2, "0")}${boost(b).toString(16).padStart(2, "0")}`;
}

/**
 * Blend dominant image color with white to produce a light tint.
 * ratio 0.85 = 85% white + 15% dominant color
 */
function blendWithWhite(r: number, g: number, b: number, ratio = 0.75): string {
  const tr = Math.round(r + (255 - r) * ratio);
  const tg = Math.round(g + (255 - g) * ratio);
  const tb = Math.round(b + (255 - b) * ratio);
  return `#${tr.toString(16).padStart(2, "0")}${tg.toString(16).padStart(2, "0")}${tb.toString(16).padStart(2, "0")}`;
}

/**
 * Extract dominant color from an image using canvas.
 * Uses histogram-based quantization for better accuracy.
 */
function extractColorFromImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject("No canvas context"); return; }

        // Sample at larger size for better color detection
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;

        // Quantize colors into buckets and count frequency
        const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {};
        const bucketSize = 32; // 256/32 = 8 levels per channel = 512 buckets

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip near-black pixels (< 25)
          if (r < 25 && g < 25 && b < 25) continue;

          // Skip near-white pixels (> 230)
          if (r > 230 && g > 230 && b > 230) continue;

          // Skip very low saturation pixels (gray tones)
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max > 0 ? (max - min) / max : 0;
          if (saturation < 0.08) continue;

          // Quantize into bucket
          const br = Math.floor(r / bucketSize);
          const bg = Math.floor(g / bucketSize);
          const bb = Math.floor(b / bucketSize);
          const key = `${br},${bg},${bb}`;

          if (!buckets[key]) {
            buckets[key] = { r: 0, g: 0, b: 0, count: 0 };
          }
          buckets[key].r += r;
          buckets[key].g += g;
          buckets[key].b += b;
          buckets[key].count++;
        }

        // Find the most frequent bucket
        let bestKey = "";
        let bestCount = 0;
        for (const key in buckets) {
          if (buckets[key].count > bestCount) {
            bestCount = buckets[key].count;
            bestKey = key;
          }
        }

        // Get average color of the winning bucket
        const best = buckets[bestKey];
        if (!best || bestCount === 0) {
          // Fallback: use full image average if all pixels were filtered
          let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            rTotal += data[i]; gTotal += data[i + 1]; bTotal += data[i + 2]; count++;
          }
          const r = Math.round(rTotal / count);
          const g = Math.round(gTotal / count);
          const b = Math.round(bTotal / count);
          resolve(`${blendWithWhite(r, g, b)}|${toNeon(r, g, b)}`);
          return;
        }

        const r = Math.round(best.r / bestCount);
        const g = Math.round(best.g / bestCount);
        const b = Math.round(best.b / bestCount);

        resolve(`${blendWithWhite(r, g, b)}|${toNeon(r, g, b)}`);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject("Image load failed (CORS or network)");
    img.src = url;
  });
}

/**
 * Extract dominant color from topbar image and cache it.
 * Dispatches 'jks-theme-updated' event on completion.
 */
async function extractAndCache(url: string) {
  try {
    const raw = await extractColorFromImage(url);
    const [bgColor, neonColor] = raw.split("|");

    const cache: ThemeCache = { url, bgColor, neonColor, version: CACHE_VERSION };
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(cache));
    window.dispatchEvent(new CustomEvent("jks-theme-updated", { detail: bgColor }));
    window.dispatchEvent(new CustomEvent("jks-theme-neon", { detail: neonColor }));
  } catch (err) {
    console.error("Theme extraction failed:", err);
  }
}

/**
 * Get dynamic background color. Returns cached value or empty string.
 * Triggers async extraction if no cache found.
 */
export function getDynamicBgColor(topbarUrl: string | undefined | null): string {
  if (!topbarUrl) return "";

  // Check cache first
  const cached = getCachedThemeColor(topbarUrl);
  if (cached) return cached;

  // Extract asynchronously and cache
  extractAndCache(topbarUrl);
  return "";
}

/**
 * Read cached theme color without triggering extraction.
 */
export function getCachedThemeColor(topbarUrl: string | undefined | null): string {
  if (!topbarUrl) return "";
  try {
    const cached = localStorage.getItem(THEME_CACHE_KEY);
    if (cached) {
      const parsed: ThemeCache = JSON.parse(cached);
      if (parsed.url === topbarUrl && parsed.version === CACHE_VERSION) {
        return parsed.bgColor;
      }
    }
  } catch {
    // ignore
  }
  return "";
}

/**
 * Read cached neon color without triggering extraction.
 */
export function getCachedNeonColor(topbarUrl: string | undefined | null): string {
  if (!topbarUrl) return "";
  try {
    const cached = localStorage.getItem(THEME_CACHE_KEY);
    if (cached) {
      const parsed: ThemeCache = JSON.parse(cached);
      if (parsed.url === topbarUrl && parsed.version === CACHE_VERSION) {
        return parsed.neonColor;
      }
    }
  } catch {
    // ignore
  }
  return "";
}
