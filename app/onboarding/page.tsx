'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

// ── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Colours ─────────────────────────────────────────────────────────────────
const C = {
  blue: '#1E90D4',
  blueDark: '#0B6DAA',
  blueLight: '#E6F1FB',
  green: '#6DBE45',
  greenDark: '#3E7A22',
  greenLight: '#EEF7E8',
  red: '#DC2626',
  redLight: '#FEE2E2',
  orange: '#E87722',
  orangeLight: '#FEF3E8',
  grey: '#F5F8FA',
  border: '#D8E6EE',
  text: '#1a1a1a',
  muted: '#64748B',
  white: '#FFFFFF',
}

// ── Trade categories (licensed & unlicensed) ─────────────────────────────────
const TRADE_CATEGORIES: { group: string; trades: { id: string; label: string; licensed: boolean; regulator?: string }[] }[] = [
  {
    group: 'Electrical',
    trades: [
      { id: 'elec_residential', label: 'Residential Electrical', licensed: true, regulator: 'EWRB' },
      { id: 'elec_commercial', label: 'Commercial Electrical', licensed: true, regulator: 'EWRB' },
      { id: 'elec_hvac', label: 'Electrical — HVAC/Mechanical', licensed: true, regulator: 'EWRB' },
    ],
  },
  {
    group: 'Plumbing, Gasfitting & Drainlaying',
    trades: [
      { id: 'plumb_plumbing', label: 'Plumbing', licensed: true, regulator: 'PGDB' },
      { id: 'plumb_gas_natural', label: 'Gasfitting — Natural Gas', licensed: true, regulator: 'PGDB' },
      { id: 'plumb_gas_lpg', label: 'Gasfitting — LPG', licensed: true, regulator: 'PGDB' },
      { id: 'plumb_drain', label: 'Drainlaying', licensed: true, regulator: 'PGDB' },
    ],
  },
  {
    group: 'Building & Construction',
    trades: [
      { id: 'build_carpentry', label: 'Carpentry', licensed: true, regulator: 'LBP' },
      { id: 'build_site', label: 'Site (General Building)', licensed: true, regulator: 'LBP' },
      { id: 'build_design', label: 'Residential Design', licensed: true, regulator: 'LBP' },
      { id: 'build_foundation', label: 'Foundation & Concrete', licensed: true, regulator: 'LBP' },
      { id: 'build_roofing', label: 'Roofing', licensed: true, regulator: 'LBP' },
      { id: 'build_ext_plaster', label: 'External Plastering / Cladding', licensed: true, regulator: 'LBP' },
      { id: 'build_brick', label: 'Brick & Blocklaying', licensed: true, regulator: 'LBP' },
      { id: 'build_reno', label: 'Renovations & Alterations', licensed: false },
      { id: 'build_decks', label: 'Decks & Pergolas', licensed: false },
    ],
  },
  {
    group: 'Painting & Decorating',
    trades: [
      { id: 'paint_interior', label: 'Interior Painting', licensed: false },
      { id: 'paint_exterior', label: 'Exterior Painting', licensed: false },
      { id: 'paint_wallpaper', label: 'Wallpapering & Decorating', licensed: false },
    ],
  },
  {
    group: 'Tiling & Plastering',
    trades: [
      { id: 'tile_floor', label: 'Floor Tiling', licensed: false },
      { id: 'tile_wall', label: 'Wall Tiling', licensed: false },
      { id: 'plaster_int', label: 'Interior Plastering', licensed: false },
    ],
  },
  {
    group: 'HVAC & Refrigeration',
    trades: [
      { id: 'hvac_install', label: 'Heat Pump Installation', licensed: false },
      { id: 'hvac_service', label: 'HVAC Servicing', licensed: false },
      { id: 'hvac_refrig', label: 'Refrigeration', licensed: false },
    ],
  },
  {
    group: 'Landscaping & Outdoor',
    trades: [
      { id: 'land_design', label: 'Landscape Design', licensed: false },
      { id: 'land_construct', label: 'Landscape Construction', licensed: false },
      { id: 'land_irrigation', label: 'Irrigation', licensed: false },
      { id: 'land_fence', label: 'Fencing', licensed: false },
    ],
  },
  {
    group: 'Other Residential Trades',
    trades: [
      { id: 'other_insulation', label: 'Insulation', licensed: false },
      { id: 'other_flooring', label: 'Flooring (Timber / Vinyl / Carpet)', licensed: false },
      { id: 'other_glazing', label: 'Glazing & Window Joinery', licensed: false },
      { id: 'other_concrete', label: 'Concrete & Driveways', licensed: false },
      { id: 'other_demolition', label: 'Demolition & Site Clearing', licensed: false },
    ],
  },
]

