'use client'
import { useState, useRef } from "react";

const BLUE = "#1E90D4";
const GREEN = "#6DBE45";
const DARK = "#0A1520";
const MID = "#0F1E30";

const ACTORS = [
  { id: "TC",  label: "TradieCheck",     sub: "Platform",         x: 500, y: 360, r: 52, fill: BLUE,       textColor: "#fff",    ring: true },
  { id: "HO",  label: "Homeowner",       sub: "Consumer",         x: 160, y: 160, r: 38, fill: "#1A3A5C",  textColor: "#7EC8F0" },
  { id: "T",   label: "Tradie",          sub: "Verified",         x: 840, y: 160, r: 38, fill: "#1A3A1A",  textColor: GREEN },
  { id: "SC",  label: "Subcontractor",   sub: "Sub / Tradie",     x: 920, y: 400, r: 34, fill: "#1A2A1A",  textColor: "#9DE07A" },
  { id: "HC",  label: "Head Contractor", sub: "Builder / PM",     x: 840, y: 600, r: 36, fill: "#2A1A3A",  textColor: "#C09AE8" },
  { id: "D",   label: "Developer",       sub: "DevCheck",         x: 500, y: 680, r: 36, fill: "#2A1A1A",  textColor: "#F0956A" },
  { id: "S",   label: "Supplier",        sub: "Manufacturer",     x: 160, y: 600, r: 34, fill: "#1A2A3A",  textColor: "#7ABCDA" },
  { id: "L",   label: "Lender / Bank",   sub: "Risk Partner",     x: 80,  y: 400, r: 34, fill: "#2A2A1A",  textColor: "#E8D46A" },
  { id: "EQ",  label: "Equifax",         sub: "Credit Data",      x: 760, y: 40,  r: 28, fill: "#1E1E2A",  textColor: "#9090C0" },
  { id: "HN",  label: "HNRY",            sub: "Sole Trader Data", x: 500, y: 40,  r: 28, fill: "#1E1E2A",  textColor: "#9090C0" },
  { id: "IP",  label: "IPromise",        sub: "Escrow Partner",   x: 240, y: 40,  r: 28, fill: "#1E2A1A",  textColor: "#80B080" },
  { id: "PUR", label: "Purchaser",       sub: "Off-plan buyer",   x: 260, y: 720, r: 28, fill: "#1A1A2A",  textColor: "#A090D0" },
];

