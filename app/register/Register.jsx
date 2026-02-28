'use client'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const CATEGORIES = ["Strategy", "Product", "Legal/Regulatory", "Marketing", "Financial", "Operations", "Technology", "Other"];
const TYPES = ["Idea", "Issue"];
const STATUSES = ["Open", "In Progress", "Resolved", "Parked"];

const STATUS_COLORS = {
  "Open": { bg: "#FFF3CD", text: "#92640A", dot: "#F59E0B" },
  "In Progress": { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  "Resolved": { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  "Parked": { bg: "#F3F4F6", text: "#4B5563", dot: "#9CA3AF" },
};

const TYPE_COLORS = {
  "Idea": { bg: "#EDE9FE", text: "#5B21B6", border: "#8B5CF6" },
  "Issue": { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

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
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#FAFAF7", color: "#1C1C1A" }}>
      {/* Header */}
      <div style={{ background: "#1C1C1A", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, background: "#E8FF4A", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#1C1C1A", fontFamily: "sans-serif" }}>TC</div>
          <div>
            <div style={{ color: "#FFF", fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>TradieCheck</div>
            <div style={{ color: "#888", fontSize: 12, fontFamily: "sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>Ideas & Issues Register</div>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ background: "#E8FF4A", color: "#1C1C1A", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Entry
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Ideas", value: counts.ideas, color: "#8B5CF6" },
            { label: "Issues", value: counts.issues, color: "#EF4444" },
            { label: "Open", value: counts.open, color: "#F59E0B" },
            { label: "Resolved", value: counts.resolved, color: "#10B981" },
          ].map(s => (
            <div key={s.label} style={{ background: "#FFF", border: "1px solid #E8E8E3", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif" }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: "#FFF", border: "1px solid #E8E8E3", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>{editId ? "Edit Entry" : "New Entry"}</div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    padding: "6px 16px", borderRadius: 6,
                    border: `2px solid ${form.type === t ? TYPE_COLORS[t].border : "#E8E8E3"}`,
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
              <button onClick={handleSubmit} style={{ background: "#1C1C1A", color: "#FFF", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: 14 }}>{editId ? "Save Changes" : "Add to Register"}</button>
              <button onClick={resetForm} style={{ background: "transparent", color: "#666", border: "1px solid #E8E8E3", borderRadius: 6, padding: "10px 24px", fontFamily: "sans-serif", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." style={{ ...inputStyle, maxWidth: 220, margin: 0 }} />
          <FilterChips label="Type" options={["All", ...TYPES]} value={filterType} onChange={setFilterType} />
          <FilterChips label="Status" options={["All", ...STATUSES]} value={filterStatus} onChange={setFilterStatus} />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, maxWidth: 160, margin: 0 }}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Entries */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999", fontFamily: "sans-serif" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999", fontFamily: "sans-serif" }}>
            {entries.length === 0 ? "Nothing yet — add your first idea or issue above." : "No entries match your filters."}
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
  const priorityColors = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981" };

  return (
    <div style={{ background: "#FFF", border: "1px solid #E8E8E3", borderLeft: `4px solid ${tc.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={() => setExpanded(x => !x)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 2 }}>
          <span style={{ background: tc.bg, color: tc.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: "sans-serif", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{entry.type.toUpperCase()}</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColors[entry.priority] }} title={`${entry.priority} priority`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" }}>{entry.title}</span>
            <span style={{ fontSize: 11, color: "#888", fontFamily: "sans-serif" }}>{entry.category}</span>
          </div>
          {entry.description && !expanded && (
            <div style={{ fontSize: 13, color: "#666", marginTop: 3, fontFamily: "sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>{entry.description}</div>
          )}
          {(entry.tags || []).length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {(entry.tags || []).map(t => <span key={t} style={{ background: "#F3F4F6", color: "#4B5563", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontFamily: "sans-serif" }}>#{t}</span>)}
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
        <div style={{ borderTop: "1px solid #F0F0EB", padding: "14px 18px 14px 52px" }}>
          {entry.description && <p style={{ margin: "0 0 14px", fontSize: 14, color: "#444", lineHeight: 1.6, fontFamily: "sans-serif" }}>{entry.description}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", marginRight: 4 }}>Move to:</span>
            {STATUSES.filter(s => s !== entry.status).map(s => (
              <button key={s} onClick={() => onStatusChange(entry.id, s)} style={{ background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text, border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600 }}>{s}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => onEdit(entry)} style={{ background: "transparent", border: "1px solid #E8E8E3", borderRadius: 4, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", color: "#555" }}>Edit</button>
            <button onClick={() => onDelete(entry.id)} style={{ background: "transparent", border: "1px solid #FCA5A5", borderRadius: 4, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", color: "#EF4444" }}>Delete</button>
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
        <button key={o} onClick={() => onChange(o)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${value === o ? "#1C1C1A" : "#E8E8E3"}`, background: value === o ? "#1C1C1A" : "#FFF", color: value === o ? "#FFF" : "#555", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: value === o ? 600 : 400, whiteSpace: "nowrap" }}>{o}</button>
      ))}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #E8E8E3", borderRadius: 6, fontFamily: "sans-serif", fontSize: 13, color: "#1C1C1A", background: "#FAFAF7", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11, color: "#888", marginBottom: 5, fontFamily: "sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" };