// ── Types ────────────────────────────────────────────────────────────────────
interface AppState {
  applicationId: string | null
  email: string
  businessStructure: string
  nzbn: string
  companyData: any
  selectedDirector: string
  creditScore: number | null
  creditResult: string
  ratioScore: number | null
  combinedScore: number | null
  financialGate: boolean | null
  insuranceFile: string | null
  insuranceExpiry: string
  selectedTrades: string[]
  portfolioPhotos: number
  portfolioVideo: boolean
  refEmails: string[]
  refCount: number
  subscriptionTier: string
}

const TIERS = [
  {
    id: 'Basic',
    price: 49,
    period: 'per month',
    features: ['TradieCheck Verified badge', 'Public verified profile', 'Homeowner lead enquiries', 'Annual Equifax refresh', 'Continuous reputation monitoring'],
    wallet: false,
  },
  {
    id: 'Premium',
    price: 99,
    period: 'per month',
    features: ['Everything in Basic', 'TradieWallet escrow (once live)', 'Xero / MYOB integration', '6-monthly financial ratio refresh', 'Priority support'],
    wallet: true,
    highlight: true,
  },
  {
    id: 'Platinum',
    price: 149,
    period: 'per month',
    features: ['Everything in Premium', 'Quarterly financial ratio refresh', 'Featured placement in search', 'Dedicated account manager', 'Early access to new features'],
    wallet: true,
  },
]

const TOTAL_STEPS = 11 // 0a through 10

function stepLabel(step: number) {
  const labels = [
    'Email', 'Business Type', 'Entity Verification', 'Credit Check',
    'Financial Ratios', 'Score Gate', 'Insurance', 'Licences',
    'Portfolio', 'Reputation', 'Subscription', 'Review',
  ]
  return labels[step] ?? ''
}

// ── UI primitives ─────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '32px 36px',
      ...style,
    }}>{children}</div>
  )
}

function StepTitle({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Step {step < 10 ? `0${step}` : step} — {stepLabel(step)}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  )
}

function Btn({
  children, onClick, variant = 'primary', disabled = false, style,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    padding: '12px 28px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
    ...style,
  }
  if (variant === 'primary') return <button onClick={onClick} disabled={disabled} style={{ ...base, background: C.blue, color: '#fff' }}>{children}</button>
  if (variant === 'secondary') return <button onClick={onClick} disabled={disabled} style={{ ...base, background: C.white, color: C.blue, border: `2px solid ${C.blue}` }}>{children}</button>
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'transparent', color: C.muted, border: `1px solid ${C.border}` }}>{children}</button>
}

