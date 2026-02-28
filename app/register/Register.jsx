'use client'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const CATEGORIES = ["Strategy", "Product", "Legal/Regulatory", "Marketing", "Financial", "Operations", "Technology", "Other"];
const TYPES = ["Idea", "Issue"];
const STATUSES = ["Open", "In Progress", "Resolved", "Parked"];

// TradieCheck brand colours (matching Actions Log)
const TC_CHARCOAL = "#3D3D3D";
const TC_BLUE = "#4AABDB";
const TC_GREEN = "#8DC63F";
const TC_LIGHT_BG = "#F5F8FA";
const TC_BORDER = "#D8E6EE";

const STATUS_COLORS = {
  "Open": { bg: "#EDF6FC", text: "#2A7DAF", dot: TC_BLUE },
  "In Progress": { bg: "#EEF7E1", text: "#5A8A1F", dot: TC_GREEN },
  "Resolved": { bg: "#D6F0E3", text: "#1B7A4A", dot: "#2ECC7A" },
  "Parked": { bg: "#F5F0E0", text: "#8A6A10", dot: "#D4A820" },
};

const TYPE_COLORS = {
  "Idea": { bg: "#EDF6FC", text: "#2A7DAF", border: TC_BLUE },
  "Issue": { bg: "#FDE8E8", text: "#B02020", border: "#E84040" },
};

