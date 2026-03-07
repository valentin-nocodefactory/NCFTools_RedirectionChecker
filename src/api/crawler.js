import { jsonResponse } from '../utils/response.js';

const MAX_PAGES = 10000;          // safety cap for extremely large sites
const MAX_SUB_SITEMAPS = 50;       // fetch up to 50 sub-sitemaps
const UA = 'NCFTools-Crawler/1.0';

/**
 * Discovers pages on a website via sitemap.xml or HTML link crawling.
 */
export async function handleCrawl(targetUrl) {
  try {
    // Normalize URL
    if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

    // Follow redirects to resolve the canonical domain (e.g. nocodefactory.fr → www.nocodefactory.fr)
    const resolved = await resolveCanonicalOrigin(targetUrl);
    const origin = resolved.origin;
    const hostname = resolved.hostname;

    // Try sitemap first
    let pages = await trySitemap(origin, hostname);
    if (pages.length > 0) {
      return jsonResponse({ pages: pages.slice(0, MAX_PAGES), source: 'sitemap', total: pages.length });
    }

    // Fallback: crawl homepage links
    pages = await crawlHomepage(origin, hostname);
    return jsonResponse({ pages: pages.slice(0, MAX_PAGES), source: 'crawl', total: pages.length });
  } catch (e) {
    return jsonResponse({ pages: [], source: 'error', error: e.message });
  }
}

/**
 * Follow redirects on the root URL to discover the canonical origin.
 * e.g. https://nocodefactory.fr → https://www.nocodefactory.fr
 */
async function resolveCanonicalOrigin(targetUrl) {
  try {
    const resp = await fetch(targetUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': UA },
      redirect: 'follow',
    });
    const finalUrl = new URL(resp.url);
    return { origin: finalUrl.origin, hostname: finalUrl.hostname };
  } catch (e) {
    // If HEAD fails, fall back to the original URL
    const parsed = new URL(targetUrl);
    return { origin: parsed.origin, hostname: parsed.hostname };
  }
}

/**
 * Try fetching sitemap.xml and extract page URLs.
 * Also handles sitemap index files.
 */
async function trySitemap(origin, hostname) {
  const urls = [];
  const sitemapUrls = [origin + '/sitemap.xml', origin + '/sitemap_index.xml'];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const resp = await fetch(sitemapUrl, {
        headers: { 'User-Agent': UA },
        cf: { cacheTtl: 300 },
      });
      if (!resp.ok) continue;

      const text = await resp.text();
      if (!text.includes('<') || (!text.includes('<url') && !text.includes('<sitemap'))) continue;

      // Check if it's a sitemap index (contains <sitemap><loc>)
      const sitemapLocs = [...text.matchAll(/<sitemap[^>]*>[\s\S]*?<loc>(.*?)<\/loc>/gi)].map(m => m[1].trim());

      if (sitemapLocs.length > 0) {
        // It's a sitemap index — fetch sub-sitemaps in parallel batches
        const batch = sitemapLocs.slice(0, MAX_SUB_SITEMAPS);
        const CONCURRENCY = 6;
        for (let i = 0; i < batch.length; i += CONCURRENCY) {
          const chunk = batch.slice(i, i + CONCURRENCY);
          const results = await Promise.allSettled(
            chunk.map(subUrl =>
              fetch(subUrl, { headers: { 'User-Agent': UA } })
                .then(r => r.ok ? r.text() : '')
            )
          );
          for (const r of results) {
            if (r.status === 'fulfilled' && r.value) {
              extractUrlLocs(r.value, hostname, urls);
            }
          }
        }
      } else {
        // Regular sitemap
        extractUrlLocs(text, hostname, urls);
      }

      if (urls.length > 0) break;
    } catch (e) { /* try next sitemap URL */ }
  }

  return dedup(urls);
}

/**
 * Extract <url><loc>...</loc></url> entries from sitemap XML.
 */
function extractUrlLocs(xml, hostname, urls) {
  const matches = xml.matchAll(/<url[^>]*>[\s\S]*?<loc>(.*?)<\/loc>/gi);
  for (const m of matches) {
    const loc = m[1].trim();
    try {
      const u = new URL(loc);
      if (u.hostname === hostname && (u.protocol === 'https:' || u.protocol === 'http:')) {
        urls.push(u.origin + u.pathname);
      }
    } catch (e) { /* skip invalid URLs */ }
    if (urls.length >= MAX_PAGES) break;
  }
}

/**
 * Crawl homepage HTML and extract internal links.
 */
async function crawlHomepage(origin, hostname) {
  const resp = await fetch(origin + '/', {
    headers: { 'User-Agent': UA },
    cf: { cacheTtl: 300 },
  });
  if (!resp.ok) throw new Error('Homepage returned ' + resp.status);

  const html = await resp.text();
  const urls = [];
  const hrefMatches = html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi);

  for (const m of hrefMatches) {
    let href = m[1].trim();
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    try {
      const u = new URL(href, origin);
      if (u.hostname === hostname && (u.protocol === 'https:' || u.protocol === 'http:')) {
        urls.push(u.origin + u.pathname);
      }
    } catch (e) { /* skip invalid */ }
  }

  // Always include the homepage
  if (!urls.includes(origin + '/')) {
    urls.unshift(origin + '/');
  }

  return dedup(urls);
}

/**
 * Deduplicate and sort URLs.
 */
function dedup(urls) {
  const seen = new Set();
  const unique = [];
  for (const u of urls) {
    // Normalize: remove trailing slash for dedup (except root)
    const key = u.replace(/\/+$/, '') || u;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(u);
    }
  }
  return unique.sort();
}
