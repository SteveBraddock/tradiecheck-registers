'use client'
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
 
const BLUE   = "#1E90D4";
const GREEN  = "#6DBE45";
const DARK   = "#1A2430";
const MID    = "#4A5568";
const LIGHT  = "#F4F8FC";
const BORDER = "#D8E6EE";
const WHITE  = "#FFFFFF";
 
const LAST_UPDATED = "2 April 2026";
 
const OWNERS = [
  "Steve Braddock", "Jade Clamp", "Helmut Modlik", "Mike Gollop",
  "Alicia Clamp", "Dentons", "IPromise", "Waitapu Group",
  "BDO Wellington", "Steve / Founders", "Steve / Waitapu", "Mike / Steve", "TBD"
];
 
const WS_STATUS = {
  green: { bg: "#EEF8EE", border: "#6DBE45", dot: "#6DBE45", label: "On Track"    },
  amber: { bg: "#FFF8EE", border: "#F59E0B", dot: "#F59E0B", label: "In Progress" },
  red:   { bg: "#FEF0EE", border: "#E53E3E", dot: "#E53E3E", label: "Blocked"     },
  grey:  { bg: "#F4F4F4", border: "#9CA3AF", dot: "#9CA3AF", label: "Deferred"    },
};
 
const ITEM_STATUS = {
  done:        { label: "Done",        bg: "#EEF8EE", text: "#1E6B1E", dot: "#6DBE45" },
  in_progress: { label: "In Progress", bg: "#EDF6FC", text: "#1A5A8A", dot: "#1E90D4" },
  not_started: { label: "Not Started", bg: "#F4F4F4", text: "#555",    dot: "#9CA3AF" },
};
 
const DEP_STATUS = {
  "Resolved":   { bg: "#EEF8EE", text: "#1E6B1E", dot: "#6DBE45" },
  "Open":       { bg: "#EDF6FC", text: "#1A5A8A", dot: "#1E90D4" },
  "Blocked":    { bg: "#FEF0EE", text: "#B02020", dot: "#E53E3E" },
  "Pending":    { bg: "#FFF8EE", text: "#8A6A10", dot: "#F59E0B" },
  "Deferred":   { bg: "#F4F4F4", text: "#555",    dot: "#9CA3AF" },
  "Monitoring": { bg: "#F0EEFA", text: "#5B21B6", dot: "#8B5CF6" },
};
 
