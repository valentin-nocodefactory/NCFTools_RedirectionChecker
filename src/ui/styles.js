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
`;