function Input({
  label, value, onChange, placeholder, type = 'text', hint,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{hint}</div>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '11px 14px',
          border: `1.5px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 15,
          color: C.text,
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

function StatusBadge({ result }: { result: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    'Auto-Pass': { bg: C.greenLight, text: C.greenDark, label: 'Auto-Pass' },
    'Monitor': { bg: C.orangeLight, text: C.orange, label: 'Monitor — higher ratio bar required' },
    'Decline': { bg: C.redLight, text: C.red, label: 'Declined' },
  }
  const s = map[result] ?? { bg: C.grey, text: C.muted, label: result }
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 20,
      background: s.bg,
      color: s.text,
      fontSize: 13,
      fontWeight: 600,
    }}>{s.label}</span>
  )
}

function Spinner() {
  return (
    <div style={{
      display: 'inline-block',
      width: 20,
      height: 20,
      border: `3px solid ${C.blueLight}`,
      borderTopColor: C.blue,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / (total - 1)) * 100)
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: C.muted }}>Step {current + 1} of {total}</span>
        <span style={{ fontSize: 12, color: C.muted }}>{pct}% complete</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${C.blue}, ${C.green})`,
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

function InfoBox({ type, children }: { type: 'info' | 'warn' | 'error' | 'success'; children: React.ReactNode }) {
  const map = {
    info: { bg: C.blueLight, border: C.blue, icon: 'ℹ' },
    warn: { bg: C.orangeLight, border: C.orange, icon: '⚠' },
    error: { bg: C.redLight, border: C.red, icon: '✕' },
    success: { bg: C.greenLight, border: C.green, icon: '✓' },
  }
  const s = map[type]
  return (
    <div style={{
      background: s.bg,
      border: `1.5px solid ${s.border}`,
      borderRadius: 8,
      padding: '14px 16px',
      marginBottom: 20,
      fontSize: 13.5,
      lineHeight: 1.55,
      display: 'flex',
      gap: 10,
    }}>
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <div>{children}</div>
    </div>
  )
}

function MockFilePicker({ label, hint, onPick, picked }: { label: string; hint?: string; onPick: () => void; picked: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{hint}</div>}
      <div
        onClick={onPick}
        style={{
          border: `2px dashed ${picked ? C.green : C.border}`,
          borderRadius: 8,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: picked ? C.greenLight : C.grey,
          transition: 'all 0.2s',
        }}
      >
        {picked
          ? <span style={{ color: C.greenDark, fontWeight: 600, fontSize: 14 }}>✓ File attached (mock)</span>
          : <span style={{ color: C.muted, fontSize: 14 }}>Click to attach file <span style={{ fontSize: 12 }}>(mock — no file is actually uploaded)</span></span>
        }
      </div>
    </div>
  )
}

// ── Simulation helpers ────────────────────────────────────────────────────────
function simulateCreditScore(): { score: number; result: string } {
  // Weight toward plausible distribution: 40% pass, 40% monitor, 20% decline
  const r = Math.random()
  if (r < 0.40) return { score: Math.floor(701 + Math.random() * 400), result: 'Auto-Pass' }
  if (r < 0.80) return { score: Math.floor(501 + Math.random() * 200), result: 'Monitor' }
  return { score: Math.floor(200 + Math.random() * 300), result: 'Decline' }
}

function simulateRatioScore(creditResult: string): number {
  // If Monitor credit, needs higher ratio score to pass gate
  const base = creditResult === 'Auto-Pass' ? 45 : 55
  return Math.floor(base + Math.random() * 15)
}

function computeGate(creditScore: number, creditResult: string, ratioScore: number) {
  const creditPoints = creditResult === 'Auto-Pass' ? 25 : (creditResult === 'Monitor' ? 15 : 0)
  const combined = creditPoints + ratioScore
  const passes = creditResult !== 'Decline' && combined >= 90
  return { combined, passes }
}

// ── Save to Supabase ──────────────────────────────────────────────────────────
async function saveApplication(state: AppState, step: number): Promise<string | null> {
  const payload = {
    email: state.email,
    path: 'A',
    business_structure: state.businessStructure,
    current_step: step,
    status: step >= 10 ? 'Submitted' : 'In Progress',
    nzbn: state.nzbn,
    company_name: state.companyData?.entityName ?? null,
    director_name: state.selectedDirector,
    incorporation_date: state.companyData?.registrationDate ?? null,
    gst_registered: (state.companyData?.gstNumbers?.length ?? 0) > 0,
    credit_score: state.creditScore,
    credit_result: state.creditResult || null,
    ratio_score: state.ratioScore,
    combined_score: state.combinedScore,
    subscription_tier: state.subscriptionTier || null,
    step_data: {
      companyData: state.companyData,
      selectedTrades: state.selectedTrades,
      portfolioPhotos: state.portfolioPhotos,
      portfolioVideo: state.portfolioVideo,
      refEmails: state.refEmails,
      refCount: state.refCount,
      insuranceExpiry: state.insuranceExpiry,
    },
    updated_at: new Date().toISOString(),
  }

  if (state.applicationId) {
    await supabase.from('tradie_applications').update(payload).eq('id', state.applicationId)
    return state.applicationId
  } else {
    const { data } = await supabase.from('tradie_applications').insert(payload).select('id').single()
    return data?.id ?? null
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [processingMsg, setProcessingMsg] = useState('')
  const [nzbnError, setNzbnError] = useState('')
  const [incorporationError, setIncorporationError] = useState('')

  const [app, setApp] = useState<AppState>({
    applicationId: null,
    email: '',
    businessStructure: '',
    nzbn: '',
    companyData: null,
    selectedDirector: '',
    creditScore: null,
    creditResult: '',
    ratioScore: null,
    combinedScore: null,
    financialGate: null,
    insuranceFile: null,
    insuranceExpiry: '',
    selectedTrades: [],
    portfolioPhotos: 0,
    portfolioVideo: false,
    refEmails: ['', '', '', '', ''],
    refCount: 0,
    subscriptionTier: 'Premium',
  })

  function set(patch: Partial<AppState>) {
    setApp(prev => ({ ...prev, ...patch }))
  }

  async function advance(toStep: number) {
    const id = await saveApplication({ ...app }, toStep)
    if (id && !app.applicationId) set({ applicationId: id })
    setStep(toStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Step handlers ──────────────────────────────────────────────────────────

  async function handleNZBNLookup() {
    setNzbnError('')
    setIncorporationError('')
    setProcessing(true)
    setProcessingMsg('Looking up NZBN in the Companies Register…')

    try {
      const res = await fetch(`/api/nzbn?nzbn=${encodeURIComponent(app.nzbn)}`)
      const json = await res.json()

      if (!res.ok) {
        setNzbnError(json.error ?? 'NZBN lookup failed')
        setProcessing(false)
        return
      }

      const data = json.data
      set({ companyData: data })

      // 36-month incorporation check
      if (data.registrationDate) {
        const regDate = new Date(data.registrationDate)
        const monthsAgo = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4)
        if (monthsAgo < 36) {
          setIncorporationError(
            `Entity incorporated ${new Date(data.registrationDate).toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })} — less than 36 months ago. TradieCheck requires a minimum 3-year trading history for Path A applications.`
          )
          setProcessing(false)
          return
        }
      }

      setProcessing(false)
    } catch {
      setNzbnError('Unable to reach the Companies Register. Please try again.')
      setProcessing(false)
    }
  }

  async function handleCreditCheck() {
    setProcessing(true)
    const steps = [
      'Sending credit enquiry to Equifax…',
      'Pulling Standard Business Report…',
      'Analysing credit score, defaults and judgements…',
      'Checking director insolvency history…',
    ]
    for (const msg of steps) {
      setProcessingMsg(msg)
      await new Promise(r => setTimeout(r, 900))
    }
    const { score, result } = simulateCreditScore()
    set({ creditScore: score, creditResult: result })
    setProcessing(false)
  }

  async function handleRatioCalc() {
    setProcessing(true)
    const msgs = [
      'Reading uploaded financial accounts…',
      'Calculating liquidity ratios…',
      'Calculating leverage and profitability…',
      'Applying efficiency metrics…',
      'Comparing against trade benchmarks…',
    ]
    for (const msg of msgs) {
      setProcessingMsg(msg)
      await new Promise(r => setTimeout(r, 800))
    }
    const ratioScore = simulateRatioScore(app.creditResult)
    const { combined, passes } = computeGate(app.creditScore!, app.creditResult, ratioScore)
    set({ ratioScore, combinedScore: combined, financialGate: passes })
    setProcessing(false)
  }

  async function handleReputationScan() {
    setProcessing(true)
    const msgs = [
      'Scanning search engines for adverse mentions…',
      'Checking social media channels…',
      'Cross-referencing news archives…',
      'Querying review platforms (Google, Builderscrack)…',
      'Compiling reputation report…',
    ]
    for (const msg of msgs) {
      setProcessingMsg(msg)
      await new Promise(r => setTimeout(r, 1000))
    }
    setProcessing(false)
  }

  // ── Render steps ───────────────────────────────────────────────────────────

  function renderStep0a() {
    return (
      <>
        <StepTitle step={0} title="Let's get started" subtitle="We'll save your progress as you go — enter your email address to begin." />
        <Input
          label="Email address"
          type="email"
          value={app.email}
          onChange={v => set({ email: v })}
          placeholder="you@yourbusiness.co.nz"
        />
        <InfoBox type="info">
          Your email is used to send your verification result and to resume your application if you need to come back to it.
        </InfoBox>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={() => advance(1)} disabled={!/\S+@\S+\.\S+/.test(app.email)}>
            Get started →
          </Btn>
        </div>
      </>
    )
  }

  function renderStep1() {
    return (
      <>
        <StepTitle
          step={1}
          title="What type of business are you registering?"
          subtitle="Your business structure determines which verification path you'll follow."
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {['Company', 'Trust', 'Partnership'].map(s => (
            <div
              key={s}
              onClick={() => set({ businessStructure: s })}
              style={{
                padding: '16px 20px',
                borderRadius: 10,
                border: `2px solid ${app.businessStructure === s ? C.blue : C.border}`,
                background: app.businessStructure === s ? C.blueLight : C.white,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, color: app.businessStructure === s ? C.blueDark : C.text }}>{s}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
                {s === 'Company' && 'NZ registered company (Ltd) — NZBN required'}
                {s === 'Trust' && 'Family or trading trust with NZBN registration'}
                {s === 'Partnership' && 'Formal partnership registered with the Companies Office'}
              </div>
            </div>
          ))}
        </div>
        <InfoBox type="info">
          All three structures follow <strong>Path A</strong> — the same verification process. Sole traders follow a separate path (coming soon).
        </InfoBox>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(0)}>← Back</Btn>
          <Btn onClick={() => advance(2)} disabled={!app.businessStructure}>Continue →</Btn>
        </div>
      </>
    )
  }

  function renderStep2() {
    const directors = app.companyData?.directors?.filter((d: any) => d.roleStatus === 'ACTIVE') ?? []
    const isLoaded = !!app.companyData

    return (
      <>
        <StepTitle
          step={2}
          title="Entity verification"
          subtitle="Enter your New Zealand Business Number (NZBN) or Company Number. We'll verify your entity directly with the Companies Register."
        />

        {!isLoaded && (
          <>
            <Input
              label="NZBN (13 digits) or Company Number"
              value={app.nzbn}
              onChange={v => set({ nzbn: v })}
              placeholder="9429000000000"
              hint="Found on the Companies Register at app.companiesoffice.govt.nz"
            />

            {nzbnError && <InfoBox type="error">{nzbnError}</InfoBox>}
            {incorporationError && (
              <InfoBox type="error">
                <strong>Application cannot proceed</strong><br />{incorporationError}
              </InfoBox>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
              <Btn
                onClick={handleNZBNLookup}
                disabled={processing || app.nzbn.replace(/\s/g, '').length < 7}
              >
                {processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Spinner />{processingMsg || 'Looking up…'}
                  </span>
                ) : 'Look up entity →'}
              </Btn>
            </div>
          </>
        )}

        {isLoaded && !incorporationError && (
          <>
            <InfoBox type="success">
              <strong>Entity confirmed</strong> — {app.companyData.entityName}
            </InfoBox>

            <div style={{
              background: C.grey,
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 24,
              fontSize: 14,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                {[
                  ['Entity name', app.companyData.entityName],
                  ['NZBN', app.companyData.nzbn],
                  ['Status', app.companyData.entityStatusCode],
                  ['Registration date', app.companyData.registrationDate
                    ? new Date(app.companyData.registrationDate).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'],
                  ['GST registered', (app.companyData.gstNumbers?.length ?? 0) > 0 ? 'Yes' : 'Not shown — check if below $60k threshold'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
                    <div style={{ fontWeight: 500, color: C.text, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {directors.length > 0 && (
              <>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                  Confirm your director role — select your name
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {directors.map((d: any) => (
                    <div
                      key={d.fullName}
                      onClick={() => set({ selectedDirector: d.fullName })}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: `2px solid ${app.selectedDirector === d.fullName ? C.blue : C.border}`,
                        background: app.selectedDirector === d.fullName ? C.blueLight : C.white,
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 14,
                        color: C.text,
                      }}
                    >
                      {d.fullName}
                      <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>Director since {d.appointmentDate}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => { set({ companyData: null, nzbn: '' }); setNzbnError('') }}>
                ← Change NZBN
              </Btn>
              <Btn
                onClick={() => advance(3)}
                disabled={directors.length > 0 && !app.selectedDirector}
              >
                Continue →
              </Btn>
            </div>
          </>
        )}
      </>
    )
  }

  function renderStep3() {
    const ran = app.creditScore !== null

    return (
      <>
        <StepTitle
          step={3}
          title="Credit check"
          subtitle={`We run an Equifax Standard Business Report for ${app.companyData?.entityName ?? 'your entity'}. This is a mandatory step — you cannot opt out.`}
        />

        {!ran && (
          <>
            <InfoBox type="info">
              <strong>What we check:</strong> Business credit score (1–1,200 scale), payment defaults, court judgements, trade payment history, and director insolvency history.
            </InfoBox>
            <div style={{ marginBottom: 12, padding: '12px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.grey, fontSize: 13.5, lineHeight: 1.55 }}>
              <strong>Thresholds:</strong>
              <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                <li>701+ → <strong>Auto-Pass</strong> (25 points)</li>
                <li>501–700 → <strong>Monitor</strong> (15 points — higher ratio bar at Step 5)</li>
                <li>Below 501 → <strong>Declined</strong> (6-month wait applies)</li>
              </ul>
            </div>
            <InfoBox type="warn">
              By proceeding you consent to TradieCheck obtaining your business credit report from Equifax. This consent is recorded and stored for 7 years.
            </InfoBox>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
              <Btn onClick={handleCreditCheck} disabled={processing}>
                {processing
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Spinner />{processingMsg}</span>
                  : 'I consent — run credit check →'
                }
              </Btn>
            </div>
          </>
        )}

        {ran && (
          <>
            <div style={{ textAlign: 'center', padding: '28px 0', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Equifax Business Score
              </div>
              <div style={{
                fontSize: 64,
                fontWeight: 800,
                color: app.creditResult === 'Auto-Pass' ? C.greenDark : (app.creditResult === 'Monitor' ? C.orange : C.red),
                lineHeight: 1,
                marginBottom: 12,
              }}>
                {app.creditScore}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>out of 1,200</div>
              <StatusBadge result={app.creditResult} />
            </div>

            {app.creditResult === 'Decline' && (
              <InfoBox type="error">
                <strong>Application paused.</strong> Your current credit score does not meet TradieCheck's minimum threshold. You may reapply after 6 months from today. A $90 reapplication fee applies if you reapply within 12 months. You will receive a detailed explanation by email.
              </InfoBox>
            )}
            {app.creditResult === 'Monitor' && (
              <InfoBox type="warn">
                Your score falls in the Monitor range. You can continue, but your financial ratios (Step 5) will need to score at least 55/65 rather than the standard 45/65.
              </InfoBox>
            )}
            {app.creditResult === 'Auto-Pass' && (
              <InfoBox type="success">
                Excellent result. You've cleared the credit threshold with full points. Continuing to financial ratio assessment.
              </InfoBox>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
              <Btn
                onClick={() => advance(4)}
                disabled={app.creditResult === 'Decline'}
              >
                {app.creditResult === 'Decline' ? 'Application paused' : 'Continue →'}
              </Btn>
            </div>
          </>
        )}
      </>
    )
  }

  function renderStep4() {
    const [annualAccounts, setAnnualAccounts] = useState(false)
    const ran = app.ratioScore !== null

    return (
      <>
        <StepTitle
          step={4}
          title="Financial ratio assessment"
          subtitle="Upload your last three years of annual financial accounts. We'll calculate 11 financial ratios across liquidity, leverage, profitability and efficiency."
        />

        {!ran && (
          <>
            <InfoBox type="info">
              <strong>Premium subscribers:</strong> Connect Xero or MYOB to automate this step. We'll cross-check your IRD number with your NZBN record before accepting any connection.
            </InfoBox>

            <MockFilePicker
              label="Annual financial accounts — Year 1 (most recent)"
              hint="PDF or Excel accepted. Must be signed off by your accountant."
              onPick={() => setAnnualAccounts(true)}
              picked={annualAccounts}
            />
            <MockFilePicker
              label="Annual financial accounts — Year 2"
              hint="Required for trend analysis."
              onPick={() => {}}
              picked={annualAccounts}
            />
            <MockFilePicker
              label="Annual financial accounts — Year 3"
              hint="Required for 3-year trend modifier."
              onPick={() => {}}
              picked={annualAccounts}
            />

            <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: C.grey, border: `1px solid ${C.border}`, fontSize: 13.5 }}>
              <strong>Ratio categories:</strong> Liquidity (20 pts) · Leverage (15 pts) · Profitability (15 pts) · Efficiency (15 pts)
              <br />
              <span style={{ fontSize: 12, color: C.muted }}>
                Score required: {app.creditResult === 'Monitor' ? '55/65 (Monitor threshold)' : '45/65 (standard threshold)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(3)}>← Back</Btn>
              <Btn onClick={handleRatioCalc} disabled={!annualAccounts || processing}>
                {processing
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Spinner />{processingMsg}</span>
                  : 'Calculate ratios →'
                }
              </Btn>
            </div>
          </>
        )}

        {ran && (
          <>
            <div style={{
              background: C.grey,
              borderRadius: 10,
              padding: '20px 24px',
              marginBottom: 24,
            }}>
              {[
                { label: 'Liquidity', score: Math.floor(app.ratioScore! * 0.31), max: 20 },
                { label: 'Leverage', score: Math.floor(app.ratioScore! * 0.23), max: 15 },
                { label: 'Profitability', score: Math.floor(app.ratioScore! * 0.23), max: 15 },
                { label: 'Efficiency', score: Math.floor(app.ratioScore! * 0.23), max: 15 },
              ].map(({ label, score, max }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{label}</span>
                    <span style={{ color: C.muted }}>{score}/{max}</span>
                  </div>
                  <div style={{ height: 8, background: C.border, borderRadius: 4 }}>
                    <div style={{
                      height: '100%',
                      width: `${(score / max) * 100}%`,
                      background: score / max >= 0.7 ? C.green : (score / max >= 0.5 ? C.orange : C.red),
                      borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(3)}>← Back</Btn>
              <Btn onClick={() => advance(5)}>View combined score →</Btn>
            </div>
          </>
        )}
      </>
    )
  }

  function renderStep5() {
    const threshold = app.creditResult === 'Monitor' ? 55 : 45
    const creditPoints = app.creditResult === 'Auto-Pass' ? 25 : 15
    const passes = app.financialGate === true

    return (
      <>
        <StepTitle step={5} title="Financial gate" subtitle="Your combined credit and ratio score determines whether you can proceed." />

        <div style={{
          textAlign: 'center',
          padding: '32px 0',
          marginBottom: 24,
          background: passes ? C.greenLight : C.redLight,
          borderRadius: 12,
          border: `2px solid ${passes ? C.green : C.red}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Combined Score
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: passes ? C.greenDark : C.red, lineHeight: 1 }}>
            {app.combinedScore}
          </div>
          <div style={{ fontSize: 14, color: C.muted, margin: '10px 0 16px' }}>out of 90 required</div>
          <div style={{
            display: 'inline-block',
            padding: '6px 20px',
            borderRadius: 20,
            background: passes ? C.green : C.red,
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
          }}>
            {passes ? 'PASSED — proceed to documents' : 'DECLINED — threshold not met'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, fontSize: 13.5 }}>
          <div style={{ flex: 1, padding: '14px', background: C.grey, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: C.muted, marginBottom: 4 }}>Credit points</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{creditPoints}/25</div>
            <div style={{ fontSize: 12, color: C.muted }}>{app.creditResult}</div>
          </div>
          <div style={{ flex: 1, padding: '14px', background: C.grey, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: C.muted, marginBottom: 4 }}>Ratio points</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{app.ratioScore}/{threshold + 10}</div>
            <div style={{ fontSize: 12, color: C.muted }}>Required: {threshold}/65</div>
          </div>
        </div>

        {!passes && (
          <InfoBox type="error">
            <strong>We're sorry — your application has not passed the financial gate.</strong> A 6-month wait period applies. You'll receive a full breakdown by email, including which ratio categories fell below benchmark. A $90 reapplication fee applies if you reapply within 12 months.
          </InfoBox>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(4)}>← Back</Btn>
          <Btn onClick={() => advance(6)} disabled={!passes}>
            {passes ? 'Proceed to documents →' : 'Application paused'}
          </Btn>
        </div>
      </>
    )
  }

  function renderStep6() {
    const [certFile, setCertFile] = useState(false)

    return (
      <>
        <StepTitle
          step={6}
          title="Insurance verification"
          subtitle="Upload your current Certificate of Currency. Your policy must provide minimum $2M public liability cover across all trade types."
        />
        <MockFilePicker
          label="Certificate of Currency"
          hint="Accepted: PDF from your insurer. Broker letters accepted as fallback — these require analyst review and do not auto-pass."
          onPick={() => { setCertFile(true); set({ insuranceFile: 'mock-cert.pdf' }) }}
          picked={certFile}
        />
        <Input
          label="Policy expiry date"
          type="date"
          value={app.insuranceExpiry}
          onChange={v => set({ insuranceExpiry: v })}
          hint="You'll receive automated reminders at 60 days and 30 days before expiry. Your badge will be suspended immediately on lapse — there is no grace period."
        />
        <InfoBox type="info">
          Your certificate will be reviewed by a TradieCheck Verification Analyst. Automated reminders will be sent at 60 and 30 days before expiry.
        </InfoBox>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(5)}>← Back</Btn>
          <Btn onClick={() => advance(7)} disabled={!certFile || !app.insuranceExpiry}>Continue →</Btn>
        </div>
      </>
    )
  }

  function renderStep7() {
    const toggleTrade = (id: string) => {
      set({
        selectedTrades: app.selectedTrades.includes(id)
          ? app.selectedTrades.filter(t => t !== id)
          : [...app.selectedTrades, id],
      })
    }

    const needsLicence = TRADE_CATEGORIES
      .flatMap(g => g.trades)
      .filter(t => app.selectedTrades.includes(t.id) && t.licensed)

    return (
      <>
        <StepTitle
          step={7}
          title="Work categories & licences"
          subtitle="Select all trade categories your business operates in. We'll verify the appropriate licences for each."
        />

        {TRADE_CATEGORIES.map(group => (
          <div key={group.group} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {group.group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.trades.map(trade => {
                const selected = app.selectedTrades.includes(trade.id)
                return (
                  <div
                    key={trade.id}
                    onClick={() => toggleTrade(trade.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1.5px solid ${selected ? C.blue : C.border}`,
                      background: selected ? C.blueLight : C.white,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `2px solid ${selected ? C.blue : C.border}`,
                      background: selected ? C.blue : C.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {selected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, color: C.text }}>{trade.label}</span>
                    {trade.licensed && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 10,
                        background: C.orangeLight, color: C.orange, fontWeight: 600,
                      }}>
                        {trade.regulator} required
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {needsLicence.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              Licence uploads required for your selected categories:
            </div>
            {needsLicence.map(trade => (
              <MockFilePicker
                key={trade.id}
                label={`${trade.regulator} Licence — ${trade.label}`}
                hint={`Automated ${trade.regulator} register lookup where available. Manual upload as fallback.`}
                onPick={() => {}}
                picked={false}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(6)}>← Back</Btn>
          <Btn onClick={() => advance(8)} disabled={app.selectedTrades.length === 0}>Continue →</Btn>
        </div>
      </>
    )
  }

  function renderStep8() {
    const [photos, setPhotos] = useState(app.portfolioPhotos)
    const [video, setVideo] = useState(app.portfolioVideo)
    const [refs, setRefs] = useState(app.refEmails)

    function addPhoto() {
      if (photos < 5) {
        const n = photos + 1
        setPhotos(n)
        set({ portfolioPhotos: n })
      }
    }

    function updateRef(i: number, v: string) {
      const updated = [...refs]
      updated[i] = v
      setRefs(updated)
      set({ refEmails: updated, refCount: updated.filter(e => e.length > 3).length })
    }

    return (
      <>
        <StepTitle
          step={8}
          title="Portfolio & references"
          subtitle="Show your best work and provide client references. We need at least 3 of 5 survey responses before your application can be approved."
        />

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            Work photos — {photos}/5 uploaded
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                onClick={i === photos ? addPhoto : undefined}
                style={{
                  width: 80, height: 80, borderRadius: 8,
                  border: `2px dashed ${i < photos ? C.green : C.border}`,
                  background: i < photos ? C.greenLight : C.grey,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: i === photos ? 'pointer' : 'default',
                  fontSize: 24,
                }}
              >
                {i < photos ? '🖼' : (i === photos ? '+' : '')}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>Click + to add photos (mock)</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Work video (recommended, under 3 minutes)</div>
          <MockFilePicker
            label=""
            hint="A short video walkthrough of a completed job significantly improves your approval rate."
            onPick={() => { setVideo(true); set({ portfolioVideo: true }) }}
            picked={video}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Client reference emails — minimum 3 of 5 must respond</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            We'll send each client a short survey (5 questions). Your application is paused for up to 14 days until 3 responses are received.
          </div>
          {refs.map((ref, i) => (
            <input
              key={i}
              type="email"
              value={ref}
              onChange={e => updateRef(i, e.target.value)}
              placeholder={`Client ${i + 1} email address`}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                border: `1.5px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 8,
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <Btn variant="ghost" onClick={() => setStep(7)}>← Back</Btn>
          <Btn onClick={() => advance(9)} disabled={photos < 5}>Continue →</Btn>
        </div>
      </>
    )
  }

  function renderStep9() {
    const [done, setDone] = useState(false)

    async function run() {
      setProcessing(true)
      await handleReputationScan()
      setDone(true)
    }

    return (
      <>
        <StepTitle
          step={9}
          title="Reputation scan"
          subtitle="We run a continuous automated scan across search engines, social media, news archives, and review platforms."
        />
        {!done && (
          <>
            <InfoBox type="info">
              This scan runs in the background throughout your membership — not just at application. Any material findings are reviewed by a TradieCheck Analyst before any action is taken.
            </InfoBox>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(8)}>← Back</Btn>
              <Btn onClick={run} disabled={processing}>
                {processing
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Spinner />{processingMsg}</span>
                  : 'Run reputation scan →'
                }
              </Btn>
            </div>
          </>
        )}
        {done && (
          <>
            <InfoBox type="success">
              Scan complete — no material adverse findings detected. Your reputation report is clear.
            </InfoBox>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(8)}>← Back</Btn>
              <Btn onClick={() => advance(10)}>Continue →</Btn>
            </div>
          </>
        )}
      </>
    )
  }

  function renderStep10() {
    return (
      <>
        <StepTitle
          step={10}
          title="Choose your subscription"
          subtitle="All tiers include the TradieCheck Verified badge. Upgrade for TradieWallet escrow, deeper financial monitoring, and priority support."
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {TIERS.map(tier => (
            <div
              key={tier.id}
              onClick={() => set({ subscriptionTier: tier.id })}
              style={{
                padding: '20px 22px',
                borderRadius: 10,
                border: `2px solid ${app.subscriptionTier === tier.id ? C.blue : (tier.highlight ? C.blueLight : C.border)}`,
                background: app.subscriptionTier === tier.id ? C.blueLight : C.white,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {tier.highlight && (
                <div style={{
                  position: 'absolute', top: -11, left: 18,
                  background: C.blue, color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10,
                }}>Most popular</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{tier.id}</div>
                  {tier.wallet && <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginTop: 2 }}>Includes TradieWallet</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>${tier.price}</span>
                  <span style={{ fontSize: 12, color: C.muted }}> / mo</span>
                </div>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                {tier.features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <InfoBox type="info">
          Annual billing available at a 15% discount. Payment processed on approval — not during application.
        </InfoBox>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(9)}>← Back</Btn>
          <Btn onClick={() => advance(11)}>Submit application →</Btn>
        </div>
      </>
    )
  }

  function renderStep11() {
    return (
      <>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.greenDark, marginBottom: 12 }}>Application submitted</h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Your TradieCheck application is now under review. A Verification Analyst will review your documents within 3 business days. Two-person sign-off is required before your badge is issued.
          </p>

          <div style={{ background: C.grey, borderRadius: 10, padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: C.text }}>Application summary</div>
            {[
              ['Entity', app.companyData?.entityName ?? '—'],
              ['Director confirmed', app.selectedDirector || '—'],
              ['Credit result', app.creditResult],
              ['Combined score', `${app.combinedScore}/90 threshold`],
              ['Work categories', `${app.selectedTrades.length} selected`],
              ['Subscription', app.subscriptionTier],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13.5 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <Link href="/" style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: C.blue,
            color: '#fff',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Back to TradieCheck Registers
          </Link>
        </div>
      </>
    )
  }

  const stepRenderers = [
    renderStep0a, renderStep1, renderStep2, renderStep3, renderStep4,
    renderStep5, renderStep6, renderStep7, renderStep8, renderStep9,
    renderStep10, renderStep11,
  ]

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif",
        minHeight: '100vh',
        background: C.grey,
        padding: '24px 16px 60px',
      }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Image src="/TradieCheckLogo_transparent.png" alt="TradieCheck" width={160} height={40} style={{ objectFit: 'contain' }} />
            <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Path A Verification — Company / Trust / Partnership</div>
          </div>

          {step < 11 && <ProgressBar current={step} total={TOTAL_STEPS} />}

          <Card>
            {stepRenderers[step]?.()}
          </Card>

          {step > 0 && step < 11 && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: C.muted }}>
              Your progress is saved automatically
              {app.applicationId && <span> · Application ID: {app.applicationId.slice(0, 8)}…</span>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