const PRIORITY_COLORS = {
  "High":   { bg: "#FDE8E8", text: "#B02020" },
  "Medium": { bg: "#FFF3CD", text: "#8A6A10" },
  "Low":    { bg: "#F0F0F0", text: "#555" },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

const labelStyle = { fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 4, fontFamily: "sans-serif" };
const inputStyle = { width: "100%", padding: "8px 10px", border: `1.5px solid ${TC_BORDER}`, borderRadius: 6, fontSize: 14, fontFamily: "sans-serif", color: TC_CHARCOAL, background: "#FFF", boxSizing: "border-box" };

export default function Register() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    type: "Idea", title: "", description: "", category: "Strategy", status: "Open", priority: "Medium", tags: ""
  });

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('register_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setEntries(data);
    } catch (e) {
      console.error('Error loading entries:', e);
    }
    setLoading(false);
  }

  function resetForm() {
    setForm({ type: "Idea", title: "", description: "", category: "Strategy", status: "Open", priority: "Medium", tags: "" });
    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit() {
    if (!form.title.trim()) return;
    const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);

    if (editId) {
      const { error } = await supabase
        .from('register_entries')
        .update({
          type: form.type,
          title: form.title,
          description: form.description,
          category: form.category,
          status: form.status,
          priority: form.priority,
          tags: tagsArray,
          updated_at: new Date().toISOString()
        })
        .eq('id', editId);
      if (error) console.error('Error updating:', error);
    } else {
      const newEntry = {
        id: Date.now().toString(),
        type: form.type,
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        priority: form.priority,
        tags: tagsArray,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('register_entries')
        .insert(newEntry);
      if (error) console.error('Error inserting:', error);
    }
    await loadEntries();
    resetForm();
  }

  function handleEdit(entry) {
    setForm({ ...entry, tags: (entry.tags || []).join(", ") });
    setEditId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleStatusChange(id, status) {
    const { error } = await supabase
      .from('register_entries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error('Error updating status:', error);
    await loadEntries();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this entry?")) return;
    const { error } = await supabase
      .from('register_entries')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting:', error);
    await loadEntries();
  }

  const filtered = entries.filter(e => {
    if (filterType !== "All" && e.type !== filterType) return false;
    if (filterStatus !== "All" && e.status !== filterStatus) return false;
    if (filterCategory !== "All" && e.category !== filterCategory) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !(e.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { ideas: entries.filter(e => e.type === "Idea").length, issues: entries.filter(e => e.type === "Issue").length, open: entries.filter(e => e.status === "Open").length, resolved: entries.filter(e => e.status === "Resolved").length };

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: TC_LIGHT_BG, color: TC_CHARCOAL }}>
      {/* Header */}
      <div style={{ background: "#FFF", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `4px solid ${TC_BLUE}`, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: TC_BLUE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#FFF", fontFamily: "sans-serif" }}>TC</div>
          <div style={{ borderLeft: `2px solid ${TC_BLUE}`, paddingLeft: 16 }}>
            <div style={{ color: TC_CHARCOAL, fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" }}>Ideas & Issues Register</div>
            <div style={{ color: "#888", fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>TradieCheck Internal</div>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ background: TC_GREEN, color: "#FFF", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Entry
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Ideas", value: counts.ideas, color: TC_BLUE },
            { label: "Issues", value: counts.issues, color: "#E84040" },
            { label: "Open", value: counts.open, color: "#D4A820" },
            { label: "Resolved", value: counts.resolved, color: TC_GREEN },
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
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: TC_CHARCOAL, borderBottom: `2px solid ${TC_GREEN}`, paddingBottom: 10 }}>{editId ? "Edit Entry" : "New Entry"}</div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    padding: "6px 16px", borderRadius: 6,
                    border: `2px solid ${form.type === t ? TYPE_COLORS[t].border : TC_BORDER}`,
                    background: form.type === t ? TYPE_COLORS[t].bg : "#FFF",
                    color: form.type === t ? TYPE_COLORS[t].text : "#999",
                    fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief, descriptive title..." style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Context, detail, proposed solution..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. seed round, launch" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} style={{ background: TC_CHARCOAL, color: "#FFF", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 14 }}>{editId ? "Save Changes" : "Add to Register"}</button>
              <button onClick={resetForm} style={{ background: "transparent", color: "#666", border: `1.5px solid ${TC_BORDER}`, borderRadius: 6, padding: "10px 24px", fontFamily: "sans-serif", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." style={{ ...inputStyle, width: 220, flex: "none" }} />
          <FilterChips label="Type" options={["All", ...TYPES]} value={filterType} onChange={setFilterType} />
          <FilterChips label="Status" options={["All", ...STATUSES]} value={filterStatus} onChange={setFilterStatus} />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, width: "auto", flex: "none", paddingRight: 28 }}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ fontSize: 13, color: "#888", fontFamily: "sans-serif", marginLeft: "auto" }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {/* Entries */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888", fontFamily: "sans-serif" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
            <div style={{ color: "#888", fontFamily: "sans-serif", fontSize: 15 }}>
              {entries.length === 0 ? "Nothing yet — add your first idea or issue above." : "No entries match your filters."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(entry => <EntryCard key={entry.id} entry={entry} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryCard({ entry, onEdit, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const tc = TYPE_COLORS[entry.type];
  const sc = STATUS_COLORS[entry.status];
  const pc = PRIORITY_COLORS[entry.priority] || PRIORITY_COLORS["Medium"];

  return (
    <div style={{ background: "#FFF", border: `1.5px solid ${TC_BORDER}`, borderLeft: `4px solid ${tc.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={() => setExpanded(x => !x)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 2 }}>
          <span style={{ background: tc.bg, color: tc.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: "sans-serif", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{entry.type.toUpperCase()}</span>
          <span style={{ background: pc.bg, color: pc.text, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, fontFamily: "sans-serif" }}>{entry.priority}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: TC_CHARCOAL, letterSpacing: "-0.2px" }}>{entry.title}</span>
            <span style={{ fontSize: 11, color: "#888", fontFamily: "sans-serif", background: "#EDF2F5", padding: "3px 8px", borderRadius: 4 }}>{entry.category}</span>
          </div>
          {entry.description && !expanded && (
            <div style={{ fontSize: 13, color: "#666", marginTop: 3, fontFamily: "sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>{entry.description}</div>
          )}
          {(entry.tags || []).length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {(entry.tags || []).map(t => <span key={t} style={{ background: "#EDF6FC", color: TC_BLUE, fontSize: 11, padding: "2px 8px", borderRadius: 20, fontFamily: "sans-serif" }}>#{t}</span>)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />{entry.status}
          </span>
          <span style={{ fontSize: 11, color: "#AAA", fontFamily: "sans-serif", whiteSpace: "nowrap" }}>{formatDate(entry.created_at)}</span>
          <span style={{ color: "#CCC", fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${TC_BORDER}`, padding: "14px 20px 14px 52px" }}>
          {entry.description && <p style={{ margin: "0 0 14px", fontSize: 14, color: "#444", lineHeight: 1.6, fontFamily: "sans-serif" }}>{entry.description}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", marginRight: 4 }}>Move to:</span>
            {STATUSES.filter(s => s !== entry.status).map(s => (
              <button key={s} onClick={() => onStatusChange(entry.id, s)} style={{ background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text, border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600 }}>{s}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => onEdit(entry)} style={{ background: "transparent", border: `1px solid ${TC_BORDER}`, borderRadius: 5, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", color: TC_CHARCOAL }}>Edit</button>
            <button onClick={() => onDelete(entry.id)} style={{ background: "transparent", border: "1px solid #F5A5A5", borderRadius: 5, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", color: "#E84040" }}>Delete</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#BBB", fontFamily: "sans-serif" }}>
            Created {formatDate(entry.created_at)} · Updated {formatDate(entry.updated_at)}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChips({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${value === o ? TC_CHARCOAL : TC_BORDER}`, background: value === o ? TC_CHARCOAL : "#FFF", color: value === o ? "#FFF" : "#555", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: value === o ? 600 : 400, whiteSpace: "nowrap" }}>{o}</button>
      ))}
    </div>
  );
}
