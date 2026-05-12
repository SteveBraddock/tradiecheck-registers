import Link from "next/link";
 
const TILES = [
  { href: "/register",  icon: "💡", title: "Ideas & Issues",     sub: "Register" },
  { href: "/actions",   icon: "📋", title: "Actions & Decisions", sub: "Log" },
  { href: "/ecosystem", icon: "🗺️", title: "Product Ecosystem",  sub: "Map" },
  { href: "/roadmap",   icon: "📅", title: "Product Roadmap",     sub: "Phase timeline" },
  { href: '/onboarding', icon: '🗺️', title: 'Mock Onboarding', sub: 'Path A - Company / Trust' },
  { href: '/platform-v2-1.html', icon: '🏗️', title: 'Platform v2.1', sub: 'Interactive prototype', external: true },
];
 
export default function Home() {
  const tileStyle = {
    display: "block",
    background: "#FFF",
    border: "2px solid #D8E6EE",
    borderRadius: 12,
    padding: "24px 32px",
    textDecoration: "none",
    color: "#3D3D3D",
    minWidth: 200,
  };
  return (
    <div style={{
      fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif",
      minHeight: "100vh",
      background: "#F5F8FA",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <img
          src="/TradieCheckLogo_transparent.png"
          alt="TradieCheck"
          style={{ display: "block", margin: "0 auto 20px", height: 80 }}
        />
        <p style={{ color: "#888", marginBottom: 40, fontSize: 15 }}>Internal Registers</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {TILES.map(t => {
            const inner = (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{t.sub}</div>
              </>
            );
            return t.external
              ? <a key={t.href} href={t.href} target="_blank" rel="noopener noreferrer" style={tileStyle}>{inner}</a>
              : <Link key={t.href} href={t.href} style={tileStyle}>{inner}</Link>;
          })}
        </div>
      </div>
    </div>
  );
}
