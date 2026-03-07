import { handleCheck } from './api/redirect-checker.js';
import { handleCrawl } from './api/crawler.js';
import { handlePageSpeed } from './api/pagespeed.js';
import { jsonResponse, htmlResponse } from './utils/response.js';
import { buildHtml } from './ui/template.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: check redirect chain
    if (url.pathname === '/api/check' && url.searchParams.get('url')) {
      try {
        return await handleCheck(url.searchParams.get('url'));
      } catch (e) {
        return jsonResponse({
          chain: [],
          finalUrl: null,
          finalStatus: null,
          hops: 0,
          error: e.message,
        });
      }
    }

    // API: crawl site pages
    if (url.pathname === '/api/crawl' && url.searchParams.get('url')) {
      try {
        return await handleCrawl(url.searchParams.get('url'));
      } catch (e) {
        return jsonResponse({ pages: [], source: 'error', error: e.message });
      }
    }

    // API: PageSpeed proxy (hides API key from client)
    if (url.pathname === '/api/pagespeed' && url.searchParams.get('url')) {
      try {
        return await handlePageSpeed(
          url.searchParams.get('url'),
          url.searchParams.get('strategy') || 'mobile',
          env
        );
      } catch (e) {
        return jsonResponse({ error: e.message }, 500);
      }
    }

    // Serve the UI
    return htmlResponse(buildHtml());
  },
};