const SEED_WORKSTREAMS = [
  {
    title: "Legal & Regulatory", status: "green", sort_order: 1,
    summary: "Dentons written opinion received 2 April 2026. TradieCheck not required to register as FSP, not captured as AML/CFT reporting entity, not subject to CCA retention money provisions. Key obligations now flowing into T&C drafting and product design.",
    items: [
      { item_text: "Dentons written opinion received (Ref: TRA004-2001)", item_status: "done", owner: "Dentons", sort_order: 1 },
      { item_text: "FSP Act - no registration required", item_status: "done", owner: "Dentons", sort_order: 2 },
      { item_text: "AML/CFT Act - not a reporting entity", item_status: "done", owner: "Dentons", sort_order: 3 },
      { item_text: "CCA retention money - not applicable to TradieCheck (carve-out required in T&Cs for non-residential-occupier contracts)", item_status: "done", owner: "Dentons", sort_order: 4 },
      { item_text: "T&Cs drafting - escrow provider visibility, liability exclusion, CCA carve-out", item_status: "not_started", owner: "Steve Braddock", sort_order: 5 },
      { item_text: "Dentons guidance on required T&C prominence standard (follow-up sent 2 April)", item_status: "not_started", owner: "Dentons", sort_order: 6 },
      { item_text: "Monitor AML/CFT Amendment Bill through Parliament", item_status: "not_started", owner: "Steve Braddock", sort_order: 7 },
    ]
  },
  {
    title: "Funding", status: "amber", sort_order: 2,
    summary: "Funding approach not yet agreed across founders. Options being assessed. Investor materials now unblocked following Dentons opinion but documentation will follow approach confirmation.",
    items: [
      { item_text: "Co-founder capital alignment completed March 2026", item_status: "done", owner: "Steve Braddock", sort_order: 1 },
      { item_text: "Funding approach - best approach agreed across founders", item_status: "not_started", owner: "Steve / Founders", sort_order: 2 },
      { item_text: "Funding documentation and term sheet (post-approach confirmation)", item_status: "not_started", owner: "Steve Braddock", sort_order: 3 },
      { item_text: "Investor materials preparation", item_status: "not_started", owner: "Steve Braddock", sort_order: 4 },
      { item_text: "Seed round materials (parallel track, post-funding round)", item_status: "not_started", owner: "Steve Braddock", sort_order: 5 },
    ]
  },
  {
    title: "Product & Technology", status: "amber", sort_order: 3,
    summary: "Path A onboarding deployed to tradiecheck-registers.vercel.app. Path B (Sole Trader) not yet started. Escrow integration design pending IPromise briefing. Mike engaged as contractor pending separate matter resolution.",
    items: [
      { item_text: "Next.js app deployed (tradiecheck-registers.vercel.app)", item_status: "done", owner: "Mike Gollop", sort_order: 1 },
      { item_text: "Path A (Company/Trust/Partnership) onboarding - multi-step mock deployed", item_status: "done", owner: "Mike Gollop", sort_order: 2 },
      { item_text: "Register, Actions Log, Ecosystem, Roadmap pages live", item_status: "done", owner: "Mike Gollop", sort_order: 3 },
      { item_text: "Path B (Sole Trader) onboarding build", item_status: "not_started", owner: "Mike Gollop", sort_order: 4 },
      { item_text: "Photo upload grid polish", item_status: "not_started", owner: "Mike Gollop", sort_order: 5 },
      { item_text: "End-to-end Supabase save verification", item_status: "not_started", owner: "Mike Gollop", sort_order: 6 },
      { item_text: "Escrow UI design (IPromise integration) - pending formal briefing", item_status: "not_started", owner: "Mike Gollop", sort_order: 7 },
      { item_text: "HNRY API integration scoping - pending partnership outreach", item_status: "not_started", owner: "Mike Gollop", sort_order: 8 },
    ]
  },
  {
    title: "Escrow Partner", status: "amber", sort_order: 4,
    summary: "IPromise is primary candidate (FSP-registered, NZ-based). Formal briefing now unblocked by Dentons opinion. FSP registration confirmation required before briefing issued. Direct legal relationship capability remains unconfirmed - critical open question.",
    items: [
      { item_text: "IPromise identified as primary candidate", item_status: "done", owner: "Steve Braddock", sort_order: 1 },
      { item_text: "Noble Escrow identified as NZ backup", item_status: "done", owner: "Steve Braddock", sort_order: 2 },
      { item_text: "Escrow.com identified for AU/global", item_status: "done", owner: "Steve Braddock", sort_order: 3 },
      { item_text: "Confirm IPromise FSP registration (prerequisite to formal briefing)", item_status: "not_started", owner: "Steve Braddock", sort_order: 4 },
      { item_text: "Issue formal escrow partner briefing - IPromise primary", item_status: "not_started", owner: "Steve Braddock", sort_order: 5 },
      { item_text: "Confirm IPromise can operate with a visible, direct legal relationship to customers within the TradieCheck platform experience", item_status: "not_started", owner: "Steve Braddock", sort_order: 6 },
      { item_text: "Negotiate IPromise commercial terms ($10/transaction cost to confirm)", item_status: "not_started", owner: "Steve Braddock", sort_order: 7 },
      { item_text: "CCA escrow provider compliance assessment (deferred to Phase 2)", item_status: "not_started", owner: "Steve Braddock", sort_order: 8 },
    ]
  },
  {
    title: "Marketing & Partnerships", status: "amber", sort_order: 5,
    summary: "Waitapu Group confirmed as marketing partner (Greg Partington, Elizabeth Beatty). Handover pack in progress - seven documents ready, four previously held pending Dentons (now cleared). Teams hui to be arranged. Agency pipeline identified.",
    items: [
      { item_text: "Waitapu Group confirmed as marketing partner", item_status: "done", owner: "Helmut Modlik", sort_order: 1 },
      { item_text: "Seven handover documents ready for immediate sharing", item_status: "done", owner: "Steve Braddock", sort_order: 2 },
      { item_text: "Four held documents cleared by Dentons opinion", item_status: "done", owner: "Steve Braddock", sort_order: 3 },
      { item_text: "Waitapu handover pack issued", item_status: "not_started", owner: "Steve Braddock", sort_order: 4 },
      { item_text: "Teams hui arranged via Drea Tupene", item_status: "not_started", owner: "Steve Braddock", sort_order: 5 },
      { item_text: "Auckland shareholder partner onboarded as primary Waitapu contact", item_status: "not_started", owner: "Steve Braddock", sort_order: 6 },
      { item_text: "Brief Waitapu on online marketplace constraint (AML/CFT compliance requirement)", item_status: "not_started", owner: "Steve Braddock", sort_order: 7 },
      { item_text: "Agency brief - Stanley St / Culture / Content Depot pipeline", item_status: "not_started", owner: "Waitapu Group", sort_order: 8 },
      { item_text: "Standalone customer segments and positioning/messaging framework", item_status: "not_started", owner: "Steve / Waitapu", sort_order: 9 },
    ]
  },
  {
    title: "Team & Governance", status: "amber", sort_order: 6,
    summary: "Governance Blueprint drafted. Mike's directorship and shares on hold pending separate matter. Jade's full-time activation tied to business and milestone conditions. Founder vesting structure agreed.",
    items: [
      { item_text: "Governance Blueprint drafted (v4)", item_status: "done", owner: "Steve Braddock", sort_order: 1 },
      { item_text: "Founder vesting: 3-year reverse, 12-month cliff, monthly post-cliff", item_status: "done", owner: "Steve Braddock", sort_order: 2 },
      { item_text: "Governance Blueprint finalisation", item_status: "not_started", owner: "Steve Braddock", sort_order: 3 },
      { item_text: "Mike Gollop - directorship and share allocation (on hold pending separate matter)", item_status: "not_started", owner: "Mike Gollop", sort_order: 4 },
      { item_text: "Jade Clamp - full-time activation (tied to business and milestone conditions)", item_status: "not_started", owner: "Jade Clamp", sort_order: 5 },
      { item_text: "Alicia Clamp - salary activation October 2026", item_status: "not_started", owner: "Alicia Clamp", sort_order: 6 },
      { item_text: "Territory Rep: Auckland (July 2027), Christchurch (October 2027)", item_status: "not_started", owner: "Jade Clamp", sort_order: 7 },
    ]
  },
  {
    title: "Financial Model", status: "amber", sort_order: 7,
    summary: "Financial model v8 built (Python/openpyxl, 36-month April 2026 to March 2029, Base and Growth scenarios, 17 tabs). Several inputs remain as placeholders pending external confirmation.",
    items: [
      { item_text: "Financial model v8 complete (17 tabs, Base + Growth scenarios, 36-month horizon)", item_status: "done", owner: "Steve Braddock", sort_order: 1 },
      { item_text: "Monthly dev cost quantum - confirm with Mike", item_status: "not_started", owner: "Mike Gollop", sort_order: 2 },
      { item_text: "Funding round proceeds and close months (post-approach confirmation)", item_status: "not_started", owner: "Steve Braddock", sort_order: 3 },
      { item_text: "IPromise commercial terms (cost per transaction)", item_status: "not_started", owner: "Steve Braddock", sort_order: 4 },
      { item_text: "HNRY API cost (placeholder)", item_status: "not_started", owner: "Steve Braddock", sort_order: 5 },
      { item_text: "Banking partner setup cost", item_status: "not_started", owner: "Steve Braddock", sort_order: 6 },
      { item_text: "BDO deferred tax asset recoverability review", item_status: "not_started", owner: "BDO Wellington", sort_order: 7 },
    ]
  },
  {
    title: "Australia Expansion", status: "grey", sort_order: 8,
    summary: "Recommended structure: new Australian Pty Ltd subsidiary (not foreign branch). Practical setup window Q3/Q4 2026 aligned with 2027 AU launch. Name appears clear in AU but manual verification still required.",
    items: [
      { item_text: "Australian Pty Ltd incorporation - Q3/Q4 2026", item_status: "not_started", owner: "Steve Braddock", sort_order: 1 },
      { item_text: "Manual name/trademark/domain verification: ASIC Connect, IP Australia, .com.au", item_status: "not_started", owner: "Steve Braddock", sort_order: 2 },
      { item_text: "AFSL requirements assessment", item_status: "not_started", owner: "Steve Braddock", sort_order: 3 },
      { item_text: "AU escrow partner: TwoHold under consideration alongside Escrow.com", item_status: "not_started", owner: "Steve Braddock", sort_order: 4 },
    ]
  },
];
 
