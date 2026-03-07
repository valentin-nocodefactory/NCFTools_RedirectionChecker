const API_BASE_URL = 'https://migration-checker.prod-ebe.workers.dev';

/**
 * Returns the client-side JavaScript for the redirect checker UI.
 */
export function getClientScript() {
  return String.raw`<script>
var urls = [];
var results = {};
var running = false;
var aborted = false;
var currentFilter = "all";

function qs(s) { return document.querySelector(s); }
function qsa(s) { return document.querySelectorAll(s); }
function cleanDomain(d) { return d.replace(/^https?:\/\//,"").replace(/\/+$/,""); }

/* ── Domain preview ── */
function updatePreview() {
  var o = cleanDomain(qs("#oldDomain").value);
  var n = cleanDomain(qs("#newDomain").value);
  var p = qs("#domainPreview");
  if (o && n) {
    p.style.display = "block";
    p.innerHTML = 'URLs coll\u00e9es: <span style="color:#94a3b8">https://' + o + '/page</span> \u2192 Test: <span style="color:#22c55e">https://' + n + '/page</span>';
  } else { p.style.display = "none"; }
  var of = qs("#oldDomainFav");
  if (o.length > 2) { of.src = "https://www.google.com/s2/favicons?domain=" + o + "&sz=32"; of.classList.add("visible"); }
  else { of.classList.remove("visible"); }
  var nf = qs("#newDomainFav");
  if (n.length > 2) { nf.src = "https://www.google.com/s2/favicons?domain=" + n + "&sz=32"; nf.classList.add("visible"); }
  else { nf.classList.remove("visible"); }
  updateParseBtn();
}

function updateParseBtn() {
  var ok = qs("#oldDomain").value.trim() && qs("#newDomain").value.trim() && qs("#urlInput").value.trim();
  qs("#btnParse").disabled = !ok;
  qs("#parseWarn").style.display = (!qs("#oldDomain").value.trim() || !qs("#newDomain").value.trim()) ? "block" : "none";
}

/* ── Event listeners ── */
qs("#oldDomain").addEventListener("input", updatePreview);
qs("#newDomain").addEventListener("input", updatePreview);
qs("#urlInput").addEventListener("input", updateParseBtn);

qs("#btnShare").addEventListener("click", function() {
  var o = qs("#oldDomain").value.trim();
  var n = qs("#newDomain").value.trim();
  var u = qs("#urlInput").value.trim();
  var params = new URLSearchParams();
  if (o) params.set("from", o);
  if (n) params.set("to", n);
  if (u) params.set("urls", u);
  var shareUrl = location.origin + location.pathname + "?" + params.toString();
  navigator.clipboard.writeText(shareUrl).then(function() {
    var btn = qs("#btnShare");
    btn.innerHTML = "\u2713 Copi\u00e9 !";
    btn.style.borderColor = "#22c55e";
    btn.style.color = "#22c55e";
    setTimeout(function() { btn.innerHTML = "\uD83D\uDD17 Partager"; btn.style.borderColor = ""; btn.style.color = ""; }, 2000);
  });
});

qs("#btnCrawlOld").addEventListener("click", async function() {
  var domain = qs("#oldDomain").value.trim();
  if (!domain) { alert("Renseigne le domaine ancien d'abord."); return; }
  if (domain.indexOf("http") !== 0) domain = "https://" + domain;

  var btn = qs("#btnCrawlOld");
  btn.disabled = true;
  btn.innerHTML = "\u23F3 Crawl en cours\u2026";

  try {
    var resp = await fetch("/api/crawl?url=" + encodeURIComponent(domain));
    var data = await resp.json();
    if (data.error) throw new Error(data.error);
    if (!data.pages || data.pages.length === 0) throw new Error("Aucune page trouv\u00e9e.");

    var paths = data.pages.map(function(url) {
      try { return new URL(url).pathname; } catch(e) { return url; }
    });
    qs("#urlInput").value = paths.join("\n");
    updateParseBtn();
    btn.innerHTML = "\u2705 " + data.pages.length + " pages import\u00e9es (" + data.source + ")";
  } catch(e) {
    btn.innerHTML = "\u274C " + e.message;
  }
  setTimeout(function() { btn.disabled = false; btn.innerHTML = "\uD83D\uDD77 Crawler l'ancien site"; }, 3000);
});

qs("#btnHelp").addEventListener("click", function() {
  qs("#helpModal").style.display = "flex";
});
qs("#helpClose").addEventListener("click", function() {
  qs("#helpModal").style.display = "none";
});
qs("#helpModal").addEventListener("click", function(e) {
  if (e.target === qs("#helpModal")) qs("#helpModal").style.display = "none";
});

/* ── Load URL params ── */
(function loadParams() {
  var params = new URLSearchParams(location.search);
  if (params.get("from")) qs("#oldDomain").value = params.get("from");
  if (params.get("to")) qs("#newDomain").value = params.get("to");
  if (params.get("urls")) qs("#urlInput").value = params.get("urls");
  if (params.get("from") || params.get("to")) updatePreview();
  if (params.get("urls")) updateParseBtn();
})();

/* ── Tabs ── */
var tabIds = ["tab-input", "tab-results", "tab-pagespeed"];
qsa(".tab").forEach(function(t) {
  t.addEventListener("click", function() {
    qsa(".tab").forEach(function(x) { x.classList.remove("active"); });
    t.classList.add("active");
    tabIds.forEach(function(id) {
      var el = qs("#" + id);
      if (el) el.style.display = id === "tab-" + t.dataset.tab ? "block" : "none";
    });
  });
});

/* ── Helpers ── */
function norm(u) {
  try { var p = new URL(u); return (p.protocol + "//" + p.host + p.pathname.replace(/\/+$/,"")).toLowerCase(); }
  catch(e) { return (u || "").toLowerCase().replace(/\/+$/,""); }
}

function fav(url) {
  try { var d = new URL(url).hostname; return '<img src="https://www.google.com/s2/favicons?domain=' + d + '&sz=16" width="14" height="14" style="vertical-align:middle;margin-right:5px;border-radius:2px;opacity:.85">'; }
  catch(e) { return ''; }
}

function cpBtn(text) {
  return '<button class="url-copy" onclick="copyUrl(this,\'' + text.replace(/'/g, "\\'") + '\')" title="Copier">\uD83D\uDCCB</button>';
}

function copyUrl(btn, text) {
  navigator.clipboard.writeText(text).then(function() {
    btn.classList.add("copied");
    btn.innerHTML = "\u2713";
    setTimeout(function() { btn.classList.remove("copied"); btn.innerHTML = "\uD83D\uDCCB"; }, 1200);
  });
}

/* ── Parse URLs ── */
qs("#btnParse").addEventListener("click", function() {
  var oldD = cleanDomain(qs("#oldDomain").value);
  var newD = cleanDomain(qs("#newDomain").value);
  var lines = qs("#urlInput").value.trim().split("\n").filter(Boolean);
  urls = lines.map(function(line, i) {
    var path = line.trim();
    if (path.indexOf("http") === 0) {
      try { path = new URL(path).pathname; } catch(e) {}
    } else if (path.indexOf(".") > 0 && path.charAt(0) !== "/") {
      try { path = new URL("https://" + path).pathname; } catch(e) {}
    }
    if (path.charAt(0) !== "/") path = "/" + path;
    return { id: i, path: path, testUrl: "https://" + newD + path };
  });
  results = {}; currentFilter = "all"; renderResults();
  qsa(".tab").forEach(function(x) { x.classList.remove("active"); });
  qsa(".tab")[1].classList.add("active");
  qs("#tab-input").style.display = "none";
  qs("#tab-results").style.display = "block";
  qs("#resultCount").textContent = "(" + urls.length + ")";
  qs("#btnRun").style.display = "inline-block";
  qs("#btnCSV").style.display = "none";
});

/* ── Run tests ── */
qs("#btnRun").addEventListener("click", runTests);
qs("#btnStop").addEventListener("click", function() { aborted = true; });

async function runTests() {
  running = true; aborted = false;
  qs("#btnRun").style.display = "none";
  qs("#btnStop").style.display = "inline-block";
  qs("#progressBar").style.display = "block";

  for (var i = 0; i < urls.length; i++) {
    if (aborted) break;
    results[urls[i].id] = { status: "testing" };
    renderResults();
    qs("#progressFill").style.width = ((i + 1) / urls.length * 100) + "%";

    try {
      var start = Date.now();
      var resp = await fetch("${API_BASE_URL}/api/check?url=" + encodeURIComponent(urls[i].testUrl));
      var ct = resp.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("API error (status " + resp.status + ") - non-JSON response");
      }
      var data = await resp.json();
      data.duration = Date.now() - start;

      if (data.error) data.type = "error";
      else if (data.finalStatus === 200 && data.hops === 0) data.type = "200";
      else if (data.finalStatus === 404) data.type = "404";
      else if (data.finalStatus === 200 && data.hops === 1) data.type = "301-ok";
      else if (data.finalStatus === 200 && data.hops > 1) data.type = "chain";
      else if ([301,302,307,308].indexOf(data.finalStatus) >= 0) data.type = "loop";
      else data.type = "other";

      results[urls[i].id] = data;
    } catch (e) {
      results[urls[i].id] = { type: "error", error: e.message, chain: [], hops: 0, finalStatus: null, finalUrl: "" };
    }
    renderResults();
  }

  running = false;
  qs("#btnStop").style.display = "none";
  qs("#btnRun").style.display = "inline-block";
  qs("#btnRun").textContent = "Relancer";
  qs("#btnCSV").style.display = "inline-block";
  qs("#progressBar").style.display = "none";
}

/* ── Render results ── */
function renderResults() {
  var counts = { total: urls.length, "200": 0, "301-ok": 0, "chain": 0, "404": 0, "error": 0, "other": 0 };
  urls.forEach(function(u) {
    var r = results[u.id];
    if (!r || r.status === "testing") return;
    if (r.type && counts.hasOwnProperty(r.type)) counts[r.type]++;
    else if (r.type) counts.other++;
  });

  var statDefs = [
    { key: "all",    label: "Total",        val: counts.total,      color: "#94a3b8" },
    { key: "200",    label: "200 OK",       val: counts["200"],     color: "#22c55e" },
    { key: "301-ok", label: "301 simple",   val: counts["301-ok"],  color: "#f59e0b" },
    { key: "chain",  label: "Chaines 301",  val: counts.chain,      color: "#ef4444" },
    { key: "404",    label: "404",          val: counts["404"],     color: "#ef4444" },
    { key: "error",  label: "Erreurs",      val: counts.error,      color: "#64748b" }
  ];

  var sh = "";
  statDefs.forEach(function(s) {
    var a = currentFilter === s.key;
    sh += '<button class="stat-btn' + (a ? " active" : "") + '" style="--c:' + s.color + (a ? ";border-color:" + s.color : "") + '" data-filter="' + s.key + '"><div class="stat-val" style="color:' + s.color + '">' + s.val + '</div><div class="stat-lbl">' + s.label + '</div></button>';
  });
  qs("#statsBar").innerHTML = sh;

  qsa(".stat-btn").forEach(function(b) {
    b.addEventListener("click", function() { currentFilter = b.dataset.filter; renderResults(); });
  });

  var filtered = currentFilter === "all" ? urls : urls.filter(function(u) { var r = results[u.id]; return r && r.type === currentFilter; });
  var tb = "";
  filtered.forEach(function(u) {
    var r = results[u.id];
    var badge = '<span class="badge badge-err"><span class="dot" style="background:#64748b"></span>\u2014</span>';
    if (r) {
      if (r.status === "testing") badge = '<span class="badge badge-test"><span class="dot" style="background:#3b82f6"></span>TEST...</span>';
      else if (r.type === "200") badge = '<span class="badge badge-200"><span class="dot" style="background:#22c55e"></span>200 OK</span>';
      else if (r.type === "301-ok") badge = '<span class="badge badge-301"><span class="dot" style="background:#f59e0b"></span>301 (1 hop)</span>';
      else if (r.type === "chain") badge = '<span class="badge badge-chain"><span class="dot" style="background:#ef4444"></span>CHAINE (' + r.hops + ' hops)</span>';
      else if (r.type === "404") badge = '<span class="badge badge-404"><span class="dot" style="background:#ef4444"></span>404</span>';
      else if (r.type === "error") badge = '<span class="badge badge-err"><span class="dot" style="background:#64748b"></span>ERR</span>';
      else badge = '<span class="badge badge-err"><span class="dot" style="background:#64748b"></span>' + (r.finalStatus || "?") + '</span>';
    }
    var code = r && r.finalStatus ? r.finalStatus : "\u2014";
    var codeColor = code >= 400 ? "#ef4444" : code >= 300 ? "#f59e0b" : code >= 200 ? "#22c55e" : "#475569";
    var hops = r && r.hops != null ? r.hops : "\u2014";
    var hopsColor = hops > 1 ? "#ef4444" : hops === 1 ? "#f59e0b" : "#475569";
    var finalUrl = r ? (r.finalUrl || r.error || "\u2014") : "\u2014";
    var finalColor = r && r.type === "200" ? "#22c55e" : r && r.type === "301-ok" ? "#f59e0b" : r && r.finalUrl ? "#ef4444" : "#64748b";
    var finalFav = r && r.finalUrl ? fav(r.finalUrl) : "";
    var ms = r && r.duration ? r.duration : "\u2014";
    var detail = "";
    if (r && r.chain && r.chain.length > 1) {
      detail = '<div class="chain-detail">';
      for (var j = 0; j < r.chain.length; j++) {
        var h = r.chain[j];
        var sc = h.status >= 400 ? "#ef4444" : h.status >= 300 ? "#f59e0b" : h.status >= 200 ? "#22c55e" : "#64748b";
        detail += '<div class="chain-hop" style="position:relative"><span class="hop-num">#' + (j+1) + '</span><span class="hop-status" style="color:' + sc + '">' + (h.status||"ERR") + '</span>' + fav(h.url) + '<span style="color:#8b9dc3;word-break:break-all">' + h.url + '</span><button class="url-copy hop-copy" onclick="copyUrl(this,\'' + h.url.replace(/'/g, "\\'") + '\')" title="Copier">\uD83D\uDCCB</button></div>';
      }
      detail += "</div>";
    }
    tb += '<tr>' +
      '<td class="mono" style="color:#475569;font-size:11px">' + (u.id+1) + '</td>' +
      '<td class="mono" style="font-size:11px;color:#8b9dc3;word-break:break-all;max-width:160px">' + u.path + '</td>' +
      '<td class="mono" style="font-size:11px;color:#22c55e;word-break:break-all;max-width:240px;position:relative">' + fav(u.testUrl) + u.testUrl + cpBtn(u.testUrl) + '</td>' +
      '<td>' + badge + '</td>' +
      '<td class="mono" style="color:' + codeColor + ';font-weight:700">' + code + '</td>' +
      '<td class="mono" style="color:' + hopsColor + ';font-weight:700;text-align:center">' + hops + '</td>' +
      '<td class="mono" style="font-size:11px;color:' + finalColor + ';word-break:break-all;max-width:300px;position:relative">' + finalFav + finalUrl + (r && r.finalUrl ? cpBtn(r.finalUrl) : '') + detail + '</td>' +
      '<td class="mono" style="font-size:11px;color:#64748b">' + ms + '</td></tr>';
  });
  qs("#resultsBody").innerHTML = tb;
}

/* ── CSV export ── */
qs("#btnCSV").addEventListener("click", function() {
  var csv = "path,test_url,status_type,http_code,hops,final_url,chain_detail,duration_ms\n";
  urls.forEach(function(u) {
    var r = results[u.id] || {};
    var chainStr = (r.chain || []).map(function(h) { return h.status + ":" + h.url; }).join(" > ");
    csv += '"' + u.path + '","' + u.testUrl + '","' + (r.type||"") + '","' + (r.finalStatus||"") + '","' + (r.hops||0) + '","' + (r.finalUrl||"") + '","' + chainStr + '","' + (r.duration||"") + '"\n';
  });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "redirect_audit.csv";
  a.click();
});

/* ── Theme toggle ── */
document.getElementById("themeToggle").addEventListener("click", function() {
  document.body.classList.toggle("light");
});

/* ── Glow tray ── */
var glowWrap = document.getElementById("glowWrap");
document.getElementById("glowBar").addEventListener("click", function() {
  if (glowWrap.classList.contains("open")) { glowWrap.classList.remove("open"); }
  else { glowWrap.classList.remove("open"); void glowWrap.offsetWidth; glowWrap.classList.add("open"); }
});
document.getElementById("trayClose").addEventListener("click", function() {
  glowWrap.classList.remove("open");
});

/* ═══════════════════════════════════════════
   PageSpeed Insights — Batch Crawler
   ═══════════════════════════════════════════ */
var psStrategy = "mobile";
var psPages = [];
var psResults = {};
var psRunning = false;
var psAborted = false;
var psExpandedUrl = null;
var psDomainKey = "";
var psExpandedFolders = {};

function psColor(score) {
  if (score >= 90) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function psGaugeSvg(score) {
  var r = 40, c = 2 * Math.PI * r;
  var offset = c - (score / 100) * c;
  var color = psColor(score);
  return '<div class="ps-gauge">' +
    '<svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="' + r + '" class="ps-gauge-bg"/>' +
    '<circle cx="48" cy="48" r="' + r + '" class="ps-gauge-fill" stroke="' + color + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + offset + '"/></svg>' +
    '<div class="ps-gauge-label" style="color:' + color + '">' + score + '</div></div>';
}

/* ── PSI metric thresholds and weights ── */
var PS_THRESHOLDS = {
  "first-contentful-paint":   { good: 1800, poor: 3000, unit: "ms", max: 6000, short: "FCP" },
  "largest-contentful-paint": { good: 2500, poor: 4000, unit: "ms", max: 8000, short: "LCP" },
  "total-blocking-time":      { good: 200,  poor: 600,  unit: "ms", max: 1500, short: "TBT" },
  "cumulative-layout-shift":  { good: 0.1,  poor: 0.25, unit: "",   max: 0.5,  short: "CLS" },
  "speed-index":              { good: 3400, poor: 5800, unit: "ms", max: 10000, short: "SI" },
  "interactive":              { good: 3800, poor: 7300, unit: "ms", max: 12000, short: "TTI" }
};
var PS_WEIGHTS = {
  "first-contentful-paint":   0.10,
  "speed-index":              0.10,
  "largest-contentful-paint": 0.25,
  "total-blocking-time":      0.30,
  "cumulative-layout-shift":  0.25
};
var PS_AUDIT_METRICS = {
  "bootup-time": ["TBT"],
  "critical-request-chains": ["FCP", "LCP"],
  "dom-size": ["TBT"],
  "duplicated-javascript": ["FCP", "LCP", "TBT"],
  "efficient-animated-content": ["FCP", "LCP"],
  "font-display": ["FCP", "LCP"],
  "largest-contentful-paint-element": ["LCP"],
  "layout-shift-elements": ["CLS"],
  "layout-shifts": ["CLS"],
  "lcp-lazy-loaded": ["LCP"],
  "legacy-javascript": ["FCP", "LCP", "TBT"],
  "long-tasks": ["TBT"],
  "mainthread-work-breakdown": ["TBT"],
  "modern-image-formats": ["FCP", "LCP"],
  "non-composited-animations": ["CLS"],
  "offscreen-images": ["FCP", "LCP"],
  "prioritize-lcp-image": ["LCP"],
  "redirects": ["FCP", "LCP"],
  "render-blocking-resources": ["FCP", "LCP"],
  "server-response-time": ["FCP", "LCP"],
  "third-party-facades": ["TBT"],
  "third-party-summary": ["TBT"],
  "total-byte-weight": ["LCP"],
  "unminified-css": ["FCP", "LCP"],
  "unminified-javascript": ["FCP", "LCP"],
  "unsized-images": ["CLS"],
  "unused-css-rules": ["FCP", "LCP"],
  "unused-javascript": ["FCP", "LCP"],
  "uses-http2": ["FCP", "LCP"],
  "uses-optimized-images": ["FCP", "LCP"],
  "uses-rel-preconnect": ["FCP", "LCP"],
  "uses-rel-preload": ["FCP", "LCP"],
  "uses-responsive-images": ["FCP", "LCP"],
  "uses-text-compression": ["FCP", "LCP"],
  "viewport": ["TBT"]
};
var PS_METRIC_COLORS = {
  "FCP": "#6c5ce7",
  "LCP": "#e17055",
  "TBT": "#fdcb6e",
  "CLS": "#00b894",
  "SI":  "#74b9ff",
  "INP": "#fd79a8"
};
function psGetAuditMetrics(audit, auditId) {
  // Source 1: metricSavings from Lighthouse v12+ (dynamic, page-specific)
  if (audit.metricSavings) {
    var nameMap = { FCP: "FCP", LCP: "LCP", TBT: "TBT", CLS: "CLS", INP: "INP" };
    var metrics = [];
    Object.keys(audit.metricSavings).forEach(function(k) {
      if (nameMap[k] && audit.metricSavings[k] > 0) metrics.push(nameMap[k]);
    });
    if (metrics.length > 0) return metrics;
  }
  // Source 2: static mapping fallback
  var id = auditId || (audit.id ? audit.id : "");
  if (id && PS_AUDIT_METRICS[id]) {
    return PS_AUDIT_METRICS[id].slice();
  }
  return [];
}
function psMetricBadgeColor(metric) {
  return PS_METRIC_COLORS[metric] || "#636e72";
}
function psRenderMetricBadges(metrics) {
  if (!metrics || metrics.length === 0) return "";
  var html = '<span class="ps-reco-metrics">';
  metrics.forEach(function(m) {
    html += '<span class="ps-cwv-badge" style="background:' + psMetricBadgeColor(m) + '">' + m + '</span>';
  });
  html += '</span>';
  return html;
}

function psRenderMetricBar(metricKey, numericValue, score, displayValue) {
  var t = PS_THRESHOLDS[metricKey];
  if (!t) return "";
  var scoreInt = score != null ? Math.round(score * 100) : null;
  var color = scoreInt != null ? psColor(scoreInt) : "#64748b";
  var weight = PS_WEIGHTS[metricKey];
  var points = (weight && score != null) ? (score * weight * 100).toFixed(1) : null;
  // Calculate marker position as percentage
  var markerPct = 0;
  if (numericValue != null && t.max > 0) {
    markerPct = Math.min(100, Math.max(0, (numericValue / t.max) * 100));
  }
  // Calculate zone boundaries as percentages
  var goodPct = (t.good / t.max) * 100;
  var poorPct = (t.poor / t.max) * 100;
  // Format threshold labels
  var goodLabel = t.unit === "ms" ? (t.good >= 1000 ? (t.good / 1000) + " s" : t.good + " ms") : String(t.good);
  var poorLabel = t.unit === "ms" ? (t.poor >= 1000 ? (t.poor / 1000) + " s" : t.poor + " ms") : String(t.poor);

  var html = '<div class="ps-metric-row-v2">';
  html += '<div class="ps-metric-row-top">';
  html += '<span class="ps-metric-badge" style="background:' + color + '"></span>';
  html += '<span class="ps-metric-name">' + (PS_THRESHOLDS[metricKey].short || metricKey) + '</span>';
  html += '<span class="ps-metric-val" style="color:' + color + '">' + (displayValue || "\u2014") + '</span>';
  if (points != null) {
    html += '<span class="ps-metric-points" style="color:' + color + '">' + points + ' pts</span>';
  }
  html += '</div>';
  // Bar
  html += '<div class="ps-metric-bar-wrap">';
  html += '<div class="ps-metric-bar-bg" style="background:linear-gradient(90deg, #0cce6b 0%, #0cce6b ' + goodPct + '%, #ffa400 ' + goodPct + '%, #ffa400 ' + poorPct + '%, #ff4e42 ' + poorPct + '%, #ff4e42 100%)"></div>';
  if (numericValue != null) {
    html += '<div class="ps-metric-bar-marker" style="left:calc(' + markerPct + '% - 1.5px)"></div>';
  }
  html += '</div>';
  // Thresholds
  html += '<div class="ps-metric-thresholds">';
  html += '<span>0</span>';
  html += '<span style="position:absolute;left:' + goodPct + '%">' + goodLabel + '</span>';
  html += '<span style="position:absolute;left:' + poorPct + '%">' + poorLabel + '</span>';
  html += '<span></span>';
  html += '</div>';
  html += '</div>';
  return html;
}

function psScoreTooltipHtml(cwvData, isCompact) {
  var weightDefs = [
    { key: "first-contentful-paint", name: "FCP", weight: 0.10 },
    { key: "speed-index", name: "SI", weight: 0.10 },
    { key: "largest-contentful-paint", name: "LCP", weight: 0.25 },
    { key: "total-blocking-time", name: "TBT", weight: 0.30 },
    { key: "cumulative-layout-shift", name: "CLS", weight: 0.25 }
  ];
  var html = '<div class="ps-score-tooltip"><div class="ps-tooltip-arrow"></div>';
  html += '<div class="ps-tooltip-title">Calcul du score Performance</div>';
  var totalPts = 0;
  weightDefs.forEach(function(w) {
    var metricData = cwvData[w.key];
    var val = "\u2014", metricScore = null, color = "#64748b";
    if (metricData) {
      val = metricData.val || metricData.displayValue || "\u2014";
      metricScore = metricData.score;
      if (metricScore != null) color = psColor(Math.round(metricScore * 100));
    }
    var pts = metricScore != null ? (metricScore * w.weight * 100) : 0;
    totalPts += pts;
    html += '<div class="ps-tooltip-row">';
    html += '<span class="ps-tooltip-badge" style="background:' + color + '"></span>';
    html += '<span class="ps-tooltip-name">' + w.name + '</span>';
    html += '<span class="ps-tooltip-val" style="color:' + color + '">' + val + '</span>';
    html += '<span class="ps-tooltip-weight">' + Math.round(w.weight * 100) + '%</span>';
    html += '<span class="ps-tooltip-pts" style="color:' + color + '">' + pts.toFixed(1) + '</span>';
    html += '</div>';
  });
  html += '<div class="ps-tooltip-total">';
  html += '<span>Total</span><span class="ps-tooltip-total-val">' + Math.round(totalPts) + ' pts</span>';
  html += '</div>';
  html += '</div>';
  return html;
}

function psShowImageLightbox(src) {
  var overlay = document.createElement("div");
  overlay.className = "ps-lightbox";
  overlay.innerHTML = '<img src="' + src.replace(/"/g, "&quot;") + '" class="ps-lightbox-img">';
  overlay.addEventListener("click", function() { overlay.remove(); });
  document.body.appendChild(overlay);
}

/* ── localStorage ── */
function psLoadFromStorage(domain) {
  try {
    var stored = localStorage.getItem("ps_" + domain);
    if (stored) {
      var parsed = JSON.parse(stored);
      psResults = parsed.results || {};
      return parsed.selected || [];
    }
  } catch(e) {}
  psResults = {};
  return [];
}

function psSaveToStorage(domain) {
  try {
    var selected = [];
    qsa(".ps-page-row input[type=checkbox]:checked").forEach(function(cb) {
      selected.push(cb.closest(".ps-page-row").dataset.url);
    });
    // CWV metric keys to exclude from audits
    var cwvMetricKeys = { "first-contentful-paint":1, "largest-contentful-paint":1, "total-blocking-time":1, "cumulative-layout-shift":1, "speed-index":1, "interactive":1 };
    // Compact results: store scores + CWV + opportunities + diagnostics + passed count
    var compact = {};
    Object.keys(psResults).forEach(function(url) {
      compact[url] = {};
      ["mobile", "desktop"].forEach(function(s) {
        var d = psResults[url][s];
        if (!d) return;
        // Already compact format — keep as-is
        if (d._compact) {
          compact[url][s] = { scores: d.scores, cwv: d.cwv, recos: d.recos, passedCount: d.passedCount || 0 };
          return;
        }
        // Full API response — extract compact data
        if (!d.lighthouseResult) return;
        var cats = d.lighthouseResult.categories;
        var audits = d.lighthouseResult.audits;
        var scores = {};
        ["performance", "accessibility", "best-practices", "seo"].forEach(function(k) {
          if (cats[k]) scores[k] = Math.round(cats[k].score * 100);
        });
        var cwv = {};
        ["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","speed-index","interactive"].forEach(function(k) {
          if (audits[k]) cwv[k] = { val: audits[k].displayValue || "", score: audits[k].score, numericValue: audits[k].numericValue != null ? audits[k].numericValue : null };
        });
        var recos = [];
        var passedCount = 0;
        Object.keys(audits).forEach(function(k) {
          var a = audits[k];
          if (cwvMetricKeys[k]) return;
          if (a.scoreDisplayMode === "notApplicable" || a.scoreDisplayMode === "manual" || a.scoreDisplayMode === "informative") return;
          if (a.score !== null && a.score >= 0.9) { passedCount++; return; }
          if (a.score === null) return;

          var extracted = psExtractAuditItems(a);
          // Limit items to 15 for storage; strip data: URLs (too large for localStorage)
          var storedItems = extracted.items.slice(0, 15).map(function(item) {
            var clean = {};
            Object.keys(item).forEach(function(ik) {
              var v = item[ik];
              if (typeof v === "string" && v.indexOf("data:") === 0) return; // Skip base64
              // For node objects, strip base64 thumbnail but keep other fields
              if (typeof v === "object" && v !== null && v.thumbnail && typeof v.thumbnail === "string" && v.thumbnail.indexOf("data:") === 0) {
                var nodeCopy = {};
                Object.keys(v).forEach(function(nk) { if (nk !== "thumbnail") nodeCopy[nk] = v[nk]; });
                clean[ik] = nodeCopy;
                return;
              }
              clean[ik] = v;
            });
            return clean;
          });
          var auditMetrics = psGetAuditMetrics(a, k);
          var reco = {
            title: a.title,
            desc: a.description || "",
            score: a.score,
            headings: extracted.headings.length > 0 ? extracted.headings : undefined,
            items: storedItems.length > 0 ? storedItems : undefined,
            totalItems: extracted.totalItems,
            metrics: auditMetrics.length > 0 ? auditMetrics : undefined
          };

          if (a.details && a.details.type === "opportunity") {
            reco.group = "opportunity";
            reco.savings = a.details.overallSavingsMs ? (a.details.overallSavingsMs / 1000).toFixed(1) : "";
            if (a.details.overallSavingsBytes) {
              reco.savingsBytes = a.details.overallSavingsBytes >= 1048576 ? (a.details.overallSavingsBytes / 1048576).toFixed(1) + " MB" : (a.details.overallSavingsBytes / 1024).toFixed(0) + " KB";
            }
          } else {
            reco.group = "diagnostic";
          }
          recos.push(reco);
        });
        compact[url][s] = { scores: scores, cwv: cwv, recos: recos, passedCount: passedCount };
      });
      if (psResults[url].lastAnalyzed) compact[url].lastAnalyzed = psResults[url].lastAnalyzed;
    });
    localStorage.setItem("ps_" + domain, JSON.stringify({ results: compact, selected: selected, savedAt: new Date().toISOString() }));
  } catch(e) {}
}

function psLoadCompactResults(domain) {
  try {
    var stored = localStorage.getItem("ps_" + domain);
    if (!stored) return [];
    var parsed = JSON.parse(stored);
    // Rebuild psResults from compact format for rendering
    psResults = {};
    Object.keys(parsed.results || {}).forEach(function(url) {
      psResults[url] = { _compact: true };
      ["mobile", "desktop"].forEach(function(s) {
        var c = parsed.results[url][s];
        if (!c) return;
        psResults[url][s] = { _compact: true, scores: c.scores, cwv: c.cwv, recos: c.recos, passedCount: c.passedCount || 0 };
      });
      if (parsed.results[url].lastAnalyzed) psResults[url].lastAnalyzed = parsed.results[url].lastAnalyzed;
    });
    return parsed.selected || [];
  } catch(e) {}
  psResults = {};
  return [];
}

/* ── Crawl site ── */
async function psCrawlSite() {
  var domain = qs("#psDomain").value.trim();
  if (!domain) return;
  if (domain.indexOf("http") !== 0) domain = "https://" + domain;

  qs("#psCrawlResults").innerHTML = '<div class="ps-loading"><div class="ps-spinner"></div><div class="ps-loading-text">Exploration du site en cours\u2026</div></div>';

  try {
    var resp = await fetch("/api/crawl?url=" + encodeURIComponent(domain));
    var data = await resp.json();
    if (data.error) throw new Error(data.error);
    if (!data.pages || data.pages.length === 0) throw new Error("Aucune page trouv\u00e9e sur ce site.");

    psPages = data.pages;
    try { psDomainKey = new URL(domain).hostname; } catch(e) { psDomainKey = domain; }

    // Load previously saved state
    var savedSelected = psLoadCompactResults(psDomainKey);

    qs("#psCrawlResults").innerHTML = "";
    qs("#psDomainLabel").textContent = psDomainKey;
    qs("#psPageCount").textContent = "(" + psPages.length + " pages, source: " + data.source + ")";
    qs("#psPageList").style.display = "block";

    psRenderPageList(savedSelected);
  } catch(e) {
    qs("#psCrawlResults").innerHTML = '<div class="ps-error">\u274C ' + e.message + '</div>';
  }
}

/* ── Get currently checked URLs ── */
function psGetCheckedUrls() {
  var checked = [];
  qsa(".ps-page-row").forEach(function(row) {
    var cb = row.querySelector("input[type=checkbox]");
    if (cb && cb.checked) checked.push(row.dataset.url);
  });
  return checked;
}

/* ── Group pages by folder ── */
function psGroupByFolder(pages) {
  var groups = {};
  pages.forEach(function(fullUrl) {
    var path;
    try { path = new URL(fullUrl).pathname; } catch(e) { path = fullUrl; }
    var segments = path.replace(/^\//, "").split("/");
    var folder;
    if (segments.length <= 1 || (segments.length === 1 && segments[0] === "")) {
      folder = "/ (racine)";
    } else {
      folder = segments[0];
    }
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(fullUrl);
  });
  // Sort: root first, then alphabetical
  var sortedKeys = Object.keys(groups).sort(function(a, b) {
    if (a === "/ (racine)") return -1;
    if (b === "/ (racine)") return 1;
    return a.localeCompare(b);
  });
  var sorted = {};
  sortedKeys.forEach(function(k) { sorted[k] = groups[k]; });
  return sorted;
}

function psComputeFolderScores(urls) {
  var sumPerf = 0, sumA11y = 0, sumSeo = 0, count = 0;
  urls.forEach(function(url) {
    var result = psResults[url];
    if (!result || !result[psStrategy]) return;
    var r = result[psStrategy];
    var perf, a11y, seo;
    if (r._compact) {
      perf = r.scores.performance; a11y = r.scores.accessibility; seo = r.scores.seo;
    } else if (r.lighthouseResult) {
      var cats = r.lighthouseResult.categories;
      perf = cats.performance ? Math.round(cats.performance.score * 100) : null;
      a11y = cats.accessibility ? Math.round(cats.accessibility.score * 100) : null;
      seo = cats.seo ? Math.round(cats.seo.score * 100) : null;
    }
    if (perf != null) { sumPerf += perf; sumA11y += (a11y || 0); sumSeo += (seo || 0); count++; }
  });
  if (count === 0) return null;
  return { perf: Math.round(sumPerf / count), a11y: Math.round(sumA11y / count), seo: Math.round(sumSeo / count) };
}

function psGetPageMiniScores(fullUrl) {
  var result = psResults[fullUrl];
  var strat = psStrategy;
  var miniScores = "";
  if (result && result[strat]) {
    var r = result[strat];
    var perf, a11y, seo;
    if (r._compact) {
      perf = r.scores.performance; a11y = r.scores.accessibility; seo = r.scores.seo;
    } else if (r.lighthouseResult) {
      var cats = r.lighthouseResult.categories;
      perf = cats.performance ? Math.round(cats.performance.score * 100) : null;
      a11y = cats.accessibility ? Math.round(cats.accessibility.score * 100) : null;
      seo = cats.seo ? Math.round(cats.seo.score * 100) : null;
    }
    if (perf != null) miniScores += '<span class="ps-mini-gauge" style="--gauge-color:' + psColor(perf) + '" title="Performance">' + perf + '</span>';
    if (a11y != null) miniScores += '<span class="ps-mini-gauge" style="--gauge-color:' + psColor(a11y) + '" title="Accessibilit\u00e9">' + a11y + '</span>';
    if (seo != null) miniScores += '<span class="ps-mini-gauge" style="--gauge-color:' + psColor(seo) + '" title="SEO">' + seo + '</span>';
  }
  return miniScores;
}

/* ── Render page list ── */
function psRenderPageList(preselected) {
  var groups = psGroupByFolder(psPages);
  var html = "";
  var folderKeys = Object.keys(groups);

  // If first render, expand all folders
  if (Object.keys(psExpandedFolders).length === 0) {
    folderKeys.forEach(function(f) { psExpandedFolders[f] = true; });
  }

  folderKeys.forEach(function(folder) {
    var urls = groups[folder];
    var isOpen = psExpandedFolders[folder] !== false;
    var folderScores = psComputeFolderScores(urls);

    // Check if all/some/none are selected
    var allChecked = true, noneChecked = true;
    urls.forEach(function(u) {
      var isChecked = preselected.length > 0 ? preselected.indexOf(u) >= 0 : false;
      if (isChecked) noneChecked = false;
      else allChecked = false;
    });
    var folderChecked = allChecked && !noneChecked;
    var folderIndeterminate = !allChecked && !noneChecked ? false : (!allChecked && !noneChecked);

    // Folder mini scores
    var folderMiniScores = "";
    if (folderScores) {
      folderMiniScores += '<span class="ps-mini-gauge" style="--gauge-color:' + psColor(folderScores.perf) + '" title="Moy. Performance">' + folderScores.perf + '</span>';
      folderMiniScores += '<span class="ps-mini-gauge" style="--gauge-color:' + psColor(folderScores.a11y) + '" title="Moy. Accessibilit\u00e9">' + folderScores.a11y + '</span>';
      folderMiniScores += '<span class="ps-mini-gauge" style="--gauge-color:' + psColor(folderScores.seo) + '" title="Moy. SEO">' + folderScores.seo + '</span>';
    }

    // Folder header
    html += '<div class="ps-folder-header" data-folder="' + folder.replace(/"/g, "&quot;") + '">' +
      '<span class="ps-folder-chevron' + (isOpen ? " open" : "") + '">\u25B6</span>' +
      '<label class="ps-folder-check" onclick="event.stopPropagation()">' +
      '<input type="checkbox" class="ps-folder-cb"' + (folderChecked ? " checked" : "") + '>' +
      '</label>' +
      '<span class="ps-folder-icon">\uD83D\uDCC1</span>' +
      '<span class="ps-folder-name">/' + (folder === "/ (racine)" ? "" : folder) + '</span>' +
      '<span class="ps-folder-count">(' + urls.length + ' page' + (urls.length > 1 ? "s" : "") + ')</span>' +
      '<div class="ps-mini-scores ps-folder-scores">' + folderMiniScores + '</div>' +
      '</div>';

    // Folder body
    html += '<div class="ps-folder-body" data-folder-body="' + folder.replace(/"/g, "&quot;") + '"' + (isOpen ? "" : ' style="display:none"') + '>';

    urls.forEach(function(fullUrl) {
      var path;
      try { path = new URL(fullUrl).pathname; } catch(e) { path = fullUrl; }
      var checked = preselected.length > 0 ? preselected.indexOf(fullUrl) >= 0 : false;
      var result = psResults[fullUrl];
      var strat = psStrategy;

      var miniScores = psGetPageMiniScores(fullUrl);
      var statusIcon = "";
      if (result && result[strat]) statusIcon = '<span class="ps-page-done">\u2713</span>';

      html += '<div class="ps-page-row" data-url="' + fullUrl.replace(/"/g, "&quot;") + '">' +
        '<label class="ps-page-check" onclick="event.stopPropagation()">' +
        '<input type="checkbox"' + (checked ? " checked" : "") + '>' +
        '</label>' +
        '<span class="ps-page-path" title="' + fullUrl.replace(/"/g, "&quot;") + '">' + path + '</span>' +
        '<div class="ps-mini-scores">' + miniScores + '</div>' +
        statusIcon +
        '</div>';

      // Detail panel placeholder
      html += '<div class="ps-page-detail" data-detail-for="' + fullUrl.replace(/"/g, "&quot;") + '" style="display:none"></div>';
    });

    html += '</div>'; // close folder body
  });

  qs("#psPageListBody").innerHTML = html;

  // Click handler for row expansion
  qsa(".ps-page-row").forEach(function(row) {
    row.addEventListener("click", function(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "LABEL") return;
      psToggleDetail(row.dataset.url);
    });
  });

  // Click handler for folder headers (chevron toggle)
  qsa(".ps-folder-header").forEach(function(header) {
    header.addEventListener("click", function(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "LABEL") return;
      var folder = header.dataset.folder;
      psExpandedFolders[folder] = !psExpandedFolders[folder];
      var chevron = header.querySelector(".ps-folder-chevron");
      var body = qs('[data-folder-body="' + folder.replace(/"/g, '\\"') + '"]');
      if (psExpandedFolders[folder]) {
        chevron.classList.add("open");
        if (body) body.style.display = "block";
      } else {
        chevron.classList.remove("open");
        if (body) body.style.display = "none";
      }
    });
  });

  // Folder checkbox: check/uncheck all children
  qsa(".ps-folder-cb").forEach(function(cb) {
    cb.addEventListener("change", function() {
      var header = cb.closest(".ps-folder-header");
      var folder = header.dataset.folder;
      var body = qs('[data-folder-body="' + folder.replace(/"/g, '\\"') + '"]');
      if (body) {
        body.querySelectorAll('.ps-page-row input[type="checkbox"]').forEach(function(childCb) {
          childCb.checked = cb.checked;
        });
      }
    });
  });
}

/* ── Toggle detail panel ── */
function psToggleDetail(url) {
  // Find the detail panel
  var panels = qsa(".ps-page-detail");
  var panel = null;
  panels.forEach(function(p) { if (p.dataset.detailFor === url) panel = p; });
  if (!panel) return;

  // Collapse previous
  if (psExpandedUrl && psExpandedUrl !== url) {
    panels.forEach(function(p) {
      if (p.dataset.detailFor === psExpandedUrl) p.style.display = "none";
    });
    // Remove highlight
    qsa(".ps-page-row").forEach(function(r) { r.style.borderColor = ""; });
  }

  if (psExpandedUrl === url) {
    panel.style.display = "none";
    psExpandedUrl = null;
    return;
  }

  psExpandedUrl = url;
  var result = psResults[url];
  if (!result || !result[psStrategy]) {
    panel.innerHTML = '<div class="ps-detail-inner"><div class="ps-empty">Pas encore analys\u00e9. S\u00e9lectionne cette page et lance l\'analyse.</div></div>';
  } else {
    panel.innerHTML = '<div class="ps-detail-inner">' + psRenderDetailContent(result[psStrategy]) + '</div>';
  }
  panel.style.display = "block";

  // Attach reco expand/collapse listeners
  panel.querySelectorAll(".ps-reco-item").forEach(function(item) {
    item.addEventListener("click", function() {
      item.classList.toggle("ps-reco-expanded");
      var chevron = item.querySelector(".ps-reco-expand");
      if (chevron) chevron.textContent = item.classList.contains("ps-reco-expanded") ? "\u25BC" : "\u25B6";
      var wrap = item.nextElementSibling;
      if (wrap && wrap.classList.contains("ps-reco-detail-wrap")) {
        wrap.style.display = item.classList.contains("ps-reco-expanded") ? "block" : "none";
      }
    });
  });
}

/* ── Format item values for reco tables ── */
function psFormatItemValue(value, valueType) {
  if (value === undefined || value === null) return "\u2014";
  if (valueType === "bytes") {
    if (typeof value !== "number") return String(value);
    if (value >= 1048576) return (value / 1048576).toFixed(1) + " MB";
    return (value / 1024).toFixed(1) + " KB";
  }
  if (valueType === "ms" || valueType === "timespanMs") {
    if (typeof value !== "number") return String(value);
    if (value >= 1000) return (value / 1000).toFixed(1) + " s";
    return Math.round(value) + " ms";
  }
  if (valueType === "url") {
    var s = typeof value === "object" ? (value.url || String(value)) : String(value);
    var display = s;
    if (display.length > 80) display = display.substring(0, 77) + "\u2026";
    if (s.indexOf("http") === 0) return '<a href="' + s.replace(/"/g, "&quot;") + '" target="_blank" rel="noopener" class="ps-reco-link" title="' + s.replace(/"/g, "&quot;") + '">' + display.replace(/</g, "&lt;") + '</a>';
    return '<span title="' + s.replace(/"/g, "&quot;") + '">' + display.replace(/</g, "&lt;") + '</span>';
  }
  if (valueType === "node") {
    if (typeof value === "object") {
      var parts = [];
      // Show thumbnail image if available (PSI provides base64 or URL thumbnails for image elements)
      if (value.thumbnail) {
        parts.push('<img src="' + String(value.thumbnail).replace(/"/g, "&quot;") + '" class="ps-reco-thumb" loading="lazy" alt="' + (value.nodeLabel || "Element preview").replace(/"/g, "&quot;") + '" onclick="psShowImageLightbox(this.src);event.stopPropagation()">');
      }
      if (value.nodeLabel) parts.push('<span class="ps-reco-node-label">' + value.nodeLabel.replace(/</g, "&lt;") + '</span>');
      if (value.selector) parts.push('<span class="ps-reco-selector">' + value.selector.replace(/</g, "&lt;") + '</span>');
      if (value.snippet) parts.push('<code class="ps-reco-snippet">' + value.snippet.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</code>');
      return parts.length > 0 ? parts.join("") : "\u2014";
    }
    return String(value).replace(/</g, "&lt;");
  }
  if (valueType === "source-location") {
    if (typeof value === "object") {
      var loc = (value.url || "") + (value.line !== undefined ? ":" + value.line + ":" + (value.column || 0) : "");
      if (loc && value.url && value.url.indexOf("http") === 0) return '<a href="' + value.url.replace(/"/g, "&quot;") + '" target="_blank" rel="noopener" class="ps-reco-link">' + loc.replace(/</g, "&lt;") + '</a>';
      return loc || "\u2014";
    }
    return String(value);
  }
  if (valueType === "code") {
    return '<code class="ps-reco-snippet">' + String(value).replace(/</g, "&lt;") + '</code>';
  }
  if (valueType === "numeric") return typeof value === "number" ? value.toFixed(1) : String(value);
  if (valueType === "thumbnail") {
    if (typeof value === "string" && (value.indexOf("http") === 0 || value.indexOf("data:") === 0)) return '<img src="' + value.replace(/"/g, "&quot;") + '" class="ps-reco-thumb" loading="lazy" alt="Resource preview" onclick="psShowImageLightbox(this.src);event.stopPropagation()">';
    return "\u2014";
  }
  // Default: handle objects and strings
  if (typeof value === "object") return JSON.stringify(value).substring(0, 100);
  return String(value).replace(/</g, "&lt;");
}

function psRenderRecoItems(recos, sectionTitle) {
  if (!recos || recos.length === 0) return "";
  var title = sectionTitle || "\uD83D\uDCA1 Recommandations";
  var html = '<div class="ps-reco-title">' + title + ' <span class="ps-reco-count">(' + recos.length + ')</span></div><div class="ps-reco-list">';
  recos.forEach(function(r, idx) {
    var color = psColor(Math.round(r.score * 100));
    var itemCount = r.items ? r.items.length : 0;
    var totalCount = r.totalItems || itemCount;
    html += '<div class="ps-reco-item" data-reco-idx="' + idx + '">' +
      '<span class="ps-reco-expand">\u25B6</span>' +
      '<span class="ps-reco-badge" style="background:' + color + '"></span>' +
      '<span class="ps-reco-name">' + r.title + '</span>' +
      psRenderMetricBadges(r.metrics);
    if (r.savings && r.savings !== "0.0") {
      html += '<span class="ps-reco-saving">\u2212' + r.savings + ' s</span>';
    } else if (r.savingsBytes) {
      html += '<span class="ps-reco-saving">\u2212' + r.savingsBytes + '</span>';
    }
    if (totalCount > 0) {
      html += '<span class="ps-reco-item-count">' + totalCount + ' \u00e9l\u00e9ments</span>';
    }
    html += '</div>';
    // Detail wrap (description + table)
    html += '<div class="ps-reco-detail-wrap">';
    if (r.desc) {
      // Convert markdown links [text](url) to clickable HTML links
      var richDesc = r.desc.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="ps-reco-learn-link">$1</a>');
      html += '<div class="ps-reco-desc">' + richDesc + '</div>';
    }
    if (r.items && r.items.length > 0 && r.headings && r.headings.length > 0) {
      // Filter out headings with no label and no data
      var visibleHeadings = r.headings.filter(function(h) { return h.label || h.key; });
      html += '<div class="ps-reco-table-wrap"><table class="ps-reco-table"><thead><tr>';
      visibleHeadings.forEach(function(h) {
        var alignCls = (h.valueType === "bytes" || h.valueType === "ms" || h.valueType === "timespanMs" || h.valueType === "numeric") ? ' class="ps-reco-num-col"' : '';
        html += '<th' + alignCls + '>' + (h.label || h.key) + '</th>';
      });
      html += '</tr></thead><tbody>';
      r.items.forEach(function(item) {
        html += '<tr>';
        visibleHeadings.forEach(function(h) {
          var val = item[h.key];
          var formatted = psFormatItemValue(val, h.valueType);
          var cellCls = '';
          if (h.valueType === "url") cellCls = ' class="ps-reco-url-cell"';
          else if (h.valueType === "node") cellCls = ' class="ps-reco-node-cell"';
          else if (h.valueType === "bytes" || h.valueType === "ms" || h.valueType === "timespanMs" || h.valueType === "numeric") cellCls = ' class="ps-reco-num-cell"';
          else if (h.valueType === "code" || h.valueType === "source-location") cellCls = ' class="ps-reco-code-cell"';
          html += '<td' + cellCls + '>' + formatted + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      if (totalCount > itemCount) {
        html += '<div class="ps-reco-truncated">' + (totalCount - itemCount) + ' \u00e9l\u00e9ments suppl\u00e9mentaires non affich\u00e9s</div>';
      }
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/* ── Extract audit items from full API response ── */
function psExtractAuditItems(a) {
  var result = { items: [], headings: [], totalItems: 0 };
  if (!a.details || !a.details.headings || !a.details.items) return result;
  result.totalItems = a.details.items.length;
  result.headings = a.details.headings.filter(function(h) {
    return h.key && h.key !== "node";
  }).map(function(h) {
    return { key: h.key, label: h.label || h.key, valueType: h.valueType || "text", subItemsHeading: h.subItemsHeading || null };
  });
  // Include node heading if present (for element-specific audits)
  a.details.headings.forEach(function(h) {
    if (h.key === "node") {
      result.headings.unshift({ key: "node", label: "\u00c9l\u00e9ment", valueType: "node" });
    }
  });
  // Get all items
  var items = a.details.items;
  items.forEach(function(item) {
    var row = {};
    result.headings.forEach(function(h) {
      var val = item[h.key];
      if (val === undefined || val === null) return;
      // Keep objects for node/url/source-location types to preserve full data
      if (h.valueType === "node" || h.valueType === "source-location") {
        row[h.key] = val;
      } else if (h.valueType === "thumbnail") {
        // Thumbnail: store the image URL directly
        row[h.key] = typeof val === "string" ? val : (val && val.url ? val.url : null);
      } else if (typeof val === "object" && val.url) {
        row[h.key] = val.url;
      } else if (typeof val === "object" && val.snippet) {
        row[h.key] = val;
      } else {
        row[h.key] = val;
      }
    });
    // Include subItems if present (e.g., for third-party details)
    if (item.subItems && item.subItems.items) {
      row._subItems = item.subItems.items.slice(0, 5);
    }
    result.items.push(row);
  });
  return result;
}

/* ── Render detail content (gauges + CWV + opportunities + diagnostics + passed) ── */
function psRenderDetailContent(data) {
  var catDefs = [
    { key: "performance", name: "Performance" },
    { key: "accessibility", name: "Accessibilit\u00e9" },
    { key: "best-practices", name: "Bonnes pratiques" },
    { key: "seo", name: "SEO" }
  ];
  var metricDefs = [
    { key: "first-contentful-paint", name: "First Contentful Paint (FCP)" },
    { key: "largest-contentful-paint", name: "Largest Contentful Paint (LCP)" },
    { key: "total-blocking-time", name: "Total Blocking Time (TBT)" },
    { key: "cumulative-layout-shift", name: "Cumulative Layout Shift (CLS)" },
    { key: "speed-index", name: "Speed Index" },
    { key: "interactive", name: "Time to Interactive (TTI)" }
  ];
  var cwvKeys = {};
  metricDefs.forEach(function(m) { cwvKeys[m.key] = true; });

  var html = '<div class="ps-scores">';

  if (data._compact) {
    // ── COMPACT: Score cards with tooltip on Performance ──
    catDefs.forEach(function(c) {
      var score = data.scores[c.key] != null ? data.scores[c.key] : 0;
      if (c.key === "performance") {
        html += '<div class="ps-score-card ps-score-card-perf">' + psGaugeSvg(score) + '<div class="ps-score-name">' + c.name + '</div>' + psScoreTooltipHtml(data.cwv || {}, true) + '</div>';
      } else {
        html += '<div class="ps-score-card">' + psGaugeSvg(score) + '<div class="ps-score-name">' + c.name + '</div></div>';
      }
    });
    html += '</div>';

    // ── COMPACT: Metric bars ──
    html += '<div class="ps-metrics-title">\u2699\uFE0F Core Web Vitals</div><div class="ps-metrics-grid">';
    metricDefs.forEach(function(m) {
      var cwv = data.cwv[m.key];
      if (!cwv) return;
      html += psRenderMetricBar(m.key, cwv.numericValue != null ? cwv.numericValue : null, cwv.score, cwv.val);
    });
    html += '</div>';

    // ── COMPACT: Recos ──
    var opps = (data.recos || []).filter(function(r) { return r.group === "opportunity" || r.savings; });
    var diags = (data.recos || []).filter(function(r) { return r.group === "diagnostic" && !r.savings; });
    if (opps.length === 0 && diags.length === 0) opps = data.recos || [];
    if (opps.length > 0) html += psRenderRecoItems(opps, "\uD83D\uDE80 Opportunit\u00e9s");
    if (diags.length > 0) html += psRenderRecoItems(diags, "\uD83D\uDD0D Diagnostics");
    if (data.passedCount) {
      html += '<div class="ps-passed-title">\u2705 Audits r\u00e9ussis (' + data.passedCount + ')</div>';
    }
  } else {
    // ── FULL API: Score cards with tooltip on Performance ──
    var cats = data.lighthouseResult.categories;
    var audits = data.lighthouseResult.audits;

    // Build cwv data for tooltip
    var cwvForTooltip = {};
    metricDefs.forEach(function(m) {
      var a = audits[m.key];
      if (a) cwvForTooltip[m.key] = { val: a.displayValue || "", score: a.score, numericValue: a.numericValue || null };
    });

    catDefs.forEach(function(c) {
      var cat = cats[c.key];
      var score = cat ? Math.round(cat.score * 100) : 0;
      if (c.key === "performance") {
        html += '<div class="ps-score-card ps-score-card-perf">' + psGaugeSvg(score) + '<div class="ps-score-name">' + c.name + '</div>' + psScoreTooltipHtml(cwvForTooltip, false) + '</div>';
      } else {
        html += '<div class="ps-score-card">' + psGaugeSvg(score) + '<div class="ps-score-name">' + c.name + '</div></div>';
      }
    });
    html += '</div>';

    // ── FULL API: Metric bars ──
    html += '<div class="ps-metrics-title">\u2699\uFE0F Core Web Vitals</div><div class="ps-metrics-grid">';
    metricDefs.forEach(function(m) {
      var audit = audits[m.key];
      if (!audit) return;
      html += psRenderMetricBar(m.key, audit.numericValue || null, audit.score, audit.displayValue);
    });
    html += '</div>';

    // ── FULL API: Recos ──
    var opportunities = [];
    var diagnostics = [];
    var passedCount = 0;
    Object.keys(audits).forEach(function(key) {
      var a = audits[key];
      if (cwvKeys[key]) return;
      if (a.scoreDisplayMode === "notApplicable" || a.scoreDisplayMode === "manual" || a.scoreDisplayMode === "informative") return;
      if (a.score !== null && a.score >= 0.9) { passedCount++; return; }
      if (a.score === null) return;

      var extracted = psExtractAuditItems(a);
      var reco = {
        title: a.title,
        desc: a.description || "",
        score: a.score,
        displayValue: a.displayValue || "",
        headings: extracted.headings.length > 0 ? extracted.headings : undefined,
        items: extracted.items.length > 0 ? extracted.items : undefined,
        totalItems: extracted.totalItems,
        metrics: psGetAuditMetrics(a, key)
      };

      if (a.details && a.details.type === "opportunity") {
        reco.group = "opportunity";
        reco.savings = a.details.overallSavingsMs ? (a.details.overallSavingsMs / 1000).toFixed(1) : "";
        if (a.details.overallSavingsBytes) {
          reco.savingsBytes = a.details.overallSavingsBytes >= 1048576 ? (a.details.overallSavingsBytes / 1048576).toFixed(1) + " MB" : (a.details.overallSavingsBytes / 1024).toFixed(0) + " KB";
        }
        opportunities.push(reco);
      } else if (a.details && (a.details.type === "table" || a.details.type === "list")) {
        reco.group = "diagnostic";
        diagnostics.push(reco);
      } else if (a.score < 0.9) {
        reco.group = "diagnostic";
        diagnostics.push(reco);
      }
    });

    opportunities.sort(function(a, b) {
      var sa = parseFloat(a.savings) || 0, sb = parseFloat(b.savings) || 0;
      return sb - sa;
    });
    diagnostics.sort(function(a, b) { return a.score - b.score; });

    if (opportunities.length > 0) html += psRenderRecoItems(opportunities, "\uD83D\uDE80 Opportunit\u00e9s");
    if (diagnostics.length > 0) html += psRenderRecoItems(diagnostics, "\uD83D\uDD0D Diagnostics");
    if (passedCount > 0) {
      html += '<div class="ps-passed-title">\u2705 Audits r\u00e9ussis (' + passedCount + ')</div>';
    }
  }

  return html;
}

/* ── Batch analysis (parallel pool) ── */
var PS_CONCURRENCY = 5;
var psDoneCount = 0;
var psTotalCount = 0;
var psRateLimited = false;

function psMarkRowAnalyzing(url) {
  var row = null;
  qsa(".ps-page-row").forEach(function(r) { if (r.dataset.url === url) row = r; });
  if (row) {
    var existingDone = row.querySelector(".ps-page-done");
    if (existingDone) existingDone.remove();
    var spinner = document.createElement("span");
    spinner.className = "ps-page-spinner";
    row.appendChild(spinner);
    row.classList.add("ps-analyzing");
  }
}

function psUnmarkRow(url) {
  var row = null;
  qsa(".ps-page-row").forEach(function(r) { if (r.dataset.url === url) row = r; });
  if (row) {
    row.classList.remove("ps-analyzing");
    var sp = row.querySelector(".ps-page-spinner");
    if (sp) sp.remove();
  }
}

function psUpdateProgress(extra) {
  qs("#psProgressFill").style.width = (psDoneCount / psTotalCount * 100) + "%";
  qs("#psProgressText").textContent = extra || (psDoneCount + " / " + psTotalCount);
}

async function psAnalyzeOne(url) {
  psMarkRowAnalyzing(url);
  try {
    var apiUrl = "/api/pagespeed?url=" + encodeURIComponent(url) + "&strategy=" + psStrategy;
    var apiData = null;
    var maxRetries = 3;
    for (var attempt = 0; attempt < maxRetries; attempt++) {
      if (psAborted) return;
      // If another worker triggered rate limit, wait for it to clear
      while (psRateLimited && !psAborted) {
        await new Promise(function(resolve) { setTimeout(resolve, 2000); });
      }
      if (psAborted) return;
      var resp = await fetch(apiUrl);
      if (resp.status === 429) {
        // Signal all workers to pause
        if (!psRateLimited) {
          psRateLimited = true;
          psUpdateProgress("Quota atteint, pause 60s\u2026 (essai " + (attempt + 1) + "/" + maxRetries + ")");
          await new Promise(function(resolve) { setTimeout(resolve, 60000); });
          psRateLimited = false;
        } else {
          // Another worker already pausing, just wait
          while (psRateLimited && !psAborted) {
            await new Promise(function(resolve) { setTimeout(resolve, 2000); });
          }
        }
        continue;
      }
      if (!resp.ok) throw new Error("API error " + resp.status);
      apiData = await resp.json();
      break;
    }
    if (psAborted) return;
    if (!apiData) throw new Error("429 apr\u00e8s " + maxRetries + " essais");

    if (!psResults[url]) psResults[url] = {};
    psResults[url][psStrategy] = apiData;
    psResults[url].lastAnalyzed = new Date().toISOString();
    psSaveToStorage(psDomainKey);
  } catch(e) {
    if (!psResults[url]) psResults[url] = {};
    psResults[url][psStrategy + "_error"] = e.message;
  } finally {
    psUnmarkRow(url);
  }
  psDoneCount++;
  psUpdateProgress();
  // Re-render to show inline scores
  var prevExpanded = psExpandedUrl;
  var currentChecked = psGetCheckedUrls();
  psRenderPageList(currentChecked);
  if (prevExpanded) psToggleDetail(prevExpanded);
}

async function psAnalyzeSelection() {
  var selected = [];
  qsa(".ps-page-row").forEach(function(row) {
    var cb = row.querySelector("input[type=checkbox]");
    if (cb && cb.checked) selected.push(row.dataset.url);
  });
  if (selected.length === 0) return;

  psRunning = true;
  psAborted = false;
  psDoneCount = 0;
  psTotalCount = selected.length;
  psRateLimited = false;
  qs("#btnPsAnalyze").style.display = "none";
  qs("#btnPsStop").style.display = "inline-block";
  qs("#psProgressWrap").style.display = "flex";
  psUpdateProgress();

  // Worker pool: run up to PS_CONCURRENCY tasks in parallel
  var queue = selected.slice();
  var running = [];

  function startNext() {
    if (psAborted || queue.length === 0) return null;
    var url = queue.shift();
    var p = psAnalyzeOne(url).then(function() {
      running.splice(running.indexOf(p), 1);
    });
    running.push(p);
    return p;
  }

  // Start initial batch
  for (var i = 0; i < Math.min(PS_CONCURRENCY, selected.length); i++) {
    startNext();
  }

  // As each finishes, start the next one
  while (running.length > 0 && !psAborted) {
    await Promise.race(running);
    if (!psAborted && queue.length > 0) startNext();
  }

  psRunning = false;
  qs("#btnPsStop").style.display = "none";
  qs("#btnPsAnalyze").style.display = "inline-block";
  qs("#psProgressWrap").style.display = "none";
}

/* ── Event listeners ── */
qs("#btnCrawl").addEventListener("click", psCrawlSite);
qs("#psDomain").addEventListener("keydown", function(e) {
  if (e.key === "Enter") psCrawlSite();
});
qs("#btnPsAnalyze").addEventListener("click", psAnalyzeSelection);
qs("#btnPsStop").addEventListener("click", function() { psAborted = true; });
qs("#btnPsSelectAll").addEventListener("click", function() {
  qsa(".ps-page-row input[type=checkbox]").forEach(function(cb) { cb.checked = true; });
});
qs("#btnPsDeselectAll").addEventListener("click", function() {
  qsa(".ps-page-row input[type=checkbox]").forEach(function(cb) { cb.checked = false; });
});

/* Strategy toggle */
qsa(".ps-strategy-btn").forEach(function(b) {
  b.addEventListener("click", function() {
    qsa(".ps-strategy-btn").forEach(function(x) { x.classList.remove("active"); });
    b.classList.add("active");
    psStrategy = b.dataset.strategy;
    if (psPages.length > 0) psRenderPageList([]);
  });
});
</script>`;
}
