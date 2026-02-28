'use client'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const OWNERS = ["Steve Braddock", "Jade Clamp", "Helmut Modlik", "Mike Gollop", "TBD / Unassigned"];
const CATEGORIES = ["Strategy", "Product", "Legal/Regulatory", "Marketing", "Financial", "Operations", "Technology", "Constitution Rule", "Other"];
const STATUSES = ["Not Started", "In Progress", "Done", "Blocked", "Deferred"];
const PRIORITIES = ["High", "Medium", "Low"];

const TC_CHARCOAL = "#3D3D3D";
const TC_BLUE = "#4AABDB";
const TC_GREEN = "#8DC63F";
const TC_LIGHT_BG = "#F5F8FA";
const TC_BORDER = "#D8E6EE";

const STATUS_COLORS = {
  "Not Started": { bg: "#EDF6FC", text: "#2A7DAF", dot: TC_BLUE },
  "In Progress":  { bg: "#EEF7E1", text: "#5A8A1F", dot: TC_GREEN },
  "Done":         { bg: "#D6F0E3", text: "#1B7A4A", dot: "#2ECC7A" },
  "Blocked":      { bg: "#FDE8E8", text: "#B02020", dot: "#E84040" },
  "Deferred":     { bg: "#F5F0E0", text: "#8A6A10", dot: "#D4A820" },
};

const PRIORITY_COLORS = {
  "High":   { bg: "#FDE8E8", text: "#B02020" },
  "Medium": { bg: "#FFF3CD", text: "#8A6A10" },
  "Low":    { bg: "#F0F0F0", text: "#555" },
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === "Done" || status === "Deferred") return false;
  return new Date(dueDate) < new Date();
}

