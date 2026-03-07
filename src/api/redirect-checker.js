import { jsonResponse } from '../utils/response.js';

const MAX_REDIRECTS = 10;
const USER_AGENT = 'RedirectChecker/1.0';

/**
 * Follows redirect chains for a given URL and returns the chain details.
 */
export async function handleCheck(targetUrl) {
  const chain = [];
  let current = targetUrl;
  let hops = 0;

  while (hops <= MAX_REDIRECTS) {
    try {
      const resp = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': USER_AGENT },
      });

      chain.push({ url: current, status: resp.status });

      const isRedirect = [301, 302, 307, 308].includes(resp.status);
      const location = resp.headers.get('location');

      if (isRedirect && location) {
        hops++;
        try {
          current = new URL(location, current).href;
        } catch {
          current = location;
        }
      } else {
        return jsonResponse({
          chain,
          finalUrl: current,
          finalStatus: resp.status,
          hops,
          error: null,
        });
      }
    } catch (err) {
      chain.push({ url: current, status: null });
      return jsonResponse({
        chain,
        finalUrl: current,
        finalStatus: null,
        hops,
        error: err.message,
      });
    }
  }

  return jsonResponse({
    chain,
    finalUrl: current,
    finalStatus: null,
    hops,
    error: 'Too many redirects',
  });
}
