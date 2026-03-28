'use client';

import { useState } from 'react';

const COLORS = {
  homeowner:   { bg: '#0F2A1A', border: '#1E5C30', accent: '#6DBE45', label: 'Homeowner market' },
  development: { bg: '#1A0F2A', border: '#3A1E5C', accent: '#9B6FD4', label: 'Development market' },
  lender:      { bg: '#0A1A2A', border: '#1E3A5C', accent: '#1E90D4', label: 'Lender / financial' },
  strategic:   { bg: '#2A1A0A', border: '#5C3A1E', accent: '#E87722', label: 'New strategic direction' },
};

const PRODUCT_DETAIL = {
  'tc-welly': {
    title: 'TradieCheck — Wellington Launch',
    phase: 'Phase 1a · Apr – Jul 2026',
    who: 'Tradies · Homeowners',
    description: 'Verified credential launched to 480 founding members in Wellington. Tradies pay an annual subscription to be verified across three pillars: identity & legitimacy, financial health, and reputation. Homeowners access the verified marketplace for free and can search, compare, and hire with confidence.',
    revenue: 'Tradie subscription (tiered). Homeowner access free by design.',
    dependency: 'Dentons regulatory opinion. IPromise escrow integration live.',
  },
  'tw-welly': {
    title: 'TradieWallet — Beta Launch',
    phase: 'Phase 1a · Apr – Jul 2026',
    who: 'Homeowners · Tradies · Suppliers',
    description: 'Milestone-based escrow in beta with the Wellington tradie cohort. Homeowners deposit job funds into IPromise escrow; funds are released to the tradie at agreed milestones. Suppliers receive visibility of ring-fenced funds before releasing special-order materials — reducing credit risk without requiring a separate product.',
    revenue: '1% fee per transaction (capped $1,000), collected via split disbursement at source. Net ~$490 after IPromise cost.',
    dependency: 'IPromise white-label integration confirmed.',
  },
  'tc-national': {
    title: 'TradieCheck — National Rollout',
    phase: 'Phase 1b · Jul – Dec 2026',
    who: 'Tradies · Homeowners',
    description: 'Expansion to Auckland and Christchurch following Wellington validation. Same three-pillar verification credential. Territory Representatives drive tradie acquisition in each region. The verified marketplace deepens as tradie supply grows nationally.',
    revenue: 'Tradie subscription revenue scales with verified tradie count.',
    dependency: 'Wellington launch validated. Territory Reps engaged.',
  },
  'tw-national': {
    title: 'TradieWallet — Full National Rollout',
    phase: 'Phase 1b · Jul – Dec 2026',
    who: 'Homeowners · Tradies · Suppliers',
    description: 'Full national rollout of TradieWallet following Wellington beta validation. Escrow infrastructure and supplier fund visibility operating at scale across all regions. Volume drives fee revenue; individual jobs generate 1% per milestone release.',
    revenue: '1% per milestone release (capped $1,000). Scales with transaction volume.',
    dependency: 'Wellington beta complete. IPromise partnership confirmed.',
  },
  'sc-p2': {
    title: 'SupplierCheck',
    phase: 'Phase 2 · H1 2027',
    who: 'Suppliers · Tradies · Head Contractors',
    description: 'Standalone verification for manufacturers and specialist suppliers. Primary metric is the order-book-to-working-capital ratio — can the supplier fulfil committed orders without overextending? Tradies and head contractors verify supplier financial stability before placing large orders. Suppliers demonstrate creditworthiness to trading partners. Escrow-protected deposits via TradieWallet become standard commercial terms.',
    revenue: '$1,000 p.a. per verified supplier.',
    dependency: 'Core platform operational with meaningful tradie base.',
  },
  'au-p3': {
    title: 'AU Expansion',
    phase: 'Phase 3 · H2 2027–H1 2028',
    who: 'Tradies · Homeowners',
    description: 'Extension of the core TradieCheck platform and TradieWallet into the Australian market. Australian escrow partner confirmed (TwoHold or Escrow.com). HNRY API partnership provides consent-based sole trader financial data to automate Path B onboarding in the AU market.',
    revenue: 'Same subscription and escrow fee model as NZ.',
    dependency: 'AU escrow partner confirmed. HNRY API integration live. Consumer Data Right compliance.',
  },
  'au-p4': {
    title: 'AU Scale',
    phase: 'Phase 4 · 2028+',
    who: 'Tradies · Homeowners · Developers',
    description: 'Full Australian market maturity. Core platform, TradieWallet, and development market products operating at scale across AU. Data flywheel generating meaningful financial health insights across both markets.',
    revenue: 'Full product suite revenue across AU market.',
    dependency: 'AU Phase 3 validated.',
  },
  'arch-welly': {
    title: 'Architecture Prep — Wellington',
    phase: 'Phase 1a · Apr – Jul 2026',
    who: 'Internal',
    description: 'Database schema design and API architecture for the development market product suite. SubbieCheck, SubbieWallet, ProjectWallet, and DevCheck are scoped and architected in parallel with the Phase 1 core platform build. No user-facing product. Building the foundation so Phase 2 products can be launched without a costly schema migration.',
    revenue: 'No direct revenue — enables Phase 2.',
    dependency: 'Mike Gollop CTO engagement confirmed.',
  },
  'arch-nat': {
    title: 'Architecture Prep — Continued',
    phase: 'Phase 1b · Jul – Dec 2026',
    who: 'Internal',
    description: 'Continued development market architecture work during national rollout phase. API design for SubbieCheck portal, SubbieWallet escrow integration, and ProjectWallet payment chain. Positions the platform for a fast Phase 2 build once core platform is validated.',
    revenue: 'No direct revenue — enables Phase 2.',
    dependency: 'Phase 1a architecture foundation complete.',
  },
  'sw-p2': {
    title: 'SubbieWallet',
    phase: 'Phase 2 · H1 2027',
    who: 'Head Contractors · Subcontractors',
    description: 'TradieWallet adapted for the HC-to-SC payment chain. Head contractors ring-fence subcontract payments in IPromise escrow at each milestone. Subcontractors receive confirmed fund visibility before mobilising — reducing the risk of working without payment assurance. Paired with SubbieCheck for full subcontractor assurance: verified identity plus protected payment.',
    revenue: '1% per milestone release (capped $1,000). Only on standalone B2B jobs — no double-count with TradieWallet.',
    dependency: 'SubbieCheck portal live. IPromise B2B escrow terms confirmed.',
  },
  'sc-dev-p2': {
    title: 'SubbieCheck',
    phase: 'Phase 2 · H1 2027',
    who: 'Head Contractors · Developers · Subcontractors',
    description: 'Developer portal providing head contractors and developers with a project-level view of existing verified TradieCheck tradies operating as subcontractors. No new verification build required — subcontractor data already exists on the core platform. The portal invite function converts unverified subcontractors into new tradie acquisitions at zero CAC. Near-pure margin product.',
    revenue: '$1,000 p.a. per head contractor/developer. Near-pure margin.',
    dependency: 'Core platform with 500+ verified tradies. SubbieCheck portal build complete.',
  },
  'pw-p3': {
    title: 'ProjectWallet',
    phase: 'Phase 3 · H2 2027–H1 2028',
    who: 'Developers · Head Contractors · Subcontractors',
    description: 'Full development-scale escrow for the entire Developer-to-HC-to-SC payment chain. Milestone funds are ring-fenced, released on certified completion, and visible to all parties. Built on SubbieWallet infrastructure at project scale. A single 20-unit townhouse development may generate 100–200+ milestone releases. TradieCheck earns 1% per release.',
    revenue: '$500–$1,000 per milestone release. Single project: $50K–$200K in escrow fees.',
    dependency: 'SubbieWallet validated. Australian escrow partner confirmed.',
  },
  'dc-p3': {
    title: 'DevCheck',
    phase: 'Phase 3 · H2 2027–H1 2028',
    who: 'Purchasers · Lenders',
    description: 'Verification of the developer entity covering corporate structure, SPV financial health, project completion track record, current exposure across active developments, and director history. Dual positioning: consumer protection (purchasers check developers before committing off-the-plan deposits) and B2B lender tool (lenders assess developer completion risk before advancing funds).',
    revenue: '$200 per consumer lookup, or $5K–$20K p.a. per lender partner.',
    dependency: 'Companies Office data integration. SubbieCheck validated.',
  },
  'fly-p4': {
    title: 'Data Flywheel Mature',
    phase: 'Phase 4 · 2028+',
    who: 'Platform',
    description: 'By Phase 4, TradieCheck has accumulated sufficient verified financial health data across NZ and AU to generate statistically meaningful insights. The data flywheel enables Supplier Credit Intelligence and Full PAF products, and positions TradieCheck as the trust infrastructure layer for the entire construction ecosystem.',
    revenue: 'Enables Phase 4 data monetisation products.',
    dependency: 'Volume of verified tradie and transaction data across NZ and AU.',
  },
  'lp-p3': {
    title: 'Lender Partnership',
    phase: 'Phase 3 · H2 2027–H1 2028',
    who: 'Lenders · Developers · Tradies',
    description: 'TradieCheck positioned as a risk management condition within lender funding frameworks. Three integration options: (1) contractor-level — lender requires verified tradie status as a drawdown condition; (2) project-level — lender mandates TradieCheck framework adoption across the project; (3) risk-based — applied to higher-risk projects only. Lenders gain real-time verification visibility; developers adopt TradieCheck to access funding; tradies gain a new acquisition channel at near-zero CAC.',
    revenue: 'Enterprise API licence. Distribution channel driving tradie subscription and TradieWallet volume.',
    dependency: 'DevCheck and ProjectWallet live. Lender partnership negotiations complete.',
  },
  'int-p3': {
    title: '3 Integration Options',
    phase: 'Phase 3 · H2 2027–H1 2028',
    who: 'Lenders',
    description: 'Three structured options for lenders to integrate TradieCheck into their funding frameworks: contractor-level verification requirement, project-level framework adoption, and risk-based application for higher-risk developments. Each option is priced differently and targets different lender risk appetites.',
    revenue: 'Priced per integration tier. Volume-based enterprise licensing.',
    dependency: 'Lender Partnership commercial framework agreed.',
  },
  'sci-p4': {
    title: 'Supplier Credit Intelligence',
    phase: 'Phase 4 · 2028+',
    who: 'Suppliers · Lenders',
    description: 'Data product exposing verified tradie financial health metrics (creditor days, working capital ratios, solvency indicators) to suppliers and lenders extending trade credit. Suppliers access live tradie financial health scores to make better credit decisions on trade accounts. Lenders use verified financial data to assess contractor exposure on funded projects. Requires sufficient data volume to be statistically meaningful — correctly sequenced as Phase 4.',
    revenue: '$10K–$50K p.a. per major supplier or lender partner.',
    dependency: 'Data flywheel mature. Sufficient verified tradie transaction history.',
  },
  'paf-p4': {
    title: 'Full PAF — Project Assurance Framework',
    phase: 'Phase 4 · 2028+',
    who: 'Lenders · Developers · Head Contractors · Tradies',
    description: 'Full Project Assurance Framework embedded within lender funding structures. TradieCheck becomes the live governance layer across the entire project lifecycle — connecting developers, head contractors, tradies, and subcontractors through a single transparent system. Lenders gain real-time visibility, milestone-controlled fund release, and verified supply chain assurance as standard. TradieCheck transitions from a tradie platform to embedded construction finance infrastructure.',
    revenue: 'Embedded within lender frameworks. Full lifecycle fee capture across the payment chain.',
    dependency: 'Lender Partnership validated. ProjectWallet at scale.',
  },
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

function Card({ card, selected, onClick }) {
  const color = COLORS[card.type];
  const isSelected = selected === card.id;
  return (
    <div
      onClick={() => onClick(card.id)}
      style={{
        background: card.ghost ? color.bg + '40' : color.bg,
        border: `1px solid ${isSelected ? color.accent : card.ghost ? color.border + '60' : color.border}`,
        borderRadius: 8,
        padding: '8px 10px',
        marginBottom: 6,
        cursor: 'pointer',
        outline: isSelected ? `2px solid ${color.accent}` : 'none',
        outlineOffset: 1,
        transition: 'outline 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: card.body ? 3 : 0 }}>
        {card.isNew && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: COLORS.strategic.accent, color: '#fff', borderRadius: 3, letterSpacing: '0.04em' }}>NEW</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: card.ghost ? color.accent + 'CC' : color.accent }}>{card.title}</span>
      </div>
      {card.body ? (
        <div style={{ fontSize: 11, color: card.ghost ? '#9AAABB' : '#FFFFFF', lineHeight: 1.4 }}>{card.body}</div>
      ) : null}
    </div>
  );
}

