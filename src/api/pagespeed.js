import { jsonResponse } from '../utils/response.js';

/**
 * Proxies PageSpeed Insights API requests.
 * Adds the server-side API key so the client never sees it.
 *
 * @param {string} targetUrl - The URL to analyze
 * @param {string} strategy  - "mobile" or "desktop"
 * @param {object} env        - Worker env bindings (must contain PAGESPEED_API_KEY)
 */
export async function handlePageSpeed(targetUrl, strategy, env) {
  const apiKey = env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'PAGESPEED_API_KEY not configured on the server.' }, 500);
  }

  const validStrategies = ['mobile', 'desktop'];
  if (!validStrategies.includes(strategy)) {
    strategy = 'mobile';
  }

  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  apiUrl.searchParams.set('url', targetUrl);
  apiUrl.searchParams.set('strategy', strategy);
  apiUrl.searchParams.set('key', apiKey);
  ['performance', 'accessibility', 'seo', 'best-practices'].forEach(cat => {
    apiUrl.searchParams.append('category', cat);
  });

  const resp = await fetch(apiUrl.toString(), {
    headers: { 'Accept': 'application/json' },
  });

  // Forward the response as-is (including 429 status for rate limits)
  const body = await resp.text();

  return new Response(body, {
    status: resp.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
