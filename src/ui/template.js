import { styles } from './styles.js';
import { getClientScript } from './scripts.js';
import { FAVICON_BASE64, LOGO_SVG, MACARON_SVG } from './icons.js';

/**
 * Builds the complete HTML page for the redirect checker.
 */
export function buildHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirect Chain Checker &mdash; NocodeFactory</title>
  <link rel="icon" href="data:image/jpeg;base64,${FAVICON_BASE64}" type="image/jpeg">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${styles}</style>
</head>
<body>

<!-- Top glow bar + tools tray -->
<div class="top-glow-wrap" id="glowWrap">
  <div class="top-glow-bar" id="glowBar"></div>
  <div class="top-glow-tray">
    <div class="top-glow-tray-inner">
      <div class="tray-header">
        <span class="tray-label">&#9883; Outils NocodeFactory</span>
        <button class="tray-close" id="trayClose">&times;</button>
      </div>
      <div class="tray-cards">
        <a class="tray-card active" href="#">
          <span class="tray-card-emoji">&#128256;</span>
          <span class="tray-card-name">Redirect Checker</span>
          <span class="tray-card-desc">Teste les redirections post-migration</span>
        </a>
        <a class="tray-card" href="#">
          <span class="tray-soon">coming soon</span>
          <span class="tray-card-emoji">&#127758;</span>
          <span class="tray-card-name">Audit GEO</span>
          <span class="tray-card-desc">Generative Engine Optimization</span>
        </a>
        <a class="tray-card" href="#">
          <span class="tray-soon">coming soon</span>
          <span class="tray-card-emoji">&#128200;</span>
          <span class="tray-card-name">Audit CRO</span>
          <span class="tray-card-desc">Conversion Rate Optimization</span>
        </a>
      </div>
    </div>
  </div>
</div>

<!-- Header -->
<div style="margin-bottom:28px">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px">
    ${LOGO_SVG}
    <span id="headerBadge" style="font-size:11px;padding:3px 10px;background:var(--badge-tag-bg);color:var(--badge-tag-color);border-radius:20px;font-weight:600;font-family:'JetBrains Mono',monospace">REDIRECT TOOL</span>
    <div style="flex:1"></div>
    <button class="theme-toggle" id="themeToggle" title="Changer le th&egrave;me">
      <span class="toggle-sun">&#9728;&#65039;</span>
      <span class="toggle-stars"><span></span><span></span><span></span></span>
    </button>
  </div>
</div>

<!-- Feature selector bar -->
<div class="feature-bar">
  <button class="feature-btn active" data-feature="redirect">
    <span class="feature-icon">&#128256;</span>
    <span class="feature-name">Redirect Checker</span>
  </button>
  <button class="feature-btn" data-feature="pagespeed">
    <span class="feature-icon">&#9889;</span>
    <span class="feature-name">PageSpeed Insights</span>
  </button>
</div>

<!-- Feature: Redirect Checker -->
<div id="feature-redirect">

<!-- Domain config card -->
<div class="card">
  <div class="domain-row">
    <div>
      <label class="label">&#128203; Domaine des URLs coll&eacute;es (ancien site)</label>
      <div class="domain-input-wrap">
        <img class="domain-fav" id="oldDomainFav" src="" alt="">
        <input type="text" id="oldDomain" placeholder="ancien-site.com" autocomplete="off">
        <div class="ac-dropdown" id="acOldDomain"></div>
      </div>
    </div>
    <div class="domain-arrow">&rarr;</div>
    <div>
      <label class="label">&#9989; Nouveau domaine (&agrave; tester)</label>
      <div class="domain-input-wrap">
        <img class="domain-fav" id="newDomainFav" src="" alt="">
        <input type="text" id="newDomain" placeholder="nouveau-site.com" autocomplete="off">
        <div class="ac-dropdown" id="acNewDomain"></div>
      </div>
    </div>
  </div>
  <div class="preview" id="domainPreview" style="display:none"></div>
  <div style="display:flex;justify-content:flex-end;margin-top:10px">
    <button class="btn-small" id="btnShare" title="Copier un lien avec les domaines pr&eacute;-remplis">&#128279; Partager cette config</button>
  </div>
</div>

<!-- Sub-tabs -->
<div class="sub-tab-row">
  <button class="sub-tab active" data-subtab="input">&#128203; URLs</button>
  <button class="sub-tab" data-subtab="results">&#128202; R&eacute;sultats <span id="resultCount"></span></button>