const DEPENDENCIES = [
  { item: "Dentons written legal opinion", owner: "Dentons / Steve", status: "Resolved", note: "Received 2 April 2026. All three questions answered favourably. Unblocks investor materials, escrow briefing, governance docs, Waitapu held documents." },
  { item: "Dentons guidance on T&C prominence standard", owner: "Dentons / Steve", status: "Open", note: "Follow-up sent 2 April 2026 requesting written guidance on required escrow provider disclosure standard." },
  { item: "IPromise FSP registration confirmation", owner: "Steve Braddock", status: "Open", note: "Prerequisite to issuing formal escrow partner briefing. Check via fsp.govt.nz." },
  { item: "IPromise - direct legal relationship capability", owner: "Steve / IPromise", status: "Pending", note: "Must confirm IPromise can operate with a visible, named, direct legal relationship to customers and tradespersons within the TradieCheck platform. Required by Dentons opinion." },
  { item: "Funding approach - founder alignment", owner: "Steve / Founders", status: "Open", note: "Best approach not yet agreed. Options being assessed across founders before any documentation or distribution." },
  { item: "IPromise commercial terms", owner: "Steve / IPromise", status: "Pending", note: "$10/transaction placeholder in financial model. Formal terms required post-briefing." },
  { item: "HNRY API partnership", owner: "Steve Braddock", status: "Open", note: "Outreach recommended post-Dentons opinion. Contact: hnry.co.nz/partners/nz or James Fuller (james@hnry.co.nz). Consent-based sole trader data for Path B onboarding automation." },
  { item: "Monthly dev cost quantum", owner: "Mike Gollop", status: "Open", note: "Required to finalise financial model v8. Placeholder in current model." },
  { item: "AML/CFT Amendment Bill", owner: "Steve / Dentons", status: "Monitoring", note: "Currently progressing through Parliament. Broader definitions proposed. TradieCheck not captured under proposed definition provided structural safeguards maintained. Dentons to be consulted on passage." },
  { item: "BDO Wellington - deferred tax asset review", owner: "Steve / BDO", status: "Deferred", note: "BDO to assess deferred tax asset recoverability. Timing TBD." },
];
 
