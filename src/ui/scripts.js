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
    // Compact results: store only scores + metrics + recos, not full API response
    var compact = {};
    Object.keys(psResults).forEach(function(url) {
      compact[url] = {};
      ["mobile", "desktop"].forEach(function(s) {
        var d = psResults[url][s];
        if (!d) return;
        // Already compact format
        if (d._compact) {
          compact[url][s] = { scores: d.scores, cwv: d.cwv, recos: d.recos };
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
          if (audits[k]) cwv[k] = { val: audits[k].displayValue || "", score: audits[k].score };
        });
        var recos = [];
        Object.keys(audits).forEach(function(k) {
          var a = audits[k];
          if (a.score !== null && a.score < 0.9 && a.details && a.details.type === "opportunity") {
            var topItems = [];
            var headings = [];
            if (a.details.headings && a.details.items) {
              headings = a.details.headings.map(function(h) { return { key: h.key, label: h.label || h.key, valueType: h.valueType || "text" }; });
              var items = a.details.items.slice(0, 5);
              items.forEach(function(item) {
                var row = {};
                headings.forEach(function(h) {
                  if (item[h.key] !== undefined && item[h.key] !== null) {
                    if (typeof item[h.key] === "object" && item[h.key].url) row[h.key] = item[h.key].url;
                    else if (typeof item[h.key] === "object" && item[h.key].snippet) row[h.key] = item[h.key].snippet;
                    else row[h.key] = item[h.key];
                  }
                });
                topItems.push(row);
              });
            }
            recos.push({
              title: a.title,
              desc: a.description || "",
              savings: a.details.overallSavingsMs ? (a.details.overallSavingsMs / 1000).toFixed(1) : "",
              score: a.score,
              headings: headings.length > 0 ? headings : undefined,
              items: topItems.length > 0 ? topItems : undefined
            });
          }
        });
        recos.sort(function(a, b) { return a.score - b.score; });
        compact[url][s] = { scores: scores, cwv: cwv, recos: recos };
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
        psResults[url][s] = { _compact: true, scores: c.scores, cwv: c.cwv, recos: c.recos };
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
  if (valueType === "bytes") return (value / 1024).toFixed(1) + " KB";
  if (valueType === "ms" || valueType === "timespanMs") return (value / 1000).toFixed(2) + " s";
  if (valueType === "url") {
    var s = String(value);
    if (s.length > 70) return s.substring(0, 67) + "\u2026";
    return s;
  }
  if (valueType === "node") {
    if (typeof value === "object") return value.snippet || value.selector || "\u2014";
    return String(value);
  }
  if (valueType === "numeric") return typeof value === "number" ? value.toFixed(1) : String(value);
  return String(value);
}

function psRenderRecoItems(recos) {
  if (!recos || recos.length === 0) return "";
  var html = '<div class="ps-reco-title">\uD83D\uDCA1 Recommandations</div><div class="ps-reco-list">';
  recos.forEach(function(r, idx) {
    var color = psColor(Math.round(r.score * 100));
    html += '<div class="ps-reco-item" data-reco-idx="' + idx + '">' +
      '<span class="ps-reco-expand">\u25B6</span>' +
      '<span class="ps-reco-badge" style="background:' + color + '"></span>' +
      '<span class="ps-reco-name">' + r.title + '</span>' +
      (r.savings ? '<span class="ps-reco-saving">-' + r.savings + ' s</span>' : '') +
      '</div>';
    // Detail wrap (description + table)
    html += '<div class="ps-reco-detail-wrap">';
    if (r.desc) {
      // Clean markdown-style links from Lighthouse descriptions: [text](url) → text
      var cleanDesc = r.desc.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      html += '<div class="ps-reco-desc">' + cleanDesc + '</div>';
    }
    if (r.items && r.items.length > 0 && r.headings && r.headings.length > 0) {
      html += '<table class="ps-reco-table"><thead><tr>';
      r.headings.forEach(function(h) {
        html += '<th>' + (h.label || h.key) + '</th>';
      });
      html += '</tr></thead><tbody>';
      r.items.forEach(function(item) {
        html += '<tr>';
        r.headings.forEach(function(h) {
          var val = item[h.key];
          var formatted = psFormatItemValue(val, h.valueType);
          var cls = h.valueType === "url" ? ' class="ps-reco-url"' : '';
          html += '<td' + cls + '>' + formatted + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/* ── Render detail content (gauges + CWV + recommendations) ── */
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

  var html = '<div class="ps-scores">';

  if (data._compact) {
    // Render from compact stored data
    catDefs.forEach(function(c) {
      var score = data.scores[c.key] != null ? data.scores[c.key] : 0;
      html += '<div class="ps-score-card">' + psGaugeSvg(score) + '<div class="ps-score-name">' + c.name + '</div></div>';
    });
    html += '</div>';

    html += '<div class="ps-metrics-title">\u2699\uFE0F Core Web Vitals</div>';
    metricDefs.forEach(function(m) {
      var cwv = data.cwv[m.key];
      if (!cwv) return;
      var val = cwv.val || "\u2014";
      var score = cwv.score != null ? Math.round(cwv.score * 100) : null;
      var color = score != null ? psColor(score) : "#64748b";
      html += '<div class="ps-metric-row"><span class="ps-metric-badge" style="background:' + color + '"></span><span class="ps-metric-name">' + m.name + '</span><span class="ps-metric-val" style="color:' + color + '">' + val + '</span></div>';
    });

    html += psRenderRecoItems(data.recos);
  } else {
    // Render from full API response
    var cats = data.lighthouseResult.categories;
    var audits = data.lighthouseResult.audits;

    catDefs.forEach(function(c) {
      var cat = cats[c.key];
      var score = cat ? Math.round(cat.score * 100) : 0;
      html += '<div class="ps-score-card">' + psGaugeSvg(score) + '<div class="ps-score-name">' + c.name + '</div></div>';
    });
    html += '</div>';

    html += '<div class="ps-metrics-title">\u2699\uFE0F Core Web Vitals</div>';
    metricDefs.forEach(function(m) {
      var audit = audits[m.key];
      if (!audit) return;
      var val = audit.displayValue || "\u2014";
      var score = audit.score != null ? Math.round(audit.score * 100) : null;
      var color = score != null ? psColor(score) : "#64748b";
      html += '<div class="ps-metric-row"><span class="ps-metric-badge" style="background:' + color + '"></span><span class="ps-metric-name">' + m.name + '</span><span class="ps-metric-val" style="color:' + color + '">' + val + '</span></div>';
    });

    // Recommendations from audits (enriched)
    var recos = [];
    Object.keys(audits).forEach(function(key) {
      var a = audits[key];
      if (a.score !== null && a.score < 0.9 && a.details && a.details.type === "opportunity") {
        var topItems = [];
        var headings = [];
        if (a.details.headings && a.details.items) {
          headings = a.details.headings.map(function(h) { return { key: h.key, label: h.label || h.key, valueType: h.valueType || "text" }; });
          var items = a.details.items.slice(0, 5);
          items.forEach(function(item) {
            var row = {};
            headings.forEach(function(h) {
              if (item[h.key] !== undefined && item[h.key] !== null) {
                if (typeof item[h.key] === "object" && item[h.key].url) row[h.key] = item[h.key].url;
                else if (typeof item[h.key] === "object" && item[h.key].snippet) row[h.key] = item[h.key].snippet;
                else row[h.key] = item[h.key];
              }
            });
            topItems.push(row);
          });
        }
        recos.push({
          title: a.title,
          desc: a.description || "",
          savings: a.details.overallSavingsMs ? (a.details.overallSavingsMs / 1000).toFixed(1) : "",
          score: a.score,
          headings: headings.length > 0 ? headings : undefined,
          items: topItems.length > 0 ? topItems : undefined
        });
      }
    });
    recos.sort(function(a, b) { return a.score - b.score; });
    html += psRenderRecoItems(recos);
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
