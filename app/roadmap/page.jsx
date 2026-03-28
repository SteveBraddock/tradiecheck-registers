'use client';

import PageHeader from '../components/PageHeader';

const COLORS = {
  homeowner:   { bg: '#0F2A1A', border: '#1E5C30', accent: '#6DBE45', label: 'Homeowner market' },
  development: { bg: '#1A0F2A', border: '#3A1E5C', accent: '#9B6FD4', label: 'Development market' },
  lender:      { bg: '#0A1A2A', border: '#1E3A5C', accent: '#1E90D4', label: 'Lender / financial' },
  strategic:   { bg: '#2A1A0A', border: '#5C3A1E', accent: '#E87722', label: 'New strategic direction' },
};

const PHASE_COLS = [
  { id: 'p1w', phase: 1, sub: 'Wellington', period: 'Apr – Jul' },
  { id: 'p1n', phase: 1, sub: 'National',   period: 'Jul – Dec' },
  { id: 'p2',  phase: 2, sub: null,          period: 'H1 2027' },
  { id: 'p3',  phase: 3, sub: null,          period: 'H2 2027–H1 2028' },
  { id: 'p4',  phase: 4, sub: null,          period: '2028+' },
];

const CARDS = [
  { id: 'tc-welly',    col: 'p1w', lane: 'homeowner',   type: 'homeowner',   title: 'TradieCheck',                 body: '480 founding members, Wellington only' },
  { id: 'tw-welly',    col: 'p1w', lane: 'homeowner',   type: 'homeowner',   title: 'TradieWallet',                body: 'Beta launch, supplier fund visibility live' },
  { id: 'tc-national', col: 'p1n', lane: 'homeowner',   type: 'homeowner',   title: 'TradieCheck',                 body: 'Auckland + Christchurch rollout' },
  { id: 'tw-national', col: 'p1n', lane: 'homeowner',   type: 'homeowner',   title: 'TradieWallet',                body: 'Full national rollout' },
  { id: 'sc-p2',       col: 'p2',  lane: 'homeowner',   type: 'homeowner',   title: 'SupplierCheck',               body: 'Supplier verification, order-book ratio analysis' },
  { id: 'au-p3',       col: 'p3',  lane: 'homeowner',   type: 'homeowner',   title: 'AU expansion',                body: 'Core platform + TradieWallet', ghost: true },
  { id: 'au-p4',       col: 'p4',  lane: 'homeowner',   type: 'homeowner',   title: 'AU scale',                    body: '', ghost: true },
  { id: 'arch-welly',  col: 'p1w', lane: 'development', type: 'development', title: 'Architecture prep',           body: 'DB schema + API', ghost: true },
  { id: 'arch-nat',    col: 'p1n', lane: 'development', type: 'development', title: 'Architecture prep',           body: 'continued', ghost: true },
  { id: 'sw-p2',       col: 'p2',  lane: 'development', type: 'development', title: 'SubbieWallet',                body: 'HC-to-SC milestone escrow' },
  { id: 'sc-dev-p2',   col: 'p2',  lane: 'development', type: 'development', title: 'SubbieCheck',                 body: 'Developer portal, near-pure margin' },
  { id: 'pw-p3',       col: 'p3',  lane: 'development', type: 'development', title: 'ProjectWallet',               body: 'Full D-to-HC-to-SC escrow at dev scale' },
  { id: 'dc-p3',       col: 'p3',  lane: 'development', type: 'development', title: 'DevCheck',                    body: 'Developer verification (consumer + lender B2B)' },
  { id: 'fly-p4',      col: 'p4',  lane: 'development', type: 'development', title: 'Data flywheel mature',        body: '', ghost: true },
  { id: 'lp-p3',       col: 'p3',  lane: 'lender',      type: 'lender',      title: 'Lender Partnership',          body: 'TradieCheck as a funding covenant condition', isNew: true },
  { id: 'int-p3',      col: 'p3',  lane: 'lender',      type: 'lender',      title: '3 integration options',       body: 'Contractor / project / risk-based' },
  { id: 'sci-p4',      col: 'p4',  lane: 'lender',      type: 'lender',      title: 'Supplier Credit Intelligence', body: 'Financial health data subscriptions' },
  { id: 'paf-p4',      col: 'p4',  lane: 'lender',      type: 'lender',      title: 'Full PAF',                    body: 'Embedded lender framework, full lifecycle' },
];

const LANES = [
  { id: 'homeowner',   label: 'Home-\nowner',       color: COLORS.homeowner },
  { id: 'development', label: 'Develop-\nment',      color: COLORS.development },
  { id: 'lender',      label: 'Lender /\nfinancial', color: COLORS.lender },
];

function Card({ card }) {
  const color = COLORS[card.type];
  return (
    <div style={{
      background: card.ghost ? 'transparent' : color.bg,
      border: `1px solid ${card.ghost ? color.border + '50' : color.border}`,
      borderRadius: 8, padding: '8px 10px', marginBottom: 6,
      opacity: card.ghost ? 0.65 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: card.body ? 3 : 0 }}>
        {card.isNew && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: COLORS.strategic.accent, color: '#fff', borderRadius: 3, letterSpacing: '0.04em' }}>NEW</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: card.ghost ? color.accent + '99' : color.accent }}>{card.title}</span>
      </div>
      {card.body ? (
        <div style={{ fontSize: 11, color: card.ghost ? '#6A8AA0' : '#FFFFFF', lineHeight: 1.4 }}>{card.body}</div>
      ) : null}
    </div>
  );
}