const UNBLOCKED = [
  { item: "Formal escrow partner briefing process", note: "IPromise primary - subject to FSP registration confirmation first" },
  { item: "Investor materials and funding documentation", note: "Approach not yet agreed - funding documentation and seed round materials will both follow founder alignment on best approach" },
  { item: "Waitapu Group handover - held documents", note: "Financial Model, Governance Blueprint, Funding terms, Escrow Provider Briefing now cleared" },
  { item: "HNRY API partnership outreach", note: "Recommended via partnerships page or founder-to-founder to James Fuller" },
];
 
const HORIZON = [
  { priority: 1,  item: "Issue Waitapu Group handover pack",                                timing: "This week",         owner: "Steve Braddock"  },
  { priority: 2,  item: "Confirm IPromise FSP registration then issue formal escrow briefing", timing: "This week",      owner: "Steve Braddock"  },
  { priority: 3,  item: "Dentons response on T&C prominence standard",                      timing: "Awaiting",          owner: "Dentons"         },
  { priority: 4,  item: "Agree funding approach across founders then progress documentation",timing: "April 2026",        owner: "Steve / Founders"},
  { priority: 5,  item: "Path B (Sole Trader) onboarding build",                            timing: "April 2026",        owner: "Mike / Steve"    },
  { priority: 6,  item: "HNRY API partnership outreach",                                    timing: "Post-Dentons reply", owner: "Steve Braddock"  },
  { priority: 7,  item: "Customer segments + positioning/messaging framework",              timing: "April to May 2026",  owner: "Steve / Waitapu" },
  { priority: 8,  item: "Financial model - resolve remaining placeholders",                 timing: "April to May 2026",  owner: "Steve / Mike"    },
  { priority: 9,  item: "Mike Gollop - directorship and share allocation resolution",       timing: "TBD",               owner: "Mike Gollop"     },
  { priority: 10, item: "Australian Pty Ltd incorporation",                                 timing: "Q3/Q4 2026",         owner: "Steve Braddock"  },
];
 