const PRODUCTS = [
  { id: "p_verify",   from: "T",   to: "TC",  label: "Verification",     color: GREEN,     dash: false, bi: false, phase: "1a",  desc: "Tradie subscribes ($60-$100/mo). Identity, credit (Equifax), financial ratios, insurance, licences. 3-pillar framework -> verified badge." },
  { id: "p_search",   from: "TC",  to: "HO",  label: "Verified Listing", color: BLUE,      dash: false, bi: false, phase: "1a",  desc: "Homeowner searches verified tradies. Free access. Lead generation included in tradie subscription -- HO posts job, tradie receives lead." },
  { id: "p_leads",    from: "HO",  to: "T",   label: "Job Leads",        color: "#4ABCE8", dash: true,  bi: false, phase: "1a",  desc: "Homeowner job posted -> matched to verified tradies. Bundled into tradie subscription. No separate charge." },
  { id: "p_wallet",   from: "HO",  to: "IP",  label: "TradieWallet",     color: "#F0C040", dash: false, bi: false, phase: "1a",  desc: "Homeowner deposits job funds into IPromise escrow. Released at milestones. TradieCheck earns 1% (capped $1K) via split disbursement. IPromise costs $10/transaction." },
  { id: "p_wallet2",  from: "IP",  to: "T",   label: "Milestone Release",color: "#F0C040", dash: false, bi: false, phase: "1a",  desc: "99% of milestone funds released to tradie. 1% (capped $1K) to TradieCheck. IPromise handles split disbursement." },
  { id: "p_suppvis",  from: "IP",  to: "S",   label: "Fund Visibility",  color: "#7ABCDA", dash: true,  bi: false, phase: "2",   desc: "Verified SupplierCheck subscriber sees ring-fenced TradieWallet funds before releasing special-order materials. Phase 2 only -- supplier must be a paying SupplierCheck subscriber." },
  { id: "p_protect",  from: "HO",  to: "TC",  label: "Client Protection",color: "#E86A6A", dash: true,  bi: false, phase: "1b",  desc: "Homeowner pays $5/month to follow a tradie. Financial health alerts triggered on adverse events. 50% of all jobs. ~1 month average duration." },
  { id: "p_eq",       from: "EQ",  to: "TC",  label: "Credit Report",    color: "#7070B0", dash: true,  bi: false, phase: "1a",  desc: "Equifax Standard Business Report per new tradie. $30/verification. Adverse event alerts ongoing. Core of the 90-point scoring system." },
  { id: "p_hn",       from: "HN",  to: "TC",  label: "Financial Data",   color: "#7070B0", dash: true,  bi: false, phase: "1a",  desc: "HNRY API -- consent-based sole trader financial data. Automates Path B1 onboarding. Replaces manual document review. Cost TBD (placeholder)." },
  { id: "p_subbie",   from: "HC",  to: "TC",  label: "SubbieCheck",      color: "#C09AE8", dash: false, bi: false, phase: "2",   desc: "Head contractor subscribes ($1,000 p.a.). Portal shows verified status of all subbies across projects. Invite function converts unverified subbies. Near-pure margin." },
  { id: "p_subbie2",  from: "TC",  to: "SC",  label: "Subbie Profile",   color: "#C09AE8", dash: false, bi: false, phase: "2",   desc: "Subcontractor's existing TradieCheck verification surfaced in SubbieCheck portal. No extra cost to subbie. Invite converts unverified subbies at zero CAC." },
  { id: "p_swallet",  from: "HC",  to: "IP",  label: "SubbieWallet",     color: "#E8A030", dash: false, bi: false, phase: "2",   desc: "HC ring-fences subcontract payments in IPromise escrow. 1% fee (capped $1K) minus $10 IPromise. Only on standalone B2B jobs -- no double-count with TradieWallet." },
  { id: "p_swallet2", from: "IP",  to: "SC",  label: "SC Release",       color: "#E8A030", dash: false, bi: false, phase: "2",   desc: "Subcontractor receives milestone payment from escrow. Confirmed fund visibility before mobilising. Paired with SubbieCheck for full assurance." },
  { id: "p_supcheck", from: "TC",  to: "S",   label: "SupplierCheck",    color: "#7ABCDA", dash: false, bi: true,  phase: "2",   desc: "Supplier pays $1,000 p.a. for verified status. Primary metric: order-book-to-working-capital ratio. Tradies verify suppliers before placing large orders." },
  { id: "p_dev",      from: "D",   to: "TC",  label: "Developer Suite",  color: "#F0956A", dash: false, bi: false, phase: "3",   desc: "Developer pays $5,000 p.a. Unlocks: DevCheck badge, SubbieCheck portal, ProjectWallet, ongoing monitoring. Targets 20/50/90 developers over 3 years." },
  { id: "p_pwallet",  from: "D",   to: "IP",  label: "ProjectWallet",    color: "#F07030", dash: false, bi: false, phase: "3",   desc: "Full project-scale escrow. D -> HC -> SC payment chain. $50K avg milestone, 50 milestones/project, 3 projects/developer. $490 net per release. Year 3: ~$6.6M revenue." },
  { id: "p_pwallet2", from: "IP",  to: "HC",  label: "HC Release",       color: "#F07030", dash: false, bi: false, phase: "3",   desc: "HC receives milestone funds from developer escrow. Full payment chain visibility. Built on SubbieWallet infrastructure at project scale." },
  { id: "p_devcheck", from: "PUR", to: "TC",  label: "DevCheck Lookup",  color: "#A090D0", dash: false, bi: false, phase: "3",   desc: "Purchaser pays $200 per report to check a developer before committing an off-plan deposit. 20% lookup rate, 15 units per project. Self-serve." },
  { id: "p_lender",   from: "L",   to: "TC",  label: "Lender Integration",color: "#E8D46A",dash: true,  bi: false, phase: "TBD", desc: "PLACEHOLDER -- $0 until live conversation. Enterprise API licence. TradieCheck as drawdown condition within lender funding frameworks." },
];

const PHASE_COLORS = {
  "1a":  { color: GREEN,     label: "Phase 1a -- Wellington launch" },
  "1b":  { color: "#3AAF6E", label: "Phase 1b -- National rollout" },
  "2":   { color: BLUE,      label: "Phase 2 -- B2B extensions" },
  "3":   { color: "#F0956A", label: "Phase 3 -- Development market" },
  "TBD": { color: "#64748B", label: "TBD -- Placeholder" },
};

const FONT = "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif";

function getActor(id) { return ACTORS.find(a => a.id === id); }

function calcArrow(from, to, offset = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const px = -uy * offset;
  const py = ux * offset;
  return {
    startX: from.x + ux * from.r + px,
    startY: from.y + uy * from.r + py,
    endX:   to.x - ux * to.r + px,
    endY:   to.y - uy * to.r + py,
    midX:  (from.x + ux * from.r + px + to.x - ux * to.r + px) / 2,
    midY:  (from.y + uy * from.r + py + to.y - uy * to.r + py) / 2,
  };
}

