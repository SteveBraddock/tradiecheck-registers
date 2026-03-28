export default function PageHeader({ title, subtitle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '20px 28px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E0EAF0',
    }}>
      <img
        src="/TradieCheckLogo_transparent.png"
        alt="TradieCheck"
        style={{ height: 52, flexShrink: 0 }}
      />
      <div style={{ width: 1, height: 52, background: '#D0DDE6', flexShrink: 0 }} />
      <div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#8899AA', marginBottom: 3, letterSpacing: '0.02em' }}>{subtitle}</div>
        )}
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0A1520' }}>{title}</div>
      </div>
    </div>
  )
}
