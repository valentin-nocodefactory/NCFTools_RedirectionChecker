export const styles = `
  :root {
    --bg: #0c0d10; --bg-card: #16181d; --bg-input: #0c0d10; --bg-hover: #1a1d24;
    --border: #1e2028; --border-input: #2a2d35;
    --text: #e2e8f0; --text-sec: #94a3b8; --text-muted: #64748b; --text-dim: #475569; --text-path: #8b9dc3;
    --scrollbar-track: #111318; --scrollbar-thumb: #2a2d35;
    --info-bg: #0c0d10; --info-border: #1e2028;
    --warn-bg: #1a1520; --warn-border: #2d2235; --warn-text: #a78bfa;
    --chain-bg: #0c0d10; --chain-border: #1e2028;
    --tab-active-bg: #16181d;
    --macaron-bg: #16181d; --macaron-border: #2a2d35; --macaron-text: #94a3b8;
    --glow-opacity: 1;
    --logo-fill: #e2e8f0; --logo-hole: #0c0d10;
    --badge-tag-bg: #22c55e20; --badge-tag-color: #22c55e;
  }

  body.light {
    --bg: #f1f5f9; --bg-card: #ffffff; --bg-input: #f8fafc; --bg-hover: #f1f5f9;
    --border: #e2e8f0; --border-input: #cbd5e1;
    --text: #1e293b; --text-sec: #475569; --text-muted: #64748b; --text-dim: #94a3b8; --text-path: #475569;
    --scrollbar-track: #f1f5f9; --scrollbar-thumb: #cbd5e1;
    --info-bg: #f8fafc; --info-border: #e2e8f0;
    --warn-bg: #fef9ee; --warn-border: #f59e0b40; --warn-text: #92400e;
    --chain-bg: #f8fafc; --chain-border: #e2e8f0;
    --tab-active-bg: #ffffff;
    --macaron-bg: #ffffff; --macaron-border: #e2e8f0; --macaron-text: #64748b;
    --glow-opacity: 0.7;
    --logo-fill: #1e293b; --logo-hole: #ffffff;
    --badge-tag-bg: #22c55e15; --badge-tag-color: #16a34a;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; padding: 24px; max-width: 1400px; margin: 0 auto; transition: background .3s, color .3s; overflow-x: hidden; }

  /* Animations */
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes glowShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes glowPulse { 0%,100%{opacity:var(--glow-opacity)} 50%{opacity:calc(var(--glow-opacity) * 0.6)} }
  @keyframes cardFadeIn { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
  ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }

  /* Card */
  .card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); padding: 20px; margin-bottom: 20px; transition: background .3s, border-color .3s; }
  .mono { font-family: 'JetBrains Mono', monospace; }

  /* Inputs */
  input[type="text"], textarea { width: 100%; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: 8px; color: var(--text); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: background .3s, border-color .3s, color .3s; }
  input[type="text"]:focus, textarea:focus { border-color: #3b82f6; }
  textarea { min-height: 200px; line-height: 1.8; font-size: 12px; resize: vertical; }
  .label { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em; }

  /* Buttons */
  .btn { padding: 12px 28px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; border: none; border-radius: 8px; cursor: pointer; transition: all .2s; }
  .btn-primary { background: #22c55e; color: #fff; }
  .btn-primary:hover { background: #16a34a; }
  .btn-green { background: #22c55e; color: #fff; }
  .btn-green:hover { background: #16a34a; }
  .btn-red { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
  .btn-small { padding: 8px 14px; font-size: 11px; background: var(--bg-input); color: var(--text-sec); border: 1px solid var(--border-input); border-radius: 6px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; transition: background .3s, border-color .3s, color .3s; }
  .btn:disabled { opacity: .4; cursor: default; }

  /* Domain row */
  .domain-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; }
  .domain-row > div { flex: 1; min-width: 240px; }
  .domain-arrow { display: flex; align-items: center; padding-bottom: 4px; font-size: 20px; color: var(--text-dim); }
  .domain-input-wrap { position: relative; }
  .domain-input-wrap input { padding-left: 34px; }
  .domain-fav { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; border-radius: 3px; opacity: 0; transition: opacity .3s; pointer-events: none; }
  .domain-fav.visible { opacity: .85; }
  .preview { margin-top: 12px; padding: 8px 14px; background: var(--bg-input); border-radius: 6px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); transition: background .3s; }

  /* Stats */
  .stats { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .stat-btn { padding: 10px 16px; border-radius: 8px; min-width: 85px; cursor: pointer; text-align: left; border: 1px solid var(--border); background: var(--bg-input); transition: background .3s, border-color .3s; }
  .stat-btn.active { border-color: var(--c); background: color-mix(in srgb, var(--c) 8%, transparent); }
  .stat-val { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .stat-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; font-weight: 600; }

  /* Table */
  table { width: 100%; border-collapse: collapse; }
  th { padding: 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-dim); border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 10px; font-size: 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
  tr:hover td { background: var(--bg-hover); }

  /* Badges */
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: .03em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
  .badge .dot { width: 7px; height: 7px; border-radius: 50%; }
  .badge-200 { background: #22c55e18; color: #22c55e; border: 1px solid #22c55e30; }
  .badge-301 { background: #f59e0b18; color: #f59e0b; border: 1px solid #f59e0b30; }
  .badge-chain { background: #ef444418; color: #ef4444; border: 1px solid #ef444430; }
  .badge-404 { background: #ef444418; color: #ef4444; border: 1px solid #ef444430; }
  .badge-err { background: #64748b18; color: #64748b; border: 1px solid #64748b30; }
  .badge-test { background: #3b82f618; color: #3b82f6; border: 1px solid #3b82f630; }
  .badge-test .dot { animation: pulse 1s infinite; }

  /* Chain detail */
  .chain-detail { margin-top: 8px; padding: 10px 12px; background: var(--chain-bg); border-radius: 6px; border: 1px solid var(--chain-border); transition: background .3s, border-color .3s; }
  .chain-hop { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 11px; font-family: 'JetBrains Mono', monospace; }
  .chain-hop .hop-num { color: var(--text-dim); min-width: 18px; }
  .chain-hop .hop-status { min-width: 36px; font-weight: 700; }

  /* URL copy button */
  .url-cell { position: relative; display: inline; }
  .url-copy { display: none; position: absolute; right: -2px; top: -2px; width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--border-input); background: var(--bg-card); color: var(--text-muted); cursor: pointer; font-size: 11px; align-items: center; justify-content: center; transition: all .15s; z-index: 2; }
  .url-copy:hover { background: #22c55e; color: #fff; border-color: #22c55e; }
  .url-copy.copied { background: #22c55e; color: #fff; border-color: #22c55e; }
  td:hover .url-copy { display: inline-flex; }
  .chain-hop:hover .hop-copy { display: inline-flex; }

  /* Progress bar */
  .progress-bar { height: 4px; background: var(--border); border-radius: 3px; margin-bottom: 20px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #FF0000, #FFC700, #45F6D7, #4643FF, #FF00D6); background-size: 200% 200%; animation: gradientMove 3s ease infinite; transition: width .3s; border-radius: 3px; }

  /* Tabs */
  .tab-row { display: flex; gap: 2px; margin-bottom: 20px; }
  .tab { padding: 10px 20px; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; border: none; border-radius: 8px 8px 0 0; cursor: pointer; background: transparent; color: var(--text-muted); border-bottom: 2px solid transparent; transition: all .2s; }
  .tab.active { background: var(--tab-active-bg); color: var(--text); border-bottom-color: #3b82f6; }

  /* Top glow bar */
  .top-glow-wrap { position: relative; z-index: 200; width: 100vw; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; margin-top: -24px; margin-bottom: 24px; }
  .top-glow-bar { height: 8px; background: linear-gradient(90deg, #FF0000, #FFC700, #45F6D7, #4643FF, #FF00D6, #FF0000); background-size: 300% 100%; animation: glowShift 12s linear infinite, glowPulse 8s ease-in-out infinite; opacity: var(--glow-opacity); cursor: pointer; position: relative; transition: height .3s; }
  .top-glow-wrap.open .top-glow-bar { height: 9px; }

  /* Glow tray */
  .top-glow-tray { max-height: 0; overflow: hidden; transition: max-height .5s cubic-bezier(.4,0,.2,1), opacity .4s, padding .5s; opacity: 0; background: linear-gradient(90deg, #FF0000, #FFC700, #45F6D7, #4643FF, #FF00D6, #FF0000); background-size: 300% 100%; animation: glowShift 12s linear infinite; padding: 0 24px; position: relative; }
  .top-glow-tray::before { content: ''; position: absolute; inset: 0; background: var(--bg); opacity: .78; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: opacity .3s; pointer-events: none; }
  body.light .top-glow-tray::before { opacity: .72; }
  .top-glow-wrap.open .top-glow-tray { max-height: 280px; opacity: 1; padding: 24px 24px 28px; }
  .top-glow-tray-inner { display: flex; flex-direction: column; align-items: center; gap: 16px; position: relative; z-index: 1; }
  .top-glow-wrap.open .tray-card { animation: cardFadeIn .4s ease-out both; }
  .top-glow-wrap.open .tray-card:nth-child(1) { animation-delay: .1s; }
  .top-glow-wrap.open .tray-card:nth-child(2) { animation-delay: .25s; }
  .top-glow-wrap.open .tray-card:nth-child(3) { animation-delay: .4s; }

  /* Tray cards */
  .tray-header { display: flex; align-items: center; gap: 10px; }
  .tray-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,255,255,.8); font-family: 'JetBrains Mono', monospace; }
  .tray-close { width: 28px; height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.15); backdrop-filter: blur(8px); color: #fff; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all .2s; }
  .tray-close:hover { background: rgba(255,255,255,.3); border-color: rgba(255,255,255,.5); }
  .tray-cards { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
  .tray-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 28px 14px; border-radius: 12px; background: rgba(255,255,255,.15); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.25); text-decoration: none; color: #fff; transition: border-color .25s, transform .25s, box-shadow .25s, background .25s; min-width: 160px; position: relative; opacity: 0; }
  .tray-card:hover { border-color: rgba(255,255,255,.5); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.2); background: rgba(255,255,255,.22); }
  .tray-card.active { border-color: rgba(255,255,255,.5); background: rgba(255,255,255,.22); }
  .tray-card-emoji { font-size: 28px; line-height: 1; }
  .tray-card-name { font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; color: #fff; }
  .tray-card-desc { font-size: 10px; color: rgba(255,255,255,.75); text-align: center; max-width: 140px; line-height: 1.4; }
  .tray-soon { position: absolute; top: 8px; right: 8px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: 2px 7px; border-radius: 4px; background: rgba(0,0,0,.3); color: #fff; border: 1px solid rgba(255,255,255,.2); font-family: 'JetBrains Mono', monospace; }

  /* Light mode overrides - tray */
  body.light .tray-label { color: rgba(0,0,0,.6); }
  body.light .tray-close { border-color: rgba(0,0,0,.15); background: rgba(0,0,0,.08); color: #1e293b; }
  body.light .tray-close:hover { background: rgba(0,0,0,.15); border-color: rgba(0,0,0,.25); }
  body.light .tray-card { background: rgba(255,255,255,.55); border-color: rgba(0,0,0,.1); color: #1e293b; }
  body.light .tray-card:hover { border-color: rgba(0,0,0,.2); background: rgba(255,255,255,.7); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  body.light .tray-card.active { border-color: rgba(0,0,0,.2); background: rgba(255,255,255,.7); }
  body.light .tray-card-name { color: #1e293b; }
  body.light .tray-card-desc { color: #475569; }
  body.light .tray-soon { background: rgba(0,0,0,.08); color: #92400e; border-color: rgba(0,0,0,.1); }

  /* Macaron (footer badge) */
  .macaron { position: fixed; bottom: 16px; right: 16px; display: flex; align-items: center; gap: 8px; padding: 8px 16px 8px 10px; background: var(--macaron-bg); border: 1px solid var(--macaron-border); border-radius: 50px; font-size: 12px; font-weight: 500; color: var(--macaron-text); text-decoration: none; transition: all .25s; box-shadow: 0 2px 12px rgba(0,0,0,.15); z-index: 100; }
  .macaron:hover { border-color: #22c55e; color: var(--text); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(34,197,94,.15); }
  .macaron-fill { fill: var(--logo-fill); transition: fill .3s; }
  .macaron-hole { fill: var(--logo-hole); transition: fill .3s; }

  /* Theme toggle */
  .theme-toggle { width: 56px; height: 28px; border-radius: 50px; border: 1px solid var(--border-input); background: var(--bg-input); cursor: pointer; position: relative; transition: all .4s cubic-bezier(.4,0,.2,1); flex-shrink: 0; padding: 0; overflow: hidden; }
  .theme-toggle::before { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #fbbf24); transition: all .4s cubic-bezier(.4,0,.2,1); box-shadow: 0 0 8px rgba(245,158,11,.4); z-index: 2; }
  body.light .theme-toggle::before { left: 31px; background: linear-gradient(135deg, #3b82f6, #60a5fa); box-shadow: 0 0 8px rgba(59,130,246,.4); }
  .theme-toggle::after { content: ''; position: absolute; top: 6px; right: 8px; width: 14px; height: 14px; border-radius: 50%; box-shadow: inset -3px -2px 0 0 var(--text-muted); transition: all .4s cubic-bezier(.4,0,.2,1); opacity: 1; }
  body.light .theme-toggle::after { opacity: 0; transform: rotate(90deg) scale(.5); }
  .toggle-sun { position: absolute; left: 7px; top: 50%; transform: translateY(-50%); font-size: 13px; opacity: 0; transition: all .4s cubic-bezier(.4,0,.2,1); }
  body.light .toggle-sun { opacity: 1; }
  .toggle-stars { position: absolute; right: 7px; top: 50%; transform: translateY(-50%); display: flex; gap: 2px; transition: all .4s cubic-bezier(.4,0,.2,1); opacity: 1; }
  .toggle-stars span { width: 2px; height: 2px; border-radius: 50%; background: var(--text-muted); }
  .toggle-stars span:nth-child(1) { width: 3px; height: 3px; opacity: .9; }
  .toggle-stars span:nth-child(2) { opacity: .5; margin-top: -4px; }
  .toggle-stars span:nth-child(3) { opacity: .7; margin-top: 2px; }
  body.light .toggle-stars { opacity: 0; transform: translateY(-50%) scale(.5); }
  .theme-toggle:hover { border-color: #3b82f6; }
  .theme-toggle:hover::before { transform: scale(1.08); }
  .theme-toggle:active::before { transform: scale(.92); }

  /* Logo paths */
  .logo-path-fill { fill: var(--logo-fill); transition: fill .3s; }
  .logo-path-hole { fill: var(--logo-hole); transition: fill .3s; }

  /* ── PageSpeed Insights ── */
  .ps-input-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 20px; }
  .ps-input-row > div:first-child { flex: 1; min-width: 240px; }
  .ps-strategy-toggle { display: flex; gap: 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-input); }
  .ps-strategy-btn { padding: 10px 18px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; border: none; cursor: pointer; background: var(--bg-input); color: var(--text-muted); transition: all .2s; }
  .ps-strategy-btn.active { background: #3b82f6; color: #fff; }
  .ps-strategy-btn:first-child { border-right: 1px solid var(--border-input); }

  .ps-scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 640px) { .ps-scores { grid-template-columns: repeat(2, 1fr); } }
  .ps-score-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 12px; transition: background .3s, border-color .3s; }
  .ps-gauge { position: relative; width: 96px; height: 96px; }
  .ps-gauge svg { width: 96px; height: 96px; transform: rotate(-90deg); }
  .ps-gauge-bg { fill: none; stroke: var(--border); stroke-width: 8; }
  .ps-gauge-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset .8s ease, stroke .3s; }
  .ps-gauge-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .ps-score-name { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; text-align: center; }

  .ps-metrics-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
  .ps-metrics-grid { display: flex; flex-direction: column; gap: 0; margin-bottom: 20px; }
  .ps-metric-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .ps-metric-row:last-child { border-bottom: none; }
  .ps-metric-row-v2 { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .ps-metric-row-v2:last-child { border-bottom: none; }
  .ps-metric-row-top { display: flex; align-items: center; gap: 10px; }
  .ps-metric-name { flex: 1; font-size: 12px; color: var(--text-sec); }
  .ps-metric-val { font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; min-width: 60px; text-align: right; }
  .ps-metric-points { font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 600; min-width: 50px; text-align: right; opacity: 0.8; }
  .ps-metric-badge { display: inline-block; width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .ps-metric-bar-wrap { position: relative; width: 100%; height: 8px; border-radius: 4px; overflow: visible; }
  .ps-metric-bar-bg { position: absolute; inset: 0; border-radius: 4px; opacity: 0.85; }
  .ps-metric-bar-marker { position: absolute; width: 3px; height: 16px; top: -4px; background: var(--text); border-radius: 2px; border: 1px solid rgba(0,0,0,.25); box-shadow: 0 1px 3px rgba(0,0,0,.3); z-index: 2; transition: left .6s ease; }
  .ps-metric-thresholds { position: relative; display: flex; justify-content: space-between; font-size: 9px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; margin-top: 4px; height: 12px; }
  .ps-metric-thresholds span { transform: translateX(-50%); white-space: nowrap; }
  .ps-metric-thresholds span:first-child { transform: none; }
  .ps-metric-thresholds span:last-child { transform: none; }

  /* ── Score breakdown tooltip ── */
  .ps-score-card-perf { position: relative; }
  .ps-score-tooltip { position: absolute; bottom: calc(100% + 12px); left: 50%; transform: translateX(-50%); background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; min-width: 280px; z-index: 100; opacity: 0; pointer-events: none; transition: opacity .2s; box-shadow: 0 4px 24px rgba(0,0,0,.35); }
  .ps-score-card-perf:hover .ps-score-tooltip { opacity: 1; pointer-events: auto; }
  .ps-tooltip-arrow { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 12px; height: 6px; overflow: hidden; }
  .ps-tooltip-arrow::after { content: ''; position: absolute; top: -6px; left: 0; width: 12px; height: 12px; background: var(--bg-card); border: 1px solid var(--border); transform: rotate(45deg); }
  .ps-tooltip-title { font-size: 11px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
  .ps-tooltip-row { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 11px; }
  .ps-tooltip-badge { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ps-tooltip-name { flex: 1; color: var(--text-sec); font-weight: 500; }
  .ps-tooltip-val { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 10px; min-width: 55px; text-align: right; }
  .ps-tooltip-weight { font-size: 9px; color: var(--text-dim); min-width: 28px; text-align: right; }
  .ps-tooltip-pts { font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 700; min-width: 40px; text-align: right; }
  .ps-tooltip-total { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 11px; font-weight: 700; color: var(--text); }
  .ps-tooltip-total-val { font-family: 'JetBrains Mono', monospace; font-size: 13px; }

  /* ── Image lightbox ── */
  .ps-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,.88); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer; animation: cardFadeIn .2s ease-out; }
  .ps-lightbox-img { max-width: 90vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 0 40px rgba(0,0,0,.5); }

  .ps-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 0; }
  .ps-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: #3b82f6; border-radius: 50%; animation: psSpin 1s linear infinite; }
  @keyframes psSpin { to { transform: rotate(360deg); } }
  .ps-loading-text { font-size: 13px; color: var(--text-muted); }

  .ps-error { padding: 16px; background: #ef444415; border: 1px solid #ef444430; border-radius: 8px; color: #ef4444; font-size: 13px; }
  .ps-empty { padding: 48px 0; text-align: center; color: var(--text-muted); font-size: 13px; }

  /* ── PageSpeed Crawl & Batch ── */
  .ps-controls-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .ps-controls-left { display: flex; align-items: center; gap: 10px; }
  .ps-controls-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ps-domain-label { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  .ps-page-count { font-size: 11px; color: var(--text-muted); }

  .ps-progress-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .ps-progress-wrap .progress-bar { flex: 1; margin-bottom: 0; }
  .ps-progress-text { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); white-space: nowrap; }

  .ps-page-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s; }
  .ps-page-row:hover { background: var(--bg-hover); }
  .ps-page-row:first-child { border-top: 1px solid var(--border); }
  .ps-page-row.ps-analyzing { background: #3b82f608; }
  .ps-page-check { flex-shrink: 0; display: flex; align-items: center; cursor: pointer; }
  .ps-page-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }
  .ps-page-path { flex: 1; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text-path); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .ps-page-done { font-size: 12px; color: #22c55e; flex-shrink: 0; }
  .ps-page-spinner { width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: #3b82f6; border-radius: 50%; animation: psSpin 1s linear infinite; flex-shrink: 0; }

  .ps-mini-scores { display: flex; gap: 6px; flex-shrink: 0; }
  .ps-mini-gauge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; font-size: 9px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--gauge-color); background: color-mix(in srgb, var(--gauge-color) 12%, transparent); border: 2px solid var(--gauge-color); flex-shrink: 0; }

  .ps-page-detail { padding: 20px; margin: 0 0 4px 0; background: var(--bg-input); border: 1px solid var(--border); border-top: none; border-radius: 0 0 8px 8px; animation: cardFadeIn .3s ease-out; }
  .ps-detail-inner { max-width: 100%; }

  /* ── Folder grouping ── */
  .ps-folder-header { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-input); border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s; }
  .ps-folder-header:hover { background: var(--bg-hover); }
  .ps-folder-header:first-child { border-top: 1px solid var(--border); }
  .ps-folder-chevron { font-size: 10px; color: var(--text-muted); transition: transform .2s; display: inline-block; width: 14px; text-align: center; flex-shrink: 0; }
  .ps-folder-chevron.open { transform: rotate(90deg); }
  .ps-folder-check { flex-shrink: 0; display: flex; align-items: center; cursor: pointer; }
  .ps-folder-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }
  .ps-folder-icon { font-size: 14px; flex-shrink: 0; }
  .ps-folder-name { font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
  .ps-folder-count { font-size: 11px; color: var(--text-muted); }
  .ps-folder-scores { margin-left: auto; }
  .ps-folder-body .ps-page-row { padding-left: 48px; }

  /* ── Recommendations ── */
  .ps-reco-title { font-size: 13px; font-weight: 700; color: var(--text); margin: 20px 0 12px; }
  .ps-reco-list { display: flex; flex-direction: column; gap: 0; }
  .ps-reco-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px; cursor: pointer; transition: background .15s; }
  .ps-reco-item:hover { background: var(--bg-hover); margin: 0 -8px; padding-left: 8px; padding-right: 8px; border-radius: 6px; }
  .ps-reco-expand { font-size: 8px; color: var(--text-muted); transition: transform .2s; display: inline-block; width: 12px; text-align: center; flex-shrink: 0; }
  .ps-reco-item.ps-reco-expanded .ps-reco-expand { transform: rotate(90deg); }
  .ps-reco-badge { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ps-reco-name { flex: 1; color: var(--text-sec); }
  .ps-reco-metrics { display: inline-flex; gap: 4px; margin-left: 8px; vertical-align: middle; flex-shrink: 0; }
  .ps-cwv-badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 700; color: #fff; letter-spacing: 0.3px; line-height: 16px; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
  .ps-reco-saving { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #ef4444; font-weight: 600; white-space: nowrap; }
  .ps-reco-detail-wrap { display: none; padding: 0 0 12px 22px; }
  .ps-reco-desc { font-size: 11px; color: var(--text-muted); line-height: 1.6; padding: 8px 0 4px 0; }
  .ps-reco-table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 8px 0 4px 0; }
  .ps-reco-table th { padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 700; color: var(--text-dim); border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: .05em; }
  .ps-reco-table td { padding: 5px 8px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-sec); border-bottom: 1px solid var(--border); vertical-align: top; }
  .ps-reco-table tr:last-child td { border-bottom: none; }
  .ps-reco-url { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Reco section count */
  .ps-reco-count { font-size: 11px; font-weight: 400; color: var(--text-muted); }

  /* Reco item count badge */
  .ps-reco-item-count { font-size: 10px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; white-space: nowrap; flex-shrink: 0; }

  /* Reco clickable links */
  .ps-reco-link { color: #3b82f6; text-decoration: none; word-break: break-all; }
  .ps-reco-link:hover { text-decoration: underline; }

  /* Reco code snippets */
  .ps-reco-snippet { display: inline-block; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; padding: 2px 6px; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-sec); max-width: 400px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; line-height: 1.5; margin: 2px 0; }

  /* Reco selector */
  .ps-reco-selector { display: block; font-size: 9px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; margin-top: 2px; word-break: break-all; }

  /* Reco node label */
  .ps-reco-node-label { display: block; font-size: 10px; color: var(--text-muted); margin-top: 1px; }

  /* Learn more link in reco descriptions */
  .ps-reco-learn-link { color: #3b82f6; text-decoration: none; font-weight: 600; }
  .ps-reco-learn-link:hover { text-decoration: underline; }

  /* Reco table wrap (scrollable) */
  .ps-reco-table-wrap { overflow-x: auto; max-width: 100%; margin: 8px 0 4px 0; }

  /* Numeric column alignment */
  .ps-reco-num-col { text-align: right; }
  .ps-reco-num-cell { text-align: right; white-space: nowrap; }

  /* URL cell */
  .ps-reco-url-cell { max-width: 350px; word-break: break-all; }

  /* Node cell */
  .ps-reco-node-cell { max-width: 400px; }

  /* Code cell */
  .ps-reco-code-cell { max-width: 350px; }

  /* Truncation notice */
  .ps-reco-truncated { font-size: 10px; color: var(--text-dim); padding: 6px 8px; font-style: italic; }

  /* Passed audits title */
  .ps-passed-title { font-size: 12px; color: var(--text-muted); margin: 16px 0 8px; padding: 8px 0; border-top: 1px solid var(--border); }

  /* Reco thumbnail */
  .ps-reco-thumb { width: 48px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); vertical-align: middle; cursor: pointer; transition: transform .2s, box-shadow .2s; }
  .ps-reco-thumb:hover { transform: scale(2); z-index: 10; box-shadow: 0 4px 16px rgba(0,0,0,.4); position: relative; }

  @media (max-width: 640px) {
    .ps-controls-bar { flex-direction: column; align-items: flex-start; }
    .ps-page-row { flex-wrap: wrap; }
    .ps-mini-scores { order: 3; width: 100%; margin-top: 4px; }
  }
`;
