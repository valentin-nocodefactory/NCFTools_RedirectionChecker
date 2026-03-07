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
qsa(".tab").forEach(function(t) {
  t.addEventListener("click", function() {
    qsa(".tab").forEach(function(x) { x.classList.remove("active"); });
    t.classList.add("active");
    qs("#tab-input").style.display = t.dataset.tab === "input" ? "block" : "none";
    qs("#tab-results").style.display = t.dataset.tab === "results" ? "block" : "none";
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
</script>`;
}
