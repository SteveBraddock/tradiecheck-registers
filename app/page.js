import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#F5F8FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <img src="/logo.png" alt="TradieCheck" style={{ display: "block", margin: "0 auto 20px", height: 80 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#3D3D3D", marginBottom: 8 }}>TradieCheck</h1>
        <p style={{ color: "#888", marginBottom: 40, fontSize: 15 }}>Internal Registers</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/register" style={{ display: "block", background: "#FFF", border: "2px solid #D8E6EE", borderRadius: 12, padding: "24px 32px", textDecoration: "none", color: "#3D3D3D", minWidth: 200 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💡</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Ideas & Issues</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Register</div>
          </Link>
          <Link href="/actions" style={{ display: "block", background: "#FFF", border: "2px solid #D8E6EE", borderRadius: 12, padding: "24px 32px", textDecoration: "none", color: "#3D3D3D", minWidth: 200 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Actions & Decisions</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Log</div>
          </Link>
        </div>
      </div>
    </div>
  )
}