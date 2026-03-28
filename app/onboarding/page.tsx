import Link from 'next/link'
import Image from 'next/image'

const CARD_STYLE = {
  display: 'block',
  background: '#FFF',
  border: '2px solid #D8E6EE',
  borderRadius: 12,
  padding: '24px 32px',
  textDecoration: 'none',
  color: '#3D3D3D',
  minWidth: 200,
} as const

const cards = [
  { href: '/register',   emoji: '💡',  title: 'Ideas & Issues',     sub: 'Register'       },
  { href: '/actions',    emoji: '📋',  title: 'Actions & Decisions', sub: 'Log'            },
  { href: '/ecosystem',  emoji: '🗺️', title: 'Product Ecosystem',   sub: 'Map'            },
  { href: '/roadmap',    emoji: '📅',  title: 'Product Roadmap',     sub: 'Phase timeline' },
  { href: '/onboarding', emoji: '🛡️', title: 'Mock Onboarding',     sub: 'Path A — Company / Trust' },
]

export default function Home() {
  return (
    <div style={{
      fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif",
      minHeight: '100vh',
      background: '#F5F8FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <Image
          src="/TradieCheckLogo_transparent.png"
          alt="TradieCheck"
          width={200}
          height={80}
          style={{ display: 'block', margin: '0 auto 20px', height: 80, width: 'auto' }}
          priority
        />
        <p style={{ color: '#888', marginBottom: 40, fontSize: 15 }}>Internal Registers</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {cards.map(card => (
            <Link key={card.href} href={card.href} style={CARD_STYLE}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{card.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{card.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