</div>

<!-- Input tab -->
<div class="card" id="tab-input">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px;flex-wrap:wrap">
    <label class="label" style="margin-bottom:0">Colle les URLs de l'ancien site (une par ligne)</label>
    <div style="display:flex;gap:8px">
      <button class="btn-small" id="btnCrawlOld" style="font-size:10px;padding:5px 10px">&#128375; Crawler l'ancien site</button>
      <button class="btn-small" id="btnHelp" style="font-size:10px;padding:5px 10px">&#10067; Comment r&eacute;cup&eacute;rer les URLs ?</button>
    </div>
  </div>
  <textarea id="urlInput" placeholder="/ma-page&#10;/blog/mon-article&#10;/services/web-design&#10;/contact&#10;https://ancien-site.com/a-propos"></textarea>
  <div style="display:flex;gap:8px;padding:14px;background:var(--info-bg);border-radius:8px;border:1px solid var(--info-border);margin:16px 0;transition:background .3s,border-color .3s">
    <span>&#128161;</span>
    <div style="font-size:12px;color:var(--text-muted);line-height:1.6"><strong style="color:var(--text-sec)">Fonctionnement :</strong> L'outil extrait le chemin de chaque URL, remplace le domaine par le <strong style="color:#22c55e">nouveau</strong>, et teste cette URL. Il v&eacute;rifie si elle r&eacute;pond 200, 301 (+ nombre de hops), ou 404.</div>
  </div>
  <div id="parseWarn" style="display:none;padding:12px 16px;background:var(--warn-bg);border-radius:8px;border:1px solid var(--warn-border);font-size:12px;color:var(--warn-text);margin-bottom:16px;transition:background .3s,border-color .3s,color .3s">Renseigne les deux domaines ci-dessus.</div>
  <button class="btn btn-primary" id="btnParse" disabled>Parser &rarr;</button>

  <!-- Help modal -->
  <div id="helpModal" style="display:none;position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);justify-content:center;align-items:center">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;padding:28px 32px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.3)">
      <button id="helpClose" style="position:absolute;top:12px;right:14px;width:30px;height:30px;border-radius:6px;border:1px solid var(--border-input);background:var(--bg-input);color:var(--text-muted);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">&times;</button>
      <div style="font-size:18px;font-weight:700;margin-bottom:4px;color:var(--text)">&#128218; R&eacute;cup&eacute;rer les URLs depuis Google Search Console</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Exporte la liste des pages qui rankent pour les coller directement dans l'outil.</div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${buildHelpSteps()}
      </div>
      <div style="margin-top:20px;padding:12px 16px;background:var(--bg-input);border-radius:8px;border:1px solid var(--border-input);font-size:11px;color:var(--text-muted);line-height:1.6;transition:background .3s,border-color .3s">
        <strong style="color:var(--text-sec)">&#128161; Astuce :</strong> Trie par <em>Impressions</em> d&eacute;croissantes avant d'exporter pour prioriser les pages les plus visibles. Tu peux aussi utiliser un export Screaming Frog ou Ahrefs si tu pr&eacute;f&egrave;res.
      </div>
    </div>
  </div>
</div>

<!-- Results tab -->
<div class="card" id="tab-results" style="display:none">
  <div class="progress-bar" id="progressBar" style="display:none"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
  <div class="stats" id="statsBar"></div>
  <div style="display:flex;gap:8px;margin-bottom:16px;justify-content:flex-end">
    <button class="btn-small" id="btnCSV" style="display:none">Export CSV</button>
    <button class="btn btn-green" id="btnRun" style="display:none">&#9654; Lancer les tests</button>
    <button class="btn btn-red" id="btnStop" style="display:none">&#9209; Stop</button>
  </div>
  <div style="overflow-x:auto">
    <table>
      <thead><tr>
        <th>#</th><th>Chemin</th><th>URL test&eacute;e</th><th>Status</th><th>Code</th><th>Hops</th><th>URL finale</th><th>ms</th>
      </tr></thead>
      <tbody id="resultsBody"></tbody>
    </table>
  </div>
</div>

<!-- /feature-redirect -->
</div>