export default function Roadmap() {
  const cardsByLaneAndCol = {};
  LANES.forEach(l => {
    cardsByLaneAndCol[l.id] = {};
    PHASE_COLS.forEach(c => { cardsByLaneAndCol[l.id][c.id] = []; });
  });
  CARDS.forEach(card => {
    if (cardsByLaneAndCol[card.lane]?.[card.col] !== undefined) {
      cardsByLaneAndCol[card.lane][card.col].push(card);
    }
  });

  const COL_W = 180;
  const LANE_LABEL_W = 70;
  const colStyle = (dim) => ({
    width: COL_W, flexShrink: 0,
    background: dim ? '#080C12' : '#0A0E14',
    border: `1px solid ${dim ? '#10181E' : '#141E2A'}`,
    borderRadius: 6, padding: '8px 8px 4px',
  });

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", minHeight: '100vh', background: '#080E16', color: '#E0EAF4' }}>

      <PageHeader title="Product Roadmap" subtitle="Internal Reference" />

      <div style={{ padding: '20px 28px 40px' }}>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(COLORS).map(([key, c]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c.accent }} />
              <span style={{ fontSize: 11, color: '#8899AA' }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Phase header row */}
        <div style={{ display: 'flex', marginBottom: 0 }}>
          <div style={{ width: LANE_LABEL_W, flexShrink: 0 }} />
          <div style={{ width: COL_W * 2 + 8, flexShrink: 0, marginRight: 6, background: '#0E1E30', border: '1px solid #1A3A5A', borderRadius: '8px 8px 0 0', padding: '10px 14px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#E0EAF4' }}>Phase 1 · Apr – Dec 2026</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', background: '#6DBE45', color: '#0A1A06', borderRadius: 10, letterSpacing: '0.05em' }}>CURRENT</span>
            </div>
          </div>
          {[
            { label: 'Phase 2', period: 'H1 2027', dim: false },
            { label: 'Phase 3', period: 'H2 2027–H1 2028', dim: false },
            { label: 'Phase 4', period: '2028+', dim: true },
          ].map((p, i) => (
            <div key={i} style={{ width: COL_W, flexShrink: 0, marginRight: i < 2 ? 6 : 0, background: p.dim ? '#0A0E14' : '#0E1E30', border: `1px solid ${p.dim ? '#141E2A' : '#1A3A5A'}`, borderRadius: '8px 8px 0 0', padding: '10px 14px 8px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: p.dim ? '#4A6A8A' : '#E0EAF4', marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: '#4A6A8A' }}>{p.period}</div>
            </div>
          ))}
        </div>

        {/* Sub-phase row */}
        <div style={{ display: 'flex', marginBottom: 6 }}>
          <div style={{ width: LANE_LABEL_W, flexShrink: 0 }} />
          {[{ id: 'p1w', label: 'Wellington', period: 'Apr – Jul' }, { id: 'p1n', label: 'National', period: 'Jul – Dec' }].map((s) => (
            <div key={s.id} style={{ width: COL_W, flexShrink: 0, marginRight: 8, background: '#0A1828', border: '1px solid #1A3A5A', borderTop: 'none', padding: '5px 14px 6px' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7ABADC' }}>{s.label}</span>
              <span style={{ fontSize: 11, color: '#4A6A8A', marginLeft: 6 }}>{s.period}</span>
            </div>
          ))}
          {['p2', 'p3', 'p4'].map((id, i) => (
            <div key={id} style={{ width: COL_W, flexShrink: 0, marginRight: i < 2 ? 6 : 0 }} />
          ))}
        </div>

        {/* Lanes */}
        {LANES.map(lane => (
          <div key={lane.id} style={{ display: 'flex', marginBottom: 6, minHeight: 80 }}>
            <div style={{ width: LANE_LABEL_W, flexShrink: 0, display: 'flex', alignItems: 'flex-start', paddingTop: 10, paddingRight: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 3, alignSelf: 'stretch', minHeight: 40, background: lane.color.accent + '60', borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: lane.color.accent, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{lane.label}</span>
              </div>
            </div>
            <div style={{ ...colStyle(false), marginRight: 8 }}>{cardsByLaneAndCol[lane.id]['p1w'].map(c => <Card key={c.id} card={c} />)}</div>
            <div style={{ ...colStyle(false), marginRight: 6 }}>{cardsByLaneAndCol[lane.id]['p1n'].map(c => <Card key={c.id} card={c} />)}</div>
            <div style={{ ...colStyle(false), marginRight: 6 }}>{cardsByLaneAndCol[lane.id]['p2'].map(c => <Card key={c.id} card={c} />)}</div>
            <div style={{ ...colStyle(false), marginRight: 6 }}>{cardsByLaneAndCol[lane.id]['p3'].map(c => <Card key={c.id} card={c} />)}</div>
            <div style={{ ...colStyle(true) }}>{cardsByLaneAndCol[lane.id]['p4'].map(c => <Card key={c.id} card={c} />)}</div>
          </div>
        ))}

        {/* Key sequencing rule */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#0A1420', border: '1px solid #1A2A3A', borderRadius: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7ABADC', marginRight: 8 }}>Key sequencing rule:</span>
          <span style={{ fontSize: 11, color: '#6A8AA0', lineHeight: 1.5 }}>
            Phase 1 spans Apr–Dec 2026 — Wellington founding member launch (Apr–Jul) then national rollout (Jul–Dec). Phase 2 adds the B2B layer. ProjectWallet scales SubbieWallet to full development projects in Phase 3.
          </span>
        </div>
      </div>
    </div>
  );
}
