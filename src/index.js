import { handleCheck } from './api/redirect-checker.js';
import { jsonResponse, htmlResponse } from './utils/response.js';
import { buildHtml } from './ui/template.js';

export default {
  async fetch(request) {
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

    // Serve the UI
    return htmlResponse(buildHtml());
  },
};