export default function Roadmap() {
  const [selected, setSelected] = useState(null);

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

  const detail = selected ? PRODUCT_DETAIL[selected] : null;
  const selectedCard = selected ? CARDS.find(c => c.id === selected) : null;
  const selectedColor = selectedCard ? COLORS[selectedCard.type] : null;

  const COL_W = 170;
  const LANE_LABEL_W = 70;

  const colStyle = (dim) => ({
    width: COL_W, flexShrink: 0,
    background: dim ? '#080C12' : '#0A0E14',
    border: `1px solid ${dim ? '#10181E' : '#141E2A'}`,
    borderRadius: 6, padding: '8px 8px 4px',
  });

  const handleCardClick = (id) => {
    setSelected(prev => prev === id ? null : id);
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", minHeight: '100vh', background: '#080E16', color: '#E0EAF4' }}>
      <div style={{ display: 'flex', height: '100%' }}>

        {/* Main roadmap area */}
        <div style={{ flex: 1, padding: '20px 20px 40px', minWidth: 0, overflowX: 'auto' }}>

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
                <span style={{ fontSize: 13, fontWeight: 700, color: '#E0EAF4' }}>Phase 1 · Apr – Dec 2026</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', background: '#6DBE45', color: '#0A1A06', borderRadius: 10 }}>CURRENT</span>
              </div>
            </div>
            {[{ label: 'Phase 2', period: 'H1 2027', dim: false }, { label: 'Phase 3', period: 'H2 2027–H1 2028', dim: false }, { label: 'Phase 4', period: '2028+', dim: true }].map((p, i) => (
              <div key={i} style={{ width: COL_W, flexShrink: 0, marginRight: i < 2 ? 6 : 0, background: p.dim ? '#0A0E14' : '#0E1E30', border: `1px solid ${p.dim ? '#141E2A' : '#1A3A5A'}`, borderRadius: '8px 8px 0 0', padding: '10px 14px 8px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.dim ? '#4A6A8A' : '#E0EAF4', marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#4A6A8A' }}>{p.period}</div>
              </div>
            ))}
          </div>

          {/* Sub-phase row */}
          <div style={{ display: 'flex', marginBottom: 6 }}>
            <div style={{ width: LANE_LABEL_W, flexShrink: 0 }} />
            {[{ id: 'p1w', label: 'Wellington', period: 'Apr – Jul' }, { id: 'p1n', label: 'National', period: 'Jul – Dec' }].map((s) => (
              <div key={s.id} style={{ width: COL_W, flexShrink: 0, marginRight: 8, background: '#0A1828', border: '1px solid #1A3A5A', borderTop: 'none', padding: '5px 14px 6px' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7ABADC' }}>{s.label}</span>
                <span style={{ fontSize: 10, color: '#4A6A8A', marginLeft: 6 }}>{s.period}</span>
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
              <div style={{ ...colStyle(false), marginRight: 8 }}>{cardsByLaneAndCol[lane.id]['p1w'].map(c => <Card key={c.id} card={c} selected={selected} onClick={handleCardClick} />)}</div>
              <div style={{ ...colStyle(false), marginRight: 6 }}>{cardsByLaneAndCol[lane.id]['p1n'].map(c => <Card key={c.id} card={c} selected={selected} onClick={handleCardClick} />)}</div>
              <div style={{ ...colStyle(false), marginRight: 6 }}>{cardsByLaneAndCol[lane.id]['p2'].map(c => <Card key={c.id} card={c} selected={selected} onClick={handleCardClick} />)}</div>
              <div style={{ ...colStyle(false), marginRight: 6 }}>{cardsByLaneAndCol[lane.id]['p3'].map(c => <Card key={c.id} card={c} selected={selected} onClick={handleCardClick} />)}</div>
              <div style={{ ...colStyle(true) }}>{cardsByLaneAndCol[lane.id]['p4'].map(c => <Card key={c.id} card={c} selected={selected} onClick={handleCardClick} />)}</div>
            </div>
          ))}

          {/* Key sequencing rule */}
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#0A1420', border: '1px solid #1A2A3A', borderRadius: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7ABADC', marginRight: 8 }}>Key sequencing rule:</span>
            <span style={{ fontSize: 11, color: '#6A8AA0', lineHeight: 1.5 }}>Phase 1 spans Apr–Dec 2026 — Wellington founding member launch (Apr–Jul) then national rollout (Jul–Dec). Phase 2 adds the B2B layer. ProjectWallet scales SubbieWallet to full development projects in Phase 3.</span>
          </div>
        </div>

        {/* Detail panel */}
        <div style={{
          width: detail ? 300 : 0,
          minWidth: detail ? 300 : 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease, min-width 0.2s ease',
          background: '#0A0E14',
          borderLeft: detail ? '1px solid #1A2A3A' : 'none',
          flexShrink: 0,
        }}>
          {detail && selectedColor && (
            <div style={{ padding: '24px 20px', width: 300, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: selectedColor.accent, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 3 }}>{detail.phase}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#4A6A8A', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>✕</button>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: selectedColor.accent, marginBottom: 6, lineHeight: 1.3 }}>{detail.title}</div>
              <div style={{ fontSize: 11, color: '#4A6A8A', marginBottom: 16 }}>For: {detail.who}</div>
              <div style={{ width: '100%', height: 1, background: '#1A2A3A', marginBottom: 16 }} />
              <div style={{ fontSize: 13, color: '#C0D0E0', lineHeight: 1.7, marginBottom: 20 }}>{detail.description}</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4A6A8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Revenue model</div>
                <div style={{ fontSize: 12, color: '#8899AA', lineHeight: 1.6 }}>{detail.revenue}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4A6A8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Dependencies</div>
                <div style={{ fontSize: 12, color: '#8899AA', lineHeight: 1.6 }}>{detail.dependency}</div>
              </div>
            </div>
          )}
          {!detail && (
            <div style={{ width: 300, padding: '24px 20px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 12, color: '#2A3A4A', textAlign: 'center', marginTop: 40, lineHeight: 1.6 }}>Select a card to view product details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