const SNAPSHOT = [
  { label: "Entity",            value: "TradieCheck Limited (Co. No. 9370094)" },
  { label: "Description",       value: "Trust and verification platform for NZ residential trades. Three-pillar model: identity/legitimacy, financial strength, reputation." },
  { label: "Core products",     value: "TradieCheck (verification) / TradieWallet (milestone escrow) / SubbieCheck (Phase 2) / SupplierCheck (Phase 2)" },
  { label: "Launch plan",       value: "Wellington pilot July 2026 -> National October 2026 -> Australia 2027" },
  { label: "Team",              value: "Steve Braddock (CEO/CFO) / Jade Clamp (CIGO) / Mike Gollop (CTO, contractor) / Helmut Modlik (NED) / Alicia Clamp (Head of Ops, Oct 2026)" },
  { label: "Legal counsel",     value: "Dentons Kensington Swan (Wellington) - David Ireland, Partner" },
  { label: "Preferred auditor", value: "BDO Wellington" },
];
 
function SectionHeader({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 36 }}>
      <div style={{ height: 24, width: 4, borderRadius: 2, background: BLUE, flexShrink: 0 }} />
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: DARK, fontFamily: "sans-serif" }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}
 
function FilterBar({ options, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          padding: "4px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
          border: active === o ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}`,
          background: active === o ? BLUE : WHITE,
          color: active === o ? WHITE : MID,
        }}>{o}</button>
      ))}
    </div>
  );
}
 
function WorkstreamCard({ ws, items, onItemUpdate }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(null);
  const s = WS_STATUS[ws.status] || WS_STATUS.amber;
 
  async function handleUpdate(itemId, field, value) {
    setSaving(itemId + field);
    const { error } = await supabase.from("sop_items").update({ [field]: value }).eq("id", itemId);
    if (!error) onItemUpdate(itemId, field, value);
    setSaving(null);
  }
 
  const doneCount = items.filter(i => i.item_status === "done").length;
 
  return (
    <div style={{ border: `1.5px solid ${s.border}`, borderRadius: 10, background: WHITE, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", cursor: "pointer", background: s.bg }}>
        <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: s.dot, marginTop: 3, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: DARK, fontFamily: "sans-serif" }}>{ws.title}</span>
            <span style={{ background: s.bg, color: s.dot, borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700, fontFamily: "sans-serif" }}>{s.label}</span>
            <span style={{ fontSize: 12, color: MID, fontFamily: "sans-serif", marginLeft: "auto" }}>{doneCount}/{items.length} done</span>
          </div>
          <div style={{ fontSize: 13, color: MID, lineHeight: 1.5, fontFamily: "sans-serif" }}>{ws.summary}</div>
        </div>
        <div style={{ fontSize: 16, color: MID, flexShrink: 0, marginTop: 2 }}>{open ? "[-]" : "[+]"}</div>
      </div>
 
      {open && (
        <div style={{ borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 190px", background: DARK, padding: "8px 16px", gap: 12 }}>
            {["Action Item", "Status", "Owner"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#8EA4BC", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "sans-serif" }}>{h}</div>
            ))}
          </div>
          {items.map((item, i) => {
            const isSaving = saving === item.id + "item_status" || saving === item.id + "owner";
            return (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 150px 190px", padding: "10px 16px", gap: 12, alignItems: "center", background: i % 2 === 0 ? WHITE : LIGHT, borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 13, color: DARK, fontFamily: "sans-serif", lineHeight: 1.4 }}>{item.item_text}</div>
                <div>
                  {isSaving
                    ? <span style={{ fontSize: 11, color: MID, fontFamily: "sans-serif" }}>Saving...</span>
                    : <select value={item.item_status} onChange={e => handleUpdate(item.id, "item_status", e.target.value)}
                        style={{ fontSize: 12, border: `1.5px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", background: WHITE, color: DARK, cursor: "pointer", fontFamily: "sans-serif", width: "100%" }}>
                        <option value="done">Done</option>
                        <option value="in_progress">In Progress</option>
                        <option value="not_started">Not Started</option>
                      </select>
                  }
                </div>
                <div>
                  <select value={item.owner} onChange={e => handleUpdate(item.id, "owner", e.target.value)}
                    style={{ fontSize: 12, border: `1.5px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", background: WHITE, color: DARK, cursor: "pointer", fontFamily: "sans-serif", width: "100%" }}>
                    {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
 
export default function StateOfPlay() {
  const [workstreams, setWorkstreams] = useState([]);
  const [itemsByWs, setItemsByWs]     = useState({});
  const [loading, setLoading]         = useState(true);
  const [seeding, setSeeding]         = useState(false);
  const [wsFilter, setWsFilter]       = useState("All");
  const [depFilter, setDepFilter]     = useState("All");
 
  useEffect(() => { loadData(); }, []);
 
  async function loadData() {
    setLoading(true);
    const { data: wsList } = await supabase.from("sop_workstreams").select("*").order("sort_order");
    if (!wsList || wsList.length === 0) { await seedData(); return; }
    const { data: allItems } = await supabase.from("sop_items").select("*").order("sort_order");
    const grouped = {};
    (wsList || []).forEach(ws => { grouped[ws.id] = []; });
    (allItems || []).forEach(item => { if (grouped[item.workstream_id]) grouped[item.workstream_id].push(item); });
    setWorkstreams(wsList || []);
    setItemsByWs(grouped);
    setLoading(false);
  }
 
  async function seedData() {
    setSeeding(true);
    for (const ws of SEED_WORKSTREAMS) {
      const { items, ...wsData } = ws;
      const { data: inserted } = await supabase.from("sop_workstreams").insert(wsData).select().single();
      if (inserted) await supabase.from("sop_items").insert(items.map(it => ({ ...it, workstream_id: inserted.id })));
    }
    setSeeding(false);
    await loadData();
  }
 
  function handleItemUpdate(itemId, field, value) {
    setItemsByWs(prev => {
      const next = { ...prev };
      for (const wsId in next) next[wsId] = next[wsId].map(it => it.id === itemId ? { ...it, [field]: value } : it);
      return next;
    });
  }
 
  const wsStatusLabels = ["All", "On Track", "In Progress", "Blocked", "Deferred"];
  const filteredWS   = wsFilter   === "All" ? workstreams  : workstreams.filter(ws => WS_STATUS[ws.status]?.label === wsFilter);
  const depStatuses  = ["All", ...Object.keys(DEP_STATUS)];
  const filteredDeps = depFilter  === "All" ? DEPENDENCIES : DEPENDENCIES.filter(d => d.status === depFilter);
 
  if (loading || seeding) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTop: `3px solid ${BLUE}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 14, color: MID, fontFamily: "sans-serif" }}>{seeding ? "Setting up State of Play..." : "Loading..."}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
 
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 80px", fontFamily: "sans-serif", background: "#F4F8FC", minHeight: "100vh" }}>
 
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1A2430", letterSpacing: "-0.02em" }}>State of Play</h1>
      </div>
 
      <div style={{ background: DARK, borderRadius: 12, padding: "24px 28px", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: WHITE, fontFamily: "sans-serif" }}>TradieCheck</div>
          <div style={{ height: 18, width: 1, background: "#334" }} />
          <div style={{ fontSize: 13, color: "#8EA4BC", fontFamily: "sans-serif" }}>Company Snapshot</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: "#8EA4BC", fontFamily: "sans-serif" }}>Updated: <span style={{ color: GREEN, fontWeight: 600 }}>{LAST_UPDATED}</span></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {SNAPSHOT.map((s, i) => (
            <div key={i} style={{ background: "#243040", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8EA4BC", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5, fontFamily: "sans-serif" }}>{s.label}</div>
              <div style={{ fontSize: 13, color: WHITE, lineHeight: 1.5, fontFamily: "sans-serif" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
 
      <SectionHeader title="Workstream Status" />
      <FilterBar options={wsStatusLabels} active={wsFilter} onChange={setWsFilter} />
      <div style={{ display: "grid", gap: 10 }}>
        {filteredWS.map(ws => (
          <WorkstreamCard key={ws.id} ws={ws} items={itemsByWs[ws.id] || []} onItemUpdate={handleItemUpdate} />
        ))}
      </div>
 
      <SectionHeader title="Recently Unblocked" />
      <div style={{ background: "#EEF8EE", border: "1.5px solid #6DBE45", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 24, height: 24, background: GREEN, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: WHITE, fontSize: 14, fontWeight: 700 }}>+</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1E6B1E", fontFamily: "sans-serif" }}>Items Unblocked - 2 April 2026</div>
            <div style={{ fontSize: 12, color: "#3A8A3A", fontFamily: "sans-serif" }}>Dentons written opinion received (Ref: TRA004-2001). All three regulatory questions answered favourably.</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          {UNBLOCKED.map((u, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 8, padding: "12px 14px", border: "1px solid #B8E0B8" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 4, fontFamily: "sans-serif" }}>{u.item}</div>
              <div style={{ fontSize: 12, color: MID, lineHeight: 1.4, fontFamily: "sans-serif" }}>{u.note}</div>
            </div>
          ))}
        </div>
      </div>
 
      <SectionHeader title="Key Dependencies" />
      <FilterBar options={depStatuses} active={depFilter} onChange={setDepFilter} />
      <div style={{ borderRadius: 10, overflow: "hidden", border: `1.5px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px 3fr", background: DARK, padding: "10px 16px", gap: 12 }}>
          {["Dependency", "Owner", "Status", "Notes"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#8EA4BC", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "sans-serif" }}>{h}</div>
          ))}
        </div>
        {filteredDeps.map((d, i) => {
          const sc = DEP_STATUS[d.status] || DEP_STATUS["Open"];
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px 3fr", padding: "11px 16px", gap: 12, alignItems: "start", background: i % 2 === 0 ? WHITE : LIGHT, borderTop: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.4, fontFamily: "sans-serif" }}>{d.item}</div>
              <div style={{ fontSize: 12, color: MID, fontFamily: "sans-serif" }}>{d.owner}</div>
              <div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: sc.bg, color: sc.text, borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 700, fontFamily: "sans-serif" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, display: "inline-block", flexShrink: 0 }} />
                  {d.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: MID, lineHeight: 1.5, fontFamily: "sans-serif" }}>{d.note}</div>
            </div>
          );
        })}
      </div>
 
      <SectionHeader title="On the Horizon" />
      <div style={{ borderRadius: 10, overflow: "hidden", border: `1.5px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 3fr 180px 160px", background: DARK, padding: "10px 16px", gap: 12 }}>
          {["#", "Item", "Owner", "Timing"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#8EA4BC", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "sans-serif" }}>{h}</div>
          ))}
        </div>
        {HORIZON.map((h, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 3fr 180px 160px", padding: "11px 16px", gap: 12, alignItems: "start", background: i % 2 === 0 ? WHITE : LIGHT, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, fontFamily: "sans-serif" }}>{h.priority}</div>
            <div style={{ fontSize: 13, color: DARK, lineHeight: 1.4, fontFamily: "sans-serif" }}>{h.item}</div>
            <div style={{ fontSize: 12, color: MID, fontFamily: "sans-serif" }}>{h.owner}</div>
            <div style={{ fontSize: 12, color: MID, fontFamily: "sans-serif" }}>{h.timing}</div>
          </div>
        ))}
      </div>
 
    </div>
  );
}