<!-- Feature: PageSpeed Insights -->
<div id="feature-pagespeed" style="display:none">
<div class="card" id="tab-pagespeed">
  <!-- Phase 1: Domain input + Crawl -->
  <div id="psCrawlSection">
    <div class="ps-input-row">
      <div>
        <label class="label">&#127760; Domaine &agrave; explorer</label>
        <div class="domain-input-wrap">
          <img class="domain-fav" id="psDomainFav" src="" alt="">
          <input type="text" id="psDomain" placeholder="www.example.com" autocomplete="off">
          <div class="ac-dropdown" id="acPsDomain"></div>
        </div>
      </div>
      <button class="btn btn-primary" id="btnCrawl">&#128270; D&eacute;couvrir les pages</button>
    </div>
    <div id="psCrawlResults"></div>
  </div>

  <!-- Phase 2: Page list with controls -->
  <div id="psPageList" style="display:none">
    <div class="ps-controls-bar">
      <div class="ps-controls-left">
        <span class="ps-domain-label" id="psDomainLabel"></span>
        <span class="ps-page-count" id="psPageCount"></span>
      </div>
      <div class="ps-controls-right">
        <button class="btn-small" id="btnPsSelectAll">Tout s&eacute;lectionner</button>
        <button class="btn-small" id="btnPsDeselectAll">Tout d&eacute;s&eacute;lectionner</button>
        <div class="ps-strategy-toggle">
          <button class="ps-strategy-btn active" data-strategy="mobile">&#128241; Mobile</button>
          <button class="ps-strategy-btn" data-strategy="desktop">&#128187; Desktop</button>
        </div>
        <button class="btn btn-primary" id="btnPsAnalyze" style="padding:10px 20px;font-size:13px">&#9889; Analyser</button>
        <button class="btn btn-red" id="btnPsStop" style="display:none;padding:10px 20px;font-size:13px">&#9632; Stop</button>
      </div>
    </div>
    <div class="ps-progress-wrap" id="psProgressWrap" style="display:none">
      <div class="progress-bar"><div class="progress-fill" id="psProgressFill" style="width:0%"></div></div>
      <span class="ps-progress-text" id="psProgressText"></span>
    </div>
    <div id="psPageListBody"></div>
  </div>
</div>
<!-- /feature-pagespeed -->
</div>

<!-- Footer macaron -->
<a class="macaron" href="https://www.nocodefactory.fr" target="_blank" rel="noopener">
  ${MACARON_SVG}
  <span>Made by <strong style="color:var(--text)">NocodeFactory</strong></span>
</a>

${getClientScript()}
</body>
</html>`;
}

function buildHelpSteps() {
  const steps = [
    { num: 1, color: '#3b82f6', text: 'Ouvre <a href="https://search.google.com/search-console" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:underline">Google Search Console</a> et s&eacute;lectionne la propri&eacute;t&eacute; de l\'<strong>ancien domaine</strong>.' },
    { num: 2, color: '#3b82f6', text: 'Va dans <strong style="color:var(--text-sec)">&laquo; R&eacute;sultats de recherche &raquo;</strong> (menu gauche, section Performances).' },
    { num: 3, color: '#3b82f6', text: 'S&eacute;lectionne la p&eacute;riode maximale (16 mois) pour capturer toutes les pages qui ont rank&eacute;.' },
    { num: 4, color: '#3b82f6', text: 'En bas de page, clique sur l\'onglet <strong style="color:var(--text-sec)">&laquo; Pages &raquo;</strong> pour afficher la liste des URLs.' },
    { num: 5, color: '#3b82f6', text: 'Clique sur <strong style="color:var(--text-sec)">&laquo; Exporter &raquo;</strong> (ic&ocirc;ne en haut &agrave; droite du tableau) &rarr; choisis <strong>Google Sheets</strong> ou <strong>CSV</strong>.' },
    { num: 6, color: '#22c55e', text: 'Ouvre le fichier, <strong style="color:#22c55e">copie la colonne des URLs</strong>, et colle-la directement dans le champ ci-dessus. L\'outil se charge du reste !' },
  ];

  return steps.map(s => `
    <div style="display:flex;gap:12px;align-items:flex-start">
      <span style="min-width:28px;height:28px;border-radius:50%;background:${s.color}20;color:${s.color};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;flex-shrink:0">${s.num}</span>
      <div style="font-size:13px;color:var(--text);line-height:1.6">${s.text}</div>
    </div>`).join('');
}