// Map database snake_case to component camelCase
function dbToEntry(row) {
  return {
    id: row.id,
    num: row.num,
    action: row.action,
    decision: row.decision || "",
    owner: row.owner || "TBD / Unassigned",
    category: row.category,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date || "",
    meeting: row.meeting || "",
    notes: row.notes || "",
    linkedRules: row.linked_rules || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map component camelCase to database snake_case
function entryToDb(entry) {
  return {
    id: entry.id,
    num: entry.num,
    action: entry.action,
    decision: entry.decision || "",
    owner: entry.owner || "TBD / Unassigned",
    category: entry.category,
    priority: entry.priority,
    status: entry.status,
    due_date: entry.dueDate || "",
    meeting: entry.meeting || "",
    notes: entry.notes || "",
    linked_rules: entry.linkedRules || [],
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

const labelStyle = { fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 4, fontFamily: "sans-serif" };
const inputStyle = { width: "100%", padding: "8px 10px", border: `1.5px solid ${TC_BORDER}`, borderRadius: 6, fontSize: 14, fontFamily: "sans-serif", color: TC_CHARCOAL, background: "#FFF", boxSizing: "border-box" };
const selectStyle = { ...inputStyle, cursor: "pointer" };

export default function ActionsLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOwner, setFilterOwner] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [importMode, setImportMode] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [form, setForm] = useState({
    action: "", decision: "", owner: "TBD / Unassigned", category: "Strategy",
    priority: "Medium", status: "Not Started", dueDate: "", meeting: "", notes: "", linkedRules: []
  });

  const constitutionRules = entries.filter(e => e.category === "Constitution Rule");

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('action_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setEntries(data.map(dbToEntry));
    } catch (e) {
      console.error('Error loading entries:', e);
    }
    setLoading(false);
  }

  async function seedConstitutionRules() {
    const rules = [
      {
        action: "Board Resolutions — Passing Threshold",
        decision: "A resolution of the Board is passed if a majority of votes cast is in favour. The chairperson does NOT have a casting vote. (Constitution Schedule 2, clauses 34 & 33)",
        notes: "A Director present is presumed to have voted in favour unless they expressly abstain or dissent.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Board Quorum Requirement",
        decision: "A quorum is a majority of Directors entitled to vote. No business may be transacted without a quorum. If no quorum within 20 minutes, meeting adjourns automatically by 2 working days. (Schedule 2, clauses 27–29)",
        notes: "At the adjourned meeting, if still no quorum within 20 minutes, Directors present constitute a quorum.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Written Board Resolutions",
        decision: "A resolution signed or assented to in writing by ALL Directors entitled to vote is as valid as a resolution passed at a duly convened Board meeting. May be signed in counterparts including by email. A copy must be entered in the minute book. (Schedule 2, clauses 37–39)",
        notes: "This enables decisions to be made without a formal meeting if all Directors agree in writing.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Board Meeting Notice Requirements",
        decision: "At least 2 days' written notice required for Board meetings. In urgent cases, at least 2 business hours' notice is sufficient if the chairperson (or another Director in their absence) deems it necessary. Notice must specify date, time, place and participation method. (Schedule 2, clauses 24–25)",
        notes: "Notice can be delivered by hand, email, or to last known address. Irregularity in notice is waived if all Directors attend without protest.",
        category: "Constitution Rule", status: "Done", priority: "Medium", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Shareholder Decisions — Ordinary Resolutions",
        decision: "Ordinary resolutions require a simple majority (>50%) of votes cast. Used for: appointing/removing Directors, approving Director remuneration and certain payments. A written resolution signed by shareholders holding ≥75% of voting rights is valid in lieu of a meeting. (Clause 8.4, s122 Companies Act 1993)",
        notes: "Shareholders holding ≥5% of voting rights may requisition a special meeting.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Shareholder Decisions — Special Resolutions (75% threshold)",
        decision: "The following require approval of shareholders holding ≥75% of voting rights: transferring shares outside pre-emption rights (clause 5.10f); drag-along and tag-along rights triggers. The Companies Act 1993 also requires 75% for altering the constitution and certain major transactions.",
        notes: "Tag-along applies when ≥50% of voting rights are being sold. Drag-along applies when ≥75% of voting rights are being sold.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Board Powers vs Shareholder Powers",
        decision: "The Board manages all business and affairs of the Company and may exercise all Company powers not reserved to Shareholders. Board may delegate powers to committees, individual Directors, employees or other persons — except powers listed in the Second Schedule to the Companies Act 1993. (Clauses 50–53)",
        notes: "Shareholder approval required for: Director remuneration beyond expenses (clause 59), liquidation distributions in kind (clause 66), and matters reserved by the Act.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Appointment & Removal of Directors",
        decision: "Directors appointed or removed by: (a) written notice signed by shareholders holding >50% of voting rights, OR (b) ordinary resolution, OR (c) as provided in any shareholders' agreement. Maximum 7 Directors unless changed by >50% shareholder vote. (Clauses 41–44)",
        notes: "Alternate Directors can be appointed by any Director by written notice, subject to majority Board approval.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Interested Director — Conflict of Interest Rules",
        decision: "A Director who is interested in a transaction MAY still: vote on any matter relating to it, attend and be counted for quorum, sign documents on behalf of the Company. However, the Director must comply with s140 Companies Act 1993 disclosure requirements. (Clauses 57–58)",
        notes: "Failure to disclose does not affect validity of the contract or arrangement, but the Director remains personally liable.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Signing Authority — Contracts & Deeds",
        decision: "A deed on behalf of the Company may be signed by: (a) two or more Directors, OR (b) one Director (or other Board-authorised person) with a witnessed signature, OR (c) one or more attorneys appointed under s181 of the Act. (Clause 65)",
        notes: "The Board may appoint attorneys either generally or for specific matters.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Minutes — Keeping Requirements",
        decision: "The Board must ensure minutes are kept of all Board meeting proceedings. Minutes signed as correct by the chairperson are prima facie evidence of proceedings unless shown to be inaccurate. Written resolutions must also be entered in the minute book. (Schedule 2, clauses 36 & 39)",
        notes: "This applies to all Board meetings and written resolutions.",
        category: "Constitution Rule", status: "Done", priority: "Medium", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
      {
        action: "Pre-emptive Rights on Share Transfer",
        decision: "No shares may be transferred unless pre-emption rights (Schedule 3) have been exhausted — existing shareholders must be offered shares first at the proposed transfer price. Exceptions include: transfers to a Shareholder's own trust, intra-trust transfers, transfers approved in writing by holders of ≥75% voting rights, and drag-along/tag-along transfers. (Clauses 16–25, Schedule 3)",
        notes: "Board may refuse or delay registration of a transfer within 10 working days of receipt.",
        category: "Constitution Rule", status: "Done", priority: "High", owner: "Steve Braddock", meeting: "Constitution", dueDate: ""
      },
    ];

    const maxNum = entries.length > 0 ? Math.max(...entries.map(e => e.num || 0)) : 0;
    const now = new Date().toISOString();
    const newEntries = rules.map((r, i) => ({
      id: `constitution-${Date.now()}-${i}`,
      num: maxNum + i + 1,
      ...r,
      createdAt: now,
      updatedAt: now,
    }));

    const dbRows = newEntries.map(entryToDb);
    const { error } = await supabase.from('action_entries').insert(dbRows);
    if (error) console.error('Error seeding constitution rules:', error);
    await loadEntries();
  }

  function resetForm() {
    setForm({ action: "", decision: "", owner: "TBD / Unassigned", category: "Strategy", priority: "Medium", status: "Not Started", dueDate: "", meeting: "", notes: "", linkedRules: [] });
    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit() {
    if (!form.action.trim()) return;

    if (editId) {
      const { error } = await supabase
        .from('action_entries')
        .update({
          action: form.action,
          decision: form.decision,
          owner: form.owner,
          category: form.category,
          priority: form.priority,
          status: form.status,
          due_date: form.dueDate,
          meeting: form.meeting,
          notes: form.notes,
          linked_rules: form.linkedRules || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', editId);
      if (error) console.error('Error updating:', error);
    } else {
      const nextNum = entries.length > 0 ? Math.max(...entries.map(e => e.num || 0)) + 1 : 1;
      const now = new Date().toISOString();
      const newEntry = entryToDb({
        id: Date.now().toString(),
        num: nextNum,
        ...form,
        createdAt: now,
        updatedAt: now,
      });
      const { error } = await supabase.from('action_entries').insert(newEntry);
      if (error) console.error('Error inserting:', error);
    }
    await loadEntries();
    resetForm();
  }

  function handleEdit(entry) {
    setForm({ ...entry });
    setEditId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleStatusChange(id, status) {
    const { error } = await supabase
      .from('action_entries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error('Error updating status:', error);
    await loadEntries();
  }

  async function handleDelete(id) {
    const { error } = await supabase
      .from('action_entries')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting:', error);
    await loadEntries();
    setConfirmDeleteId(null);
  }

  const filtered = entries.filter(e => {
    if (filterStatus !== "All" && e.status !== filterStatus) return false;
    if (filterOwner !== "All" && e.owner !== filterOwner) return false;
    if (filterCategory !== "All" && e.category !== filterCategory) return false;
    if (search && !e.action.toLowerCase().includes(search.toLowerCase()) && !(e.meeting || "").toLowerCase().includes(search.toLowerCase()) && !(e.decision || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function exportPDF() {
    const toExport = filtered.length > 0 ? filtered : entries;
    const date = new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
    const open = entries.filter(e => e.status === "Not Started" || e.status === "In Progress").length;
    const done = entries.filter(e => e.status === "Done").length;
    const overdue = entries.filter(e => isOverdue(e.dueDate, e.status)).length;

    const statusDot = {
      "Not Started": "#4AABDB", "In Progress": "#8DC63F", "Done": "#2ECC7A",
      "Blocked": "#E84040", "Deferred": "#D4A820"
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>TradieCheck Actions & Decisions Log</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #3D3D3D; background: #fff; font-size: 11px; }
    .header { background: #3D3D3D; color: white; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #4AABDB; }
    .header-title { font-size: 16px; font-weight: bold; }
    .header-sub { font-size: 9px; color: #AAB8C2; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }
    .header-date { font-size: 9px; color: #AAB8C2; }
    .stats { display: flex; gap: 10px; padding: 14px 20px; background: #F5F8FA; border-bottom: 1px solid #D8E6EE; }
    .stat { flex: 1; background: white; border: 1px solid #D8E6EE; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
    .stat-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 20px; font-weight: bold; }
    .content { padding: 14px 20px; }
    .card { background: white; border: 1px solid #D8E6EE; border-radius: 6px; margin-bottom: 10px; padding: 10px 12px; page-break-inside: avoid; }
    .card-action { font-weight: bold; font-size: 11px; margin-bottom: 6px; }
    .card-decision { background: #F6FAF0; border-left: 3px solid #8DC63F; padding: 5px 8px; margin-bottom: 6px; font-size: 10px; color: #555; }
    .card-decision-label { font-weight: bold; color: #8DC63F; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; }
    .card-notes { font-size: 9px; color: #888; font-style: italic; margin-bottom: 6px; }
    .overdue-badge { display: inline-block; background: #FDE8E8; color: #B02020; font-size: 8px; font-weight: bold; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.05em; float: right; }
    .card-meta-table { width: 100%; border-collapse: collapse; margin-top: 8px; border-top: 1px solid #EEF2F5; }
    .meta-label { font-size: 8px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 8px 3px 0; white-space: nowrap; width: 60px; }
    .meta-value { font-size: 9px; color: #3D3D3D; padding: 3px 12px 3px 0; }
    .footer { background: #3D3D3D; color: #AAB8C2; padding: 8px 20px; display: flex; justify-content: space-between; font-size: 8px; margin-top: 20px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .card { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div><div class="header-title">TradieCheck — Actions & Decisions Log</div><div class="header-sub">Meeting Outcomes Tracker</div></div>
    <div class="header-date">Exported ${date}</div>
  </div>
  <div class="stats">
    <div class="stat"><span class="stat-label">Total</span><span class="stat-value" style="color:#3D3D3D">${entries.length}</span></div>
    <div class="stat"><span class="stat-label">Open</span><span class="stat-value" style="color:#4AABDB">${open}</span></div>
    <div class="stat"><span class="stat-label">Done</span><span class="stat-value" style="color:#8DC63F">${done}</span></div>
    <div class="stat"><span class="stat-label">Overdue</span><span class="stat-value" style="color:#E84040">${overdue}</span></div>
  </div>
  <div class="content">
    ${toExport.map(entry => {
      const over = isOverdue(entry.dueDate, entry.status);
      const dot = statusDot[entry.status] || "#3D3D3D";
      const priorityColor = entry.priority === "High" ? "#B02020" : entry.priority === "Medium" ? "#8A6A10" : "#555";
      return `<div class="card" style="border-left: 4px solid ${over ? "#E84040" : dot};">
        ${over ? '<div class="overdue-badge">OVERDUE</div>' : ""}
        <div class="card-action">${entry.num ? `<span style="background:#4AABDB;color:#fff;font-size:9px;font-weight:bold;padding:2px 6px;border-radius:3px;margin-right:6px">ACT-${String(entry.num).padStart(3,"0")}</span>` : ""}${entry.action}</div>
        ${entry.decision ? `<div class="card-decision"><span class="card-decision-label">Decision: </span>${entry.decision}</div>` : ""}
        ${entry.notes ? `<div class="card-notes">${entry.notes}</div>` : ""}
        <table class="card-meta-table">
          <tr><td class="meta-label">Status</td><td class="meta-value" style="color:${dot};font-weight:bold">${entry.status}</td><td class="meta-label">Priority</td><td class="meta-value" style="color:${priorityColor};font-weight:bold">${entry.priority}</td><td class="meta-label">Owner</td><td class="meta-value">${entry.owner}</td></tr>
          <tr><td class="meta-label">Due Date</td><td class="meta-value" style="color:${over ? "#E84040" : "#333"}">${entry.dueDate ? formatDate(entry.dueDate) : "—"}</td><td class="meta-label">Meeting</td><td class="meta-value">${entry.meeting || "—"}</td><td class="meta-label">Category</td><td class="meta-value">${entry.category || "—"}</td></tr>
        </table></div>`;
    }).join("")}
  </div>
  <div class="footer"><span>TradieCheck — Confidential Internal Use Only</span><span>${toExport.length} action${toExport.length !== 1 ? "s" : ""} exported</span></div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradieCheck_Actions_Log_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const CSV_COLUMNS = ["id", "num", "action", "decision", "owner", "category", "priority", "status", "dueDate", "meeting", "notes", "linkedRules", "createdAt", "updatedAt"];

  function escapeCsv(val) {
    if (val == null) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function exportCSV() {
    const header = CSV_COLUMNS.join(",");
    const rows = entries.map(e =>
      CSV_COLUMNS.map(col => {
        if (col === "linkedRules") return escapeCsv((e.linkedRules || []).join(";"));
        return escapeCsv(e[col]);
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradieCheck_Actions_Backup_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; } else { inQuotes = false; }
        } else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; } else if (ch === ",") { result.push(current); current = ""; } else { current += ch; }
      }
    }
    result.push(current);
    return result;
  }

  // Map CSV headers to internal field names
  const CSV_HEADER_MAP = {
    "ref": "num",
    "action": "action",
    "decision": "decision",
    "status": "status",
    "priority": "priority",
    "owner": "owner",
    "category": "category",
    "due date": "dueDate",
    "duedate": "dueDate",
    "meeting / source": "meeting",
    "meeting": "meeting",
    "notes": "notes",
    "linked constitution rules": "linkedRules",
    "linkedrules": "linkedRules",
    "created": "createdAt",
    "createdat": "createdAt",
    "updated": "updatedAt",
    "updatedat": "updatedAt",
    "id": "id",
    "num": "num",
  };

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { alert("CSV file appears empty."); return; }
        const headers = parseCsvLine(lines[0]);
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = parseCsvLine(lines[i]);
          const obj = {};
          headers.forEach((h, idx) => {
            const rawKey = h.trim();
            const key = CSV_HEADER_MAP[rawKey.toLowerCase()] || rawKey;
            let val = (vals[idx] || "").trim();
            if (key === "num") val = parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
            if (key === "linkedRules") val = val ? val.split(";").filter(Boolean) : [];
            if ((key === "createdAt" || key === "updatedAt" || key === "dueDate") && val) {
              // Convert DD/MM/YYYY to ISO format
              const parts = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
              if (parts) {
                if (key === "dueDate") val = `${parts[3]}-${parts[2].padStart(2,"0")}-${parts[1].padStart(2,"0")}`;
                else val = new Date(parts[3], parts[2] - 1, parts[1]).toISOString();
              }
            }
            obj[key] = val;
          });
          if (obj.action) rows.push(obj);
        }
        setImportPreview({ rows, filename: file.name });
      } catch (err) {
        alert("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function confirmImport(mode) {
    if (!importPreview) return;
    const now = new Date().toISOString();
    const incoming = importPreview.rows.map(r => ({
      ...r,
      id: r.id || `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      num: r.num || 0,
      createdAt: r.createdAt || now,
      updatedAt: r.updatedAt || now,
    }));

    if (mode === "replace") {
      // Delete all existing entries, then insert new ones
      const { error: deleteError } = await supabase.from('action_entries').delete().neq('id', '');
      if (deleteError) console.error('Error clearing entries:', JSON.stringify(deleteError));
      const dbRows = incoming.map(entryToDb);
      const { error: insertError } = await supabase.from('action_entries').insert(dbRows);
      if (insertError) console.error('Error importing entries:', insertError);
    } else {
      // Merge: upsert all incoming entries
      const dbRows = incoming.map(entryToDb);
      const { error } = await supabase.from('action_entries').upsert(dbRows);
      if (error) console.error('Error merging entries:', JSON.stringify(error));
    }
    await loadEntries();
    setImportPreview(null);
    setImportMode(null);
  }

  const counts = {
    total: entries.length,
    open: entries.filter(e => e.status === "Not Started" || e.status === "In Progress").length,
    done: entries.filter(e => e.status === "Done").length,
    overdue: entries.filter(e => isOverdue(e.dueDate, e.status)).length,
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: TC_LIGHT_BG, color: TC_CHARCOAL }}>
      {/* Header */}
      <div style={{ background: "#FFF", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `4px solid ${TC_BLUE}`, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: TC_BLUE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#FFF", fontFamily: "sans-serif" }}>TC</div>
          <div style={{ borderLeft: `2px solid ${TC_BLUE}`, paddingLeft: 16 }}>
            <div style={{ color: TC_CHARCOAL, fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" }}>Actions & Decisions Log</div>
            <div style={{ color: "#888", fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Meeting Outcomes Tracker</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={exportCSV} title="Download CSV backup" style={{ background: "transparent", color: TC_CHARCOAL, border: `2px solid ${TC_GREEN}`, borderRadius: 6, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            💾 Backup CSV
          </button>
          <label title="Import CSV backup" style={{ background: "transparent", color: TC_CHARCOAL, border: `2px solid ${TC_BLUE}`, borderRadius: 6, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            📂 Import CSV
            <input type="file" accept=".csv" onChange={handleFileSelect} style={{ display: "none" }} />
          </label>
          <button onClick={exportPDF} style={{ background: "transparent", color: TC_CHARCOAL, border: `2px solid ${TC_BORDER}`, borderRadius: 6, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            ↓ Export Report
          </button>
          <button onClick={seedConstitutionRules} style={{ background: "transparent", color: TC_CHARCOAL, border: `2px solid ${TC_GREEN}`, borderRadius: 6, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            📋 Load Constitution Rules
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} style={{ background: TC_GREEN, color: "#FFF", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Action
          </button>
        </div>
      </div>

      {/* Import Preview Modal */}
      {importPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#FFF", borderRadius: 12, padding: 28, maxWidth: 560, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: TC_CHARCOAL, marginBottom: 6 }}>Import CSV</div>
            <div style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif", marginBottom: 16 }}>
              <strong>{importPreview.filename}</strong> — {importPreview.rows.length} action{importPreview.rows.length !== 1 ? "s" : ""} found
            </div>
            <div style={{ background: TC_LIGHT_BG, border: `1px solid ${TC_BORDER}`, borderRadius: 8, padding: 14, marginBottom: 20, maxHeight: 200, overflowY: "auto" }}>
              {importPreview.rows.slice(0, 8).map((r, i) => (
                <div key={i} style={{ fontSize: 12, fontFamily: "sans-serif", padding: "4px 0", borderBottom: i < Math.min(importPreview.rows.length, 8) - 1 ? `1px solid ${TC_BORDER}` : "none", color: TC_CHARCOAL }}>
                  <span style={{ background: TC_BLUE, color: "#FFF", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, marginRight: 6 }}>ACT-{String(r.num || i + 1).padStart(3, "0")}</span>
                  {r.action}
                </div>
              ))}
              {importPreview.rows.length > 8 && (
                <div style={{ fontSize: 11, color: "#888", fontFamily: "sans-serif", padding: "6px 0 0" }}>…and {importPreview.rows.length - 8} more</div>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TC_CHARCOAL, fontFamily: "sans-serif", marginBottom: 10 }}>How would you like to import?</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button onClick={() => confirmImport("replace")} style={{ flex: 1, background: "#FDE8E8", color: "#B02020", border: "2px solid #F5A5A5", borderRadius: 8, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13 }}>
                🔄 Replace All<br /><span style={{ fontWeight: 400, fontSize: 11 }}>Wipe existing, load CSV only</span>
              </button>
              <button onClick={() => confirmImport("merge")} style={{ flex: 1, background: "#EDF6FC", color: "#2A7DAF", border: `2px solid ${TC_BLUE}`, borderRadius: 8, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13 }}>
                🔀 Merge<br /><span style={{ fontWeight: 400, fontSize: 11 }}>Add new, update matching IDs</span>
              </button>
            </div>
            <button onClick={() => { setImportPreview(null); setImportMode(null); }} style={{ width: "100%", background: "transparent", color: "#666", border: `1.5px solid ${TC_BORDER}`, borderRadius: 6, padding: "10px 16px", cursor: "pointer", fontFamily: "sans-serif", fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", value: counts.total, color: TC_CHARCOAL },
            { label: "Open", value: counts.open, color: TC_BLUE },
            { label: "Done", value: counts.done, color: TC_GREEN },
            { label: "Overdue", value: counts.overdue, color: "#E84040" },
          ].map(s => (
            <div key={s.label} style={{ background: "#FFF", border: `1px solid ${TC_BORDER}`, borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 13, color: "#888", fontFamily: "sans-serif" }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "sans-serif", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: "#FFF", border: `1.5px solid ${TC_BLUE}`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: TC_CHARCOAL, borderBottom: `2px solid ${TC_GREEN}`, paddingBottom: 10 }}>{editId ? "Edit Action" : "New Action / Decision"}</div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Action Item *</label>
              <textarea value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} placeholder="What needs to be done?" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Decision Made (if applicable)</label>
              <textarea value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))} placeholder="What was decided?" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Owner</label>
                <select value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} style={selectStyle}>
                  {OWNERS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={selectStyle}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={selectStyle}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={selectStyle}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Meeting / Source</label>
                <input type="text" value={form.meeting} onChange={e => setForm(f => ({ ...f, meeting: e.target.value }))} placeholder="e.g. Weekly Sync 27 Feb" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional context..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            {constitutionRules.length > 0 && form.category !== "Constitution Rule" && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Link to Constitution Rule(s)</label>
                <div style={{ border: `1.5px solid ${TC_BORDER}`, borderRadius: 6, background: "#FAFCFE", padding: 10, maxHeight: 200, overflowY: "auto" }}>
                  {constitutionRules.map(rule => {
                    const linked = (form.linkedRules || []).includes(rule.id);
                    return (
                      <div key={rule.id} onClick={() => {
                        const current = form.linkedRules || [];
                        setForm(f => ({ ...f, linkedRules: linked ? current.filter(id => id !== rule.id) : [...current, rule.id] }));
                      }} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 8px", borderRadius: 5, cursor: "pointer", background: linked ? "#EDF6FC" : "transparent", marginBottom: 2, border: linked ? `1px solid ${TC_BLUE}` : "1px solid transparent" }}>
                        <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${linked ? TC_BLUE : "#CCC"}`, background: linked ? TC_BLUE : "#FFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          {linked && <span style={{ color: "#FFF", fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: TC_CHARCOAL, fontFamily: "sans-serif" }}>{rule.action}</div>
                          <div style={{ fontSize: 11, color: "#888", fontFamily: "sans-serif", marginTop: 1 }}>{(rule.decision || "").slice(0, 100)}{(rule.decision || "").length > 100 ? "…" : ""}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {(form.linkedRules || []).length > 0 && (
                  <div style={{ fontSize: 11, color: TC_BLUE, fontFamily: "sans-serif", marginTop: 4 }}>{(form.linkedRules || []).length} rule{(form.linkedRules || []).length !== 1 ? "s" : ""} linked</div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} style={{ background: TC_CHARCOAL, color: "#FFF", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 14 }}>
                {editId ? "Save Changes" : "Add Action"}
              </button>
              <button onClick={resetForm} style={{ background: "transparent", color: "#666", border: `1.5px solid ${TC_BORDER}`, borderRadius: 6, padding: "10px 16px", cursor: "pointer", fontFamily: "sans-serif", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions, decisions, meetings…" style={{ ...inputStyle, width: 260, flex: "none" }} />
          {[
            { label: "Status", value: filterStatus, set: setFilterStatus, opts: ["All", ...STATUSES] },
            { label: "Owner", value: filterOwner, set: setFilterOwner, opts: ["All", ...OWNERS] },
            { label: "Category", value: filterCategory, set: setFilterCategory, opts: ["All", ...CATEGORIES] },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)} style={{ ...selectStyle, width: "auto", flex: "none", paddingRight: 28 }}>
              {f.opts.map(o => <option key={o}>{o === "All" ? (f.label === "Status" ? "All Statuses" : f.label === "Category" ? "All Categories" : `All ${f.label}s`) : o}</option>)}
            </select>
          ))}
          <div style={{ fontSize: 13, color: "#888", fontFamily: "sans-serif", marginLeft: "auto" }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888", fontFamily: "sans-serif" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ color: "#888", fontFamily: "sans-serif", fontSize: 15 }}>
              {entries.length === 0 ? "No actions yet. Add your first one!" : "No results match your filters."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(entry => {
              const sc = STATUS_COLORS[entry.status] || STATUS_COLORS["Not Started"];
              const pc = PRIORITY_COLORS[entry.priority] || PRIORITY_COLORS["Medium"];
              const overdue = isOverdue(entry.dueDate, entry.status);
              return (
                <div key={entry.id} style={{ background: "#FFF", border: `1.5px solid ${overdue ? "#F5A5A5" : TC_BORDER}`, borderRadius: 10, padding: "16px 20px", borderLeft: `4px solid ${overdue ? "#E84040" : sc.dot}` }}>
                  {overdue && <div style={{ float: "right", background: "#FDE8E8", color: "#B02020", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontFamily: "sans-serif", letterSpacing: "0.05em" }}>OVERDUE</div>}

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                      {entry.num && <span style={{ background: TC_BLUE, color: "#FFF", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: "sans-serif", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>ACT-{String(entry.num).padStart(3, "0")}</span>}
                      <div style={{ fontSize: 15, fontWeight: 700, color: TC_CHARCOAL }}>{entry.action}</div>
                    </div>
                    {entry.decision && (
                      <div style={{ fontSize: 13, color: "#555", fontFamily: "sans-serif", borderLeft: `3px solid ${TC_GREEN}`, paddingLeft: 10, background: "#F6FAF0", borderRadius: "0 4px 4px 0", padding: "6px 10px", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: TC_GREEN, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Decision: </span>{entry.decision}
                      </div>
                    )}
                    {entry.notes && <div style={{ fontSize: 13, color: "#888", fontFamily: "sans-serif", marginTop: 4 }}>{entry.notes}</div>}

                    {entry.linkedRules && entry.linkedRules.length > 0 && (() => {
                      const linked = entry.linkedRules.map(id => entries.find(e => e.id === id)).filter(Boolean);
                      if (!linked.length) return null;
                      return (
                        <div style={{ marginTop: 10, background: "#F0F7FC", border: `1px solid #C8E0EE`, borderRadius: 6, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: TC_BLUE, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "sans-serif", marginBottom: 6 }}>⚖️ Constitution Requirements</div>
                          {linked.map(rule => (
                            <div key={rule.id} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid #D8EDFB` }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: TC_CHARCOAL, fontFamily: "sans-serif" }}>{rule.action}</div>
                              <div style={{ fontSize: 11, color: "#555", fontFamily: "sans-serif", marginTop: 2 }}>{rule.decision}</div>
                              {rule.notes && <div style={{ fontSize: 10, color: "#888", fontFamily: "sans-serif", fontStyle: "italic", marginTop: 2 }}>{rule.notes}</div>}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <select value={entry.status} onChange={e => handleStatusChange(entry.id, e.target.value)} style={{ background: sc.bg, color: sc.text, border: "none", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>

                    <span style={{ background: pc.bg, color: pc.text, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, fontFamily: "sans-serif" }}>{entry.priority}</span>

                    <span style={{ fontSize: 12, color: "#555", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                      <span>👤</span> {entry.owner}
                    </span>

                    {entry.dueDate && (
                      <span style={{ fontSize: 12, color: overdue ? "#E84040" : "#666", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4, fontWeight: overdue ? 700 : 400 }}>
                        <span>📅</span> {formatDate(entry.dueDate)}
                      </span>
                    )}

                    {entry.meeting && (
                      <span style={{ fontSize: 12, color: TC_BLUE, fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                        <span>📋</span> {entry.meeting}
                      </span>
                    )}

                    <span style={{ fontSize: 11, color: "#888", fontFamily: "sans-serif", background: "#EDF2F5", padding: "3px 8px", borderRadius: 4 }}>{entry.category}</span>

                    <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={() => handleEdit(entry)} style={{ background: "transparent", border: `1px solid ${TC_BORDER}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif", color: TC_CHARCOAL }}>Edit</button>
                      {confirmDeleteId === entry.id ? (
                        <>
                          <span style={{ fontSize: 12, fontFamily: "sans-serif", color: "#E84040" }}>Sure?</span>
                          <button onClick={() => handleDelete(entry.id)} style={{ background: "#E84040", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif", color: "#FFF", fontWeight: 700 }}>Yes</button>
                          <button onClick={() => setConfirmDeleteId(null)} style={{ background: "transparent", border: `1px solid ${TC_BORDER}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif", color: "#666" }}>No</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(entry.id)} style={{ background: "transparent", border: "1px solid #F5A5A5", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif", color: "#E84040" }}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