function assignOffsets(products) {
  const groups = {};
  products.forEach(p => {
    const key = [p.from, p.to].sort().join("_");
    if (!groups[key]) groups[key] = [];
    groups[key].push(p.id);
  });
  const offsets = {};
  products.forEach(p => {
    const key = [p.from, p.to].sort().join("_");
    const group = groups[key];
    const idx = group.indexOf(p.id);
    offsets[p.id] = (idx - (group.length - 1) / 2) * 12;
  });
  return offsets;
}

export default function EcosystemDiagram() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [activePhase, setActivePhase] = useState(null);
  const svgRef = useRef(null);
  const offsets = assignOffsets(PRODUCTS);

  const isVisible     = (p) => !activePhase || p.phase === activePhase;
  const isHighlighted = (p) => activeProduct === p.id;
  const isFaded       = (p) => (activeProduct && p.id !== activeProduct) || (activePhase && p.phase !== activePhase);
  const activeP       = activeProduct ? PRODUCTS.find(p => p.id === activeProduct) : null;

  return (
    <div style={{ fontFamily: FONT, background: DARK, minHeight: "100vh", color: "#C8DCF0", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${BLUE}30`, background: "#FFFFFF", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>

        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/TradieCheckLogo_transparent.png"
            alt="TradieCheck"
            style={{ width: 160, height: 48, objectFit: "contain" }}
          />
          <div style={{ borderLeft: `1px solid ${BLUE}40`, paddingLeft: 16 }}>
            <div style={{ fontSize: 11, color: "#6B8FAF", letterSpacing: 0.5, marginBottom: 2 }}>Internal Reference</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>Product Ecosystem Map</div>
          </div>
        </div>

        {/* Phase filters */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(PHASE_COLORS).map(([k, v]) => (
            <button key={k} onClick={() => setActivePhase(activePhase === k ? null : k)} style={{
              background: activePhase && activePhase !== k ? v.color + "99" : v.color, border: "1px solid #fff", color: "#fff", opacity: activePhase && activePhase !== k ? 0.45 : 1,
              borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
              letterSpacing: 0.3, fontFamily: FONT, transition: "all 0.15s",
            }}>{v.label}</button>
          ))}
          {(activePhase || activeProduct) && (
            <button onClick={() => { setActivePhase(null); setActiveProduct(null); }} style={{
              background: "transparent", border: "1px solid #334", color: "#667",
              borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: FONT,
            }}>Clear x</button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>

        {/* SVG canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <svg ref={svgRef} viewBox="0 0 1000 760" style={{ width: "100%", height: "100%", minHeight: 500 }}>
            <defs>
              {PRODUCTS.map(p => (
                <marker key={`arrow-${p.id}`} id={`arrow-${p.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={isFaded(p) ? p.color + "20" : isHighlighted(p) ? p.color : p.color + "90"} />
                </marker>
              ))}
              {PRODUCTS.filter(p => p.bi).map(p => (
                <marker key={`arrow-back-${p.id}`} id={`arrow-back-${p.id}`} markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto-start-reverse">
                  <path d="M0,0 L0,6 L8,3 z" fill={isFaded(p) ? p.color + "20" : isHighlighted(p) ? p.color : p.color + "90"} />
                </marker>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {[200,400,600,800].map(x => <line key={`vg${x}`} x1={x} y1={0} x2={x} y2={760} stroke="#ffffff05" strokeWidth={1}/>)}
            {[150,300,450,600,750].map(y => <line key={`hg${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="#ffffff05" strokeWidth={1}/>)}

            {/* Edges */}
            {PRODUCTS.map(p => {
              if (!isVisible(p)) return null;
              const from = getActor(p.from);
              const to   = getActor(p.to);
              if (!from || !to) return null;
              const { startX, startY, endX, endY, midX, midY } = calcArrow(from, to, offsets[p.id] || 0);
              const faded = isFaded(p);
              const highlighted = isHighlighted(p);
              const opacity = faded ? 0.12 : highlighted ? 1 : 0.65;
              return (
                <g key={p.id} style={{ cursor: "pointer" }} onClick={() => setActiveProduct(activeProduct === p.id ? null : p.id)}>
                  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={p.color} strokeWidth={highlighted ? 2.5 : 1.5} strokeDasharray={p.dash ? "5,4" : "none"} strokeOpacity={opacity} markerEnd={`url(#arrow-${p.id})`} markerStart={p.bi ? `url(#arrow-back-${p.id})` : "none"} filter={highlighted ? "url(#glow)" : "none"}/>
                  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="transparent" strokeWidth={12}/>
                  <text x={midX} y={midY - 5} textAnchor="middle" fontSize={highlighted ? 9 : 8} fill={p.color} fillOpacity={faded ? 0.1 : highlighted ? 1 : 0.7} style={{ pointerEvents: "none", fontFamily: FONT }}>{p.label}</text>
                </g>
              );
            })}

            {/* Actor nodes */}
            {ACTORS.map(a => {
              const related = PRODUCTS.filter(p => p.from === a.id || p.to === a.id);
              const isActive = activeProduct && related.some(p => p.id === activeProduct);
              const isPhaseActive = activePhase && related.some(p => p.phase === activePhase);
              return (
                <g key={a.id}>
                  {a.ring && <circle cx={a.x} cy={a.y} r={a.r + 8} fill="none" stroke={BLUE} strokeWidth={1} strokeOpacity={0.3} strokeDasharray="4,4"/>}
                  {(isActive || isPhaseActive) && <circle cx={a.x} cy={a.y} r={a.r + 4} fill={a.fill} fillOpacity={0.3} filter="url(#glow)"/>}
                  <circle cx={a.x} cy={a.y} r={a.r} fill={a.fill} stroke={isActive || isPhaseActive ? a.textColor : a.textColor + "40"} strokeWidth={isActive || isPhaseActive ? 1.5 : 1}/>
                  <text x={a.x} y={a.y - (a.sub ? 6 : 0)} textAnchor="middle" fontSize={a.r > 36 ? 11 : 9} fontWeight="700" fill={a.textColor} style={{ pointerEvents: "none", fontFamily: FONT }}>{a.label}</text>
                  {a.sub && <text x={a.x} y={a.y + 10} textAnchor="middle" fontSize={8} fill={a.textColor} fillOpacity={0.6} style={{ pointerEvents: "none", fontFamily: FONT }}>{a.sub}</text>}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div style={{ width: 280, background: "#0F1E30", borderLeft: "1px solid #1A3050", padding: "20px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, fontFamily: FONT }}>
          {activeP ? (
            <>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: PHASE_COLORS[activeP.phase]?.color || "#64748B", marginBottom: 4 }}>
                  {PHASE_COLORS[activeP.phase]?.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: activeP.color, marginBottom: 4 }}>{activeP.label}</div>
                <div style={{ fontSize: 11, color: "#6B8FAF", marginBottom: 12 }}>
                  {getActor(activeP.from)?.label} &rarr; {getActor(activeP.to)?.label}{activeP.bi && " \u2194"}
                </div>
                <p style={{ fontSize: 13, color: "#9BB5CC", lineHeight: 1.7, margin: 0 }}>{activeP.desc}</p>
              </div>
              <button onClick={() => setActiveProduct(null)} style={{ marginTop: "auto", background: "transparent", border: "1px solid #1E3A5A", color: "#4A7090", borderRadius: 6, padding: "8px", fontSize: 12, cursor: "pointer", fontFamily: FONT }}>
                Close x
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 10, color: "#3A6080", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>How to use</div>
              <p style={{ fontSize: 13, color: "#4A7090", lineHeight: 1.7, margin: 0 }}>
                Click any <span style={{ color: "#9BB5CC" }}>connection line</span> to see product details.
              </p>
              <p style={{ fontSize: 13, color: "#4A7090", lineHeight: 1.7, margin: 0 }}>
                Use the <span style={{ color: "#9BB5CC" }}>phase filters</span> above to isolate products by launch phase.
              </p>
              <div style={{ borderTop: "1px solid #1A3050", paddingTop: 14, marginTop: 4 }}>
                <div style={{ fontSize: 10, color: "#3A6080", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Line types</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width={40} height={12}><defs><marker id="la" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#9BB5CC"/></marker></defs><line x1={0} y1={6} x2={36} y2={6} stroke="#9BB5CC" strokeWidth={2} markerEnd="url(#la)"/></svg>
                    <span style={{ fontSize: 12, color: "#6B8FAF" }}>Product / money flow</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width={40} height={12}><line x1={0} y1={6} x2={36} y2={6} stroke="#9BB5CC" strokeWidth={2} strokeDasharray="5,4"/></svg>
                    <span style={{ fontSize: 12, color: "#6B8FAF" }}>Data / information flow</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width={40} height={12}><line x1={0} y1={6} x2={36} y2={6} stroke="#9BB5CC" strokeWidth={2}/><circle cx={0} cy={6} r={3} fill="#9BB5CC"/><circle cx={36} cy={6} r={3} fill="#9BB5CC"/></svg>
                    <span style={{ fontSize: 12, color: "#6B8FAF" }}>Bidirectional</span>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #1A3050", paddingTop: 14 }}>
                <div style={{ fontSize: 10, color: "#3A6080", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Actors</div>
                {ACTORS.map(a => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.fill, border: `1px solid ${a.textColor}60`, flexShrink: 0 }}/>
                    <span style={{ fontSize: 12, color: a.textColor + "CC" }}>{a.label}</span>
                    <span style={{ fontSize: 11, color: "#2A4A6A", marginLeft: "auto" }}>{a.sub}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


