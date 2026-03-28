'use client'
// @ts-nocheck
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

// ---- Colours (all text explicit - no inheritance) ---
const BLUE = '#1E90D4'
const BLUE_DARK = '#0B6DAA'
const BLUE_LIGHT = '#E6F1FB'
const GREEN = '#6DBE45'
const GREEN_DARK = '#3E7A22'
const GREEN_LIGHT = '#EEF7E8'
const RED = '#DC2626'
const RED_LIGHT = '#FEE2E2'
const ORANGE = '#E87722'
const ORANGE_LIGHT = '#FEF3E8'
const GREY_BG = '#F5F8FA'
const BORDER = '#D8E6EE'
const TEXT = '#1a1a1a'
const TEXT_SECONDARY = '#374151'
const WHITE = '#FFFFFF'

// ---- Trade groups ----
const TRADE_GROUPS = [
  { group: 'Electrical', trades: [
    { id: 'elec_res', label: 'Residential Electrical', licensed: true, reg: 'EWRB' },
    { id: 'elec_com', label: 'Commercial Electrical', licensed: true, reg: 'EWRB' },
  ]},
  { group: 'Plumbing, Gasfitting and Drainlaying', trades: [
    { id: 'plumb', label: 'Plumbing', licensed: true, reg: 'PGDB' },
    { id: 'gas_nat', label: 'Gasfitting - Natural Gas', licensed: true, reg: 'PGDB' },
    { id: 'gas_lpg', label: 'Gasfitting - LPG', licensed: true, reg: 'PGDB' },
    { id: 'drain', label: 'Drainlaying', licensed: true, reg: 'PGDB' },
  ]},
  { group: 'Building and Construction', trades: [
    { id: 'carp', label: 'Carpentry', licensed: true, reg: 'LBP' },
    { id: 'site', label: 'Site (General Building)', licensed: true, reg: 'LBP' },
    { id: 'roof', label: 'Roofing', licensed: true, reg: 'LBP' },
    { id: 'reno', label: 'Renovations and Alterations', licensed: false },
    { id: 'decks', label: 'Decks and Pergolas', licensed: false },
    { id: 'concrete', label: 'Concrete and Foundations', licensed: false },
  ]},
  { group: 'Painting and Decorating', trades: [
    { id: 'paint_int', label: 'Interior Painting', licensed: false },
    { id: 'paint_ext', label: 'Exterior Painting', licensed: false },
    { id: 'wallpaper', label: 'Wallpapering', licensed: false },
  ]},
  { group: 'Tiling and Plastering', trades: [
    { id: 'tile', label: 'Floor and Wall Tiling', licensed: false },
    { id: 'plaster', label: 'Interior Plastering', licensed: false },
    { id: 'ext_plaster', label: 'External Plastering / Cladding', licensed: true, reg: 'LBP' },
  ]},
  { group: 'HVAC and Refrigeration', trades: [
    { id: 'hvac', label: 'Heat Pump Installation', licensed: false },
    { id: 'hvac_service', label: 'HVAC Servicing', licensed: false },
  ]},
  { group: 'Landscaping and Outdoor', trades: [
    { id: 'land', label: 'Landscape Construction', licensed: false },
    { id: 'fence', label: 'Fencing', licensed: false },
    { id: 'irrigation', label: 'Irrigation', licensed: false },
  ]},
  { group: 'Other Residential Trades', trades: [
    { id: 'insul', label: 'Insulation', licensed: false },
    { id: 'floor', label: 'Flooring (Timber / Vinyl / Carpet)', licensed: false },
    { id: 'glaze', label: 'Glazing and Window Joinery', licensed: false },
    { id: 'demo', label: 'Demolition and Site Clearing', licensed: false },
  ]},
]

// ---- Subscription tiers ----
const TIERS = [
  {
    id: 'Basic', price: 49,
    features: ['TradieCheck Verified badge', 'Public verified profile', 'Homeowner lead enquiries', 'Annual Equifax refresh', 'Continuous reputation monitoring'],
    wallet: false,
  },
  {
    id: 'Premium', price: 99,
    features: ['Everything in Basic', 'TradieWallet escrow (once live)', 'Xero / MYOB integration', '6-monthly financial ratio refresh', 'Priority support'],
    wallet: true, highlight: true,
  },
  {
    id: 'Platinum', price: 149,
    features: ['Everything in Premium', 'Quarterly financial ratio refresh', 'Featured placement in search', 'Dedicated account manager', 'Early access to new features'],
    wallet: true,
  },
]

// ---- Simulation helpers ----
function simulateCredit() {
  const r = Math.random()
  if (r < 0.40) return { score: Math.floor(701 + Math.random() * 400), result: 'Auto-Pass' }
  if (r < 0.80) return { score: Math.floor(501 + Math.random() * 200), result: 'Monitor' }
  return { score: Math.floor(200 + Math.random() * 300), result: 'Decline' }
}

// ---- UI components ----
function Spinner() {
  return (
    <div style={{
      display: 'inline-block', width: 18, height: 18,
      border: '3px solid ' + BLUE_LIGHT, borderTopColor: BLUE,
      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    }} />
  )
}

function ProgressBar({ step, total }) {
  const pct = Math.round((step / (total - 1)) * 100)
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TEXT_SECONDARY, marginBottom: 6 }}>
        <span>Step {step + 1} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div style={{ height: 6, background: BORDER, borderRadius: 3 }}>
        <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg,' + BLUE + ',' + GREEN + ')', borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function StepTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: 0, lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled = false }) {
  const base = {
    padding: '11px 26px', borderRadius: 8, fontWeight: 600, fontSize: 15,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit', border: 'none', transition: 'opacity 0.15s',
  }
  if (variant === 'primary') return <button onClick={onClick} disabled={disabled} style={{ ...base, background: BLUE, color: WHITE }}>{children}</button>
  if (variant === 'secondary') return <button onClick={onClick} disabled={disabled} style={{ ...base, background: WHITE, color: BLUE, border: '2px solid ' + BLUE }}>{children}</button>
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'transparent', color: TEXT, border: '1.5px solid ' + BORDER }}>{children}</button>
}

function InfoBox({ type, children }) {
  const map = {
    info:    { bg: BLUE_LIGHT,   border: BLUE,   icon: 'i' },
    warn:    { bg: ORANGE_LIGHT, border: ORANGE, icon: '!' },
    error:   { bg: RED_LIGHT,    border: RED,    icon: 'x' },
    success: { bg: GREEN_LIGHT,  border: GREEN,  icon: 'v' },
  }
  const s = map[type] || map.info
  return (
    <div style={{ background: s.bg, border: '1.5px solid ' + s.border, borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13.5, lineHeight: 1.55, color: TEXT }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 6 }}>{children}</label>
}

function TextInput({ label, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {hint && <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginBottom: 6 }}>{hint}</div>}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px', border: '1.5px solid ' + BORDER,
          borderRadius: 8, fontSize: 15, color: TEXT, fontFamily: 'inherit',
          boxSizing: 'border-box', background: WHITE, outline: 'none',
        }}
      />
    </div>
  )
}

function MockFilePicker({ label, hint, onPick, picked }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {hint && <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginBottom: 8 }}>{hint}</div>}
      <div
        onClick={onPick}
        style={{
          border: '2px dashed ' + (picked ? GREEN : BORDER), borderRadius: 8,
          padding: '18px 16px', textAlign: 'center', cursor: 'pointer',
          background: picked ? GREEN_LIGHT : GREY_BG, transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: 14, color: picked ? GREEN_DARK : TEXT_SECONDARY, fontWeight: picked ? 600 : 400 }}>
          {picked ? 'File attached (mock)' : 'Click to attach file (mock - no file uploaded)'}
        </span>
      </div>
    </div>
  )
}

// ---- Main component ----
export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [busyMsg, setBusyMsg] = useState('')
  const [appId, setAppId] = useState(null)

  // Form state
  const [email, setEmail] = useState('')
  const [structure, setStructure] = useState('')
  const [nzbn, setNzbn] = useState('')
  const [nzbnError, setNzbnError] = useState('')
  const [company, setCompany] = useState(null)
  const [director, setDirector] = useState('')
  const [credit, setCredit] = useState(null)
  const [accountsFile, setAccountsFile] = useState(false)
  const [ratioScore, setRatioScore] = useState(null)
  const [combinedScore, setCombinedScore] = useState(null)
  const [gatePass, setGatePass] = useState(null)
  const [insFile, setInsFile] = useState(false)
  const [insExpiry, setInsExpiry] = useState('')
  const [trades, setTrades] = useState([])
  const [licencePicked, setLicencePicked] = useState({})
  const [licencePicked, setLicencePicked] = useState({})
  const [photos, setPhotos] = useState(0)
  const [video, setVideo] = useState(false)
  const [refs, setRefs] = useState(['', '', '', '', ''])
  const [repDone, setRepDone] = useState(false)
  const [tier, setTier] = useState('Premium')

  async function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function saveAndGo(toStep) {
    const payload = {
      email, path: 'A', business_structure: structure, current_step: toStep,
      status: toStep >= 11 ? 'Submitted' : 'In Progress',
      nzbn: company?.nzbn ?? nzbn,
      company_name: company?.entityName ?? null,
      director_name: director,
      incorporation_date: company?.registrationDate ?? null,
      gst_registered: (company?.gstNumbers?.length ?? 0) > 0,
      credit_score: credit?.score ?? null,
      credit_result: credit?.result ?? null,
      ratio_score: ratioScore,
      combined_score: combinedScore,
      subscription_tier: tier,
      step_data: { trades, photos, video, refs, insExpiry },
      updated_at: new Date().toISOString(),
    }
    try {
      if (appId) {
        await supabase.from('tradie_applications').update(payload).eq('id', appId)
      } else {
        const { data } = await supabase.from('tradie_applications').insert(payload).select('id').single()
        if (data?.id) setAppId(data.id)
      }
    } catch (e) { console.error('Save error', e) }
    setStep(toStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function doNZBNLookup() {
    setNzbnError('')
    setBusy(true); setBusyMsg('Looking up NZBN in the Companies Register...')
    try {
      const res = await fetch('/api/nzbn?nzbn=' + encodeURIComponent(nzbn))
      const json = await res.json()
      if (!res.ok) { setNzbnError(json.error ?? 'Lookup failed'); setBusy(false); return }
      const d = json.data
      const months = (Date.now() - new Date(d.registrationDate)) / (1000 * 60 * 60 * 24 * 30.4)
      if (months < 36) {
        setNzbnError(
          'Incorporated ' + new Date(d.registrationDate).toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' }) +
          ' - less than 36 months ago. TradieCheck requires a minimum 3-year trading history.'
        )
        setBusy(false); return
      }
      setCompany(d)
    } catch (e) { setNzbnError('Could not reach the Companies Register. Please try again.') }
    setBusy(false)
  }

  async function doCreditCheck() {
    setBusy(true)
    const msgs = ['Contacting Equifax...', 'Pulling Standard Business Report...', 'Analysing score and defaults...', 'Checking director insolvency history...']
    for (const m of msgs) { setBusyMsg(m); await delay(900) }
    setCredit(simulateCredit())
    setBusy(false)
  }

  async function doRatioCalc() {
    setBusy(true)
    const msgs = ['Reading financial accounts...', 'Calculating liquidity ratios...', 'Calculating leverage and profitability...', 'Applying trade benchmarks...']
    for (const m of msgs) { setBusyMsg(m); await delay(800) }
    const threshold = credit?.result === 'Monitor' ? 55 : 45
    const rs = Math.floor(threshold + Math.random() * 15)
    const creditPts = credit?.result === 'Auto-Pass' ? 25 : 15
    const combined = creditPts + rs
    setRatioScore(rs); setCombinedScore(combined); setGatePass(rs >= threshold)
    setBusy(false)
  }

  async function doRepScan() {
    setBusy(true)
    const msgs = ['Scanning search engines...', 'Checking social media...', 'Querying review platforms...', 'Compiling reputation report...']
    for (const m of msgs) { setBusyMsg(m); await delay(1000) }
    setRepDone(true); setBusy(false)
  }

  function toggleTrade(id) {
    setTrades(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id])
  }

  // ---- Step 0: Email ----
  function S0() {
    return (
      <>
        <StepTitle title="Let's get started" subtitle="Enter your email address to begin. We'll save your progress as you go." />
        <TextInput label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@yourbusiness.co.nz" />
        <InfoBox type="info">Your email is used to send your verification result and to resume your application if needed.</InfoBox>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={() => saveAndGo(1)} disabled={!/\S+@\S+\.\S+/.test(email)}>Get started</Btn>
        </div>
      </>
    )
  }

  // ---- Step 1: Business structure ----
  function S1() {
    const options = [
      { id: 'Company', desc: 'NZ registered company (Ltd) - NZBN required' },
      { id: 'Trust', desc: 'Family or trading trust with NZBN registration' },
      { id: 'Partnership', desc: 'Formal partnership registered with the Companies Office' },
    ]
    return (
      <>
        <StepTitle title="What type of business are you registering?" subtitle="All three structures follow Path A - the same verification process." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {options.map(o => (
            <div
              key={o.id} onClick={() => setStructure(o.id)}
              style={{
                padding: '16px 20px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                border: '2px solid ' + (structure === o.id ? BLUE : BORDER),
                background: structure === o.id ? BLUE_LIGHT : WHITE,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>{o.id}</div>
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginTop: 3 }}>{o.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(0)}>Back</Btn>
          <Btn onClick={() => saveAndGo(2)} disabled={!structure}>Continue</Btn>
        </div>
      </>
    )
  }

  // ---- Step 2: NZBN lookup ----
  function S2() {
    const activeDirectors = (company?.directors ?? []).filter(d => d.roleStatus === 'ACTIVE')
    return (
      <>
        <StepTitle title="Entity verification" subtitle="Enter your NZBN or Company Number. We'll verify directly with the Companies Register." />
        {!company ? (
          <>
            <TextInput
              label="NZBN (13 digits) or Company Number"
              value={nzbn} onChange={setNzbn}
              placeholder="9429000000000"
              hint="Found at app.companiesoffice.govt.nz"
            />
            {nzbnError && <InfoBox type="error">{nzbnError}</InfoBox>}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
              <Btn onClick={doNZBNLookup} disabled={busy || nzbn.replace(/\s/g, '').length < 7}>
                {busy ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner /><span style={{ color: WHITE }}>{busyMsg}</span></span> : 'Look up entity'}
              </Btn>
            </div>
          </>
        ) : (
          <>
            <InfoBox type="success"><strong>Entity confirmed</strong> - {company.entityName}</InfoBox>
            <div style={{ background: GREY_BG, borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
              {[
                ['Entity', company.entityName],
                ['NZBN', company.nzbn],
                ['Status', company.entityStatusCode],
                ['Registered', new Date(company.registrationDate).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['GST', (company.gstNumbers?.length ?? 0) > 0 ? 'Registered' : 'Not shown'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid ' + BORDER, fontSize: 14 }}>
                  <span style={{ color: TEXT_SECONDARY, fontWeight: 500 }}>{k}</span>
                  <span style={{ fontWeight: 600, color: TEXT }}>{v}</span>
                </div>
              ))}
            </div>
            {activeDirectors.length > 0 && (
              <>
                <FieldLabel>Confirm your director role - select your name</FieldLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {activeDirectors.map(d => (
                    <div
                      key={d.fullName} onClick={() => setDirector(d.fullName)}
                      style={{
                        padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                        border: '2px solid ' + (director === d.fullName ? BLUE : BORDER),
                        background: director === d.fullName ? BLUE_LIGHT : WHITE,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: TEXT }}>{d.fullName}</span>
                      <span style={{ fontSize: 12, color: TEXT_SECONDARY, marginLeft: 10 }}>Director since {d.appointmentDate}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => { setCompany(null); setNzbn(''); setNzbnError('') }}>Change NZBN</Btn>
              <Btn onClick={() => saveAndGo(3)} disabled={activeDirectors.length > 0 && !director}>Continue</Btn>
            </div>
          </>
        )}
      </>
    )
  }

  // ---- Step 3: Credit check ----
  function S3() {
    return (
      <>
        <StepTitle title="Credit check" subtitle={'We run an Equifax Standard Business Report for ' + (company?.entityName ?? 'your entity') + '. This is mandatory.'} />
        {!credit ? (
          <>
            <div style={{ background: GREY_BG, borderRadius: 8, padding: '14px 16px', marginBottom: 20, fontSize: 13.5, color: TEXT }}>
              <strong>Thresholds:</strong> 701+ Auto-Pass (25 pts) &nbsp;|&nbsp; 501-700 Monitor (15 pts) &nbsp;|&nbsp; Below 501 Declined
            </div>
            <InfoBox type="warn">By proceeding you consent to TradieCheck obtaining your business credit report from Equifax. This consent is stored for 7 years.</InfoBox>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>Back</Btn>
              <Btn onClick={doCreditCheck} disabled={busy}>
                {busy ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner /><span style={{ color: WHITE }}>{busyMsg}</span></span> : 'I consent - run credit check'}
              </Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{
              textAlign: 'center', padding: '28px 0', marginBottom: 24,
              background: credit.result === 'Auto-Pass' ? GREEN_LIGHT : credit.result === 'Monitor' ? ORANGE_LIGHT : RED_LIGHT,
              borderRadius: 12, border: '2px solid ' + (credit.result === 'Auto-Pass' ? GREEN : credit.result === 'Monitor' ? ORANGE : RED),
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Equifax Business Score</div>
              <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, marginBottom: 10, color: credit.result === 'Auto-Pass' ? GREEN_DARK : credit.result === 'Monitor' ? ORANGE : RED }}>{credit.score}</div>
              <div style={{ fontSize: 11, color: TEXT_SECONDARY, marginBottom: 16 }}>out of 1,200</div>
              <span style={{
                padding: '5px 16px', borderRadius: 20, fontWeight: 700, fontSize: 14,
                background: credit.result === 'Auto-Pass' ? GREEN : credit.result === 'Monitor' ? ORANGE : RED,
                color: WHITE,
              }}>
                {credit.result === 'Auto-Pass' ? 'Auto-Pass' : credit.result === 'Monitor' ? 'Monitor - higher ratio bar required' : 'Declined'}
              </span>
            </div>
            {credit.result === 'Decline' && <InfoBox type="error"><strong>Application paused.</strong> Score below minimum threshold. 6-month wait applies. $90 reapplication fee within 12 months.</InfoBox>}
            {credit.result === 'Monitor' && <InfoBox type="warn">You can continue, but financial ratios must score at least 55/65 rather than the standard 45/65.</InfoBox>}
            {credit.result === 'Auto-Pass' && <InfoBox type="success">Excellent result. Full credit points scored. Continuing to financial ratio assessment.</InfoBox>}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>Back</Btn>
              <Btn onClick={() => saveAndGo(4)} disabled={credit.result === 'Decline'}>{credit.result === 'Decline' ? 'Application paused' : 'Continue'}</Btn>
            </div>
          </>
        )}
      </>
    )
  }

  // ---- Step 4: Ratios ----
  function S4() {
    const threshold = credit?.result === 'Monitor' ? 55 : 45
    return (
      <>
        <StepTitle title="Financial ratio assessment" subtitle="Upload your last three years of annual financial accounts. We calculate 11 ratios across liquidity, leverage, profitability and efficiency." />
        {ratioScore === null ? (
          <>
            <div style={{ marginBottom: 20 }}>   <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Connect your accounting software (Premium and above)</div>   <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>     <button onClick={() => setAccountsFile(true)} style={{ flex: 1, padding: '14px', borderRadius: 8, border: '2px solid #00B4D8', background: accountsFile ? '#E0F7FA' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#006B82', fontFamily: 'inherit' }}>       Connect Xero     </button>     <button onClick={() => setAccountsFile(true)} style={{ flex: 1, padding: '14px', borderRadius: 8, border: '2px solid #6C2DC7', background: accountsFile ? '#F3E8FF' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#4A1D8A', fontFamily: 'inherit' }}>       Connect MYOB     </button>   </div>   {accountsFile && <InfoBox type="success">Connected - we will pull 3 years of financial data and cross-check your IRD number against your NZBN record before calculating ratios.</InfoBox>}   {!accountsFile && <div style={{ textAlign: 'center', fontSize: 12, color: TEXT_SECONDARY, margin: '4px 0 12px' }}>or upload accounts manually below</div>} </div>
            {!accountsFile && ['Year 1 (most recent)', 'Year 2', 'Year 3'].map((y, i) => (
              <MockFilePicker key={y} label={'Annual financial accounts - ' + y} hint={i === 0 ? 'Must be signed off by your accountant. PDF or Excel.' : undefined} onPick={() => setAccountsFile(true)} picked={accountsFile} />
            ))}
            <div style={{ background: GREY_BG, borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13.5, color: TEXT }}>
              <strong>Score required:</strong> {threshold}/65 {credit?.result === 'Monitor' ? '(Monitor threshold)' : '(standard threshold)'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(3)}>Back</Btn>
              <Btn onClick={doRatioCalc} disabled={!accountsFile || busy}>
                {busy ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner /><span style={{ color: WHITE }}>{busyMsg}</span></span> : 'Calculate ratios'}
              </Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: GREY_BG, borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
              {[
                ['Cash flow', Math.floor(ratioScore * 0.31), 20, 'Can the business pay its bills on time? Looks at cash coming in vs money owed short term.'],
                ['Debt levels', Math.floor(ratioScore * 0.23), 15, 'How much is funded by debt vs what you own? Lower debt relative to assets is better.'],
                ['Profitability', Math.floor(ratioScore * 0.23), 15, 'Is the business making money after costs? Measures profit left from every dollar of revenue.'],
                ['Turning jobs into cash', Math.floor(ratioScore * 0.23), 15, 'How quickly does the business collect payment after completing work?'],
              ].map(([lbl, score, max, desc]) => (
                <div key={lbl} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: TEXT }}>{lbl}</span>
                    <span style={{ color: TEXT_SECONDARY }}>{score}/{max}</span>
                  </div>
                  <div style={{ height: 8, background: BORDER, borderRadius: 4 }}>
                    <div style={{ height: '100%', width: ((score / max) * 100) + '%', background: score / max >= 0.7 ? GREEN : score / max >= 0.5 ? ORANGE : RED, borderRadius: 4, transition: 'width 0.6s' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(3)}>Back</Btn>
              <Btn onClick={() => saveAndGo(5)}>View combined score</Btn>
            </div>
          </>
        )}
      </>
    )
  }

  // ---- Step 5: Gate ----
  function S5() {
    const creditPts = credit?.result === 'Auto-Pass' ? 25 : 15
    const threshold = credit?.result === 'Monitor' ? 55 : 45
    return (
      <>
        <StepTitle title="Financial gate" subtitle="Your combined credit and ratio score determines whether you can proceed." />
        <div style={{
          textAlign: 'center', padding: '32px', borderRadius: 12, marginBottom: 24,
          background: gatePass ? GREEN_LIGHT : RED_LIGHT,
          border: '2px solid ' + (gatePass ? GREEN : RED),
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Combined Score</div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, color: gatePass ? GREEN_DARK : RED, marginBottom: 10 }}>{combinedScore}</div>
          <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 16 }}>Ratio threshold: {credit?.result === 'Monitor' ? '55' : '45'}/65 required</div>
          <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 20, background: gatePass ? GREEN : RED, color: WHITE, fontWeight: 700, fontSize: 15 }}>
            {gatePass ? 'PASSED - proceed to documents' : 'DECLINED - threshold not met'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, padding: 14, background: GREY_BG, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: TEXT_SECONDARY, fontSize: 13, marginBottom: 4 }}>Credit points</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>{creditPts}/25</div>
            <div style={{ fontSize: 12, color: TEXT_SECONDARY }}>{credit?.result}</div>
          </div>
          <div style={{ flex: 1, padding: 14, background: GREY_BG, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: TEXT_SECONDARY, fontSize: 13, marginBottom: 4 }}>Ratio points</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>{ratioScore}/65</div>
            <div style={{ fontSize: 12, color: TEXT_SECONDARY }}>Required: {threshold}/65</div>
          </div>
        </div>
        {!gatePass && <InfoBox type="error"><strong>We're not able to verify your business finances right now.</strong> This doesn't mean your business isn't doing well - it means some of our financial benchmarks weren't met at this point in time. You'll receive a detailed breakdown by email explaining exactly what we looked at and what would need to improve. You're welcome to reapply in 6 months. If you think there's been an error, contact us at support@tradiecheck.co.nz.</InfoBox>}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(4)}>Back</Btn>
          <Btn onClick={() => saveAndGo(6)} disabled={!gatePass}>{gatePass ? 'Proceed to documents' : 'Application paused'}</Btn>
        </div>
      </>
    )
  }

  // ---- Step 6: Insurance ----
  function S6() {
    return (
      <>
        <StepTitle title="Insurance verification" subtitle="Upload your Certificate of Currency. Minimum $2M public liability cover required across all trade types." />
        <MockFilePicker
          label="Certificate of Currency"
          hint="PDF from your insurer preferred. Broker letters accepted as fallback but require analyst review."
          onPick={() => setInsFile(true)}
          picked={insFile}
        />
        <TextInput
          label="Policy expiry date"
          type="date"
          value={insExpiry}
          onChange={setInsExpiry}
          hint="Automated reminders at 60 and 30 days before expiry. Badge suspended immediately on lapse - no grace period."
        />
        <InfoBox type="info">Your certificate will be reviewed by a TradieCheck Verification Analyst within 2 business days.</InfoBox>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(5)}>Back</Btn>
          <Btn onClick={() => saveAndGo(7)} disabled={!insFile || !insExpiry}>Continue</Btn>
        </div>
      </>
    )
  }

  // ---- Step 7: Trades ----
  function S7() {
    const licensedSelected = TRADE_GROUPS.flatMap(g => g.trades).filter(t => trades.includes(t.id) && t.licensed)
    return (
      <>
        <StepTitle title="Work categories and licences" subtitle="Select all trade categories your business operates in. Licensed categories will require licence uploads." />
        {TRADE_GROUPS.map(g => (
          <div key={g.group} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{g.group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {g.trades.map(t => {
                const sel = trades.includes(t.id)
                return (
                  <div key={t.id} onClick={() => toggleTrade(t.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    border: '1.5px solid ' + (sel ? BLUE : BORDER),
                    background: sel ? BLUE_LIGHT : WHITE,
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid ' + (sel ? BLUE : BORDER), background: sel ? BLUE : WHITE }}>
                      {sel && <span style={{ color: WHITE, fontSize: 11, fontWeight: 700 }}>v</span>}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, color: TEXT }}>{t.label}</span>
                    {t.licensed && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: ORANGE_LIGHT, color: ORANGE, fontWeight: 600 }}>{t.reg} required</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {licensedSelected.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Licence uploads required:</div>
            {licensedSelected.map(t => (
              <MockFilePicker key={t.id} label={t.reg + ' Licence - ' + t.label} hint="Automated register lookup where available. Manual upload as fallback." onPick={() => setLicencePicked(p => ({...p, [t.id]: true}))} picked={!!licencePicked[t.id]} />
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setStep(6)}>Back</Btn>
          <Btn onClick={() => saveAndGo(8)} disabled={trades.length === 0}>Continue</Btn>
        </div>
      </>
    )
  }

  // ---- Step 8: Portfolio ----
  function S8() {
    return (
      <>
        <StepTitle title="Portfolio and references" subtitle="Upload 5 photos of your best work and provide 5 client email addresses. Minimum 3 of 5 survey responses required." />
        <div style={{ marginBottom: 24 }}>
          <FieldLabel>Work photos - {photos}/5 uploaded</FieldLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                onClick={i === photos ? () => setPhotos(p => Math.min(p + 1, 5)) : undefined}
                style={{
                  width: 80, height: 80, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed ' + (i < photos ? GREEN : BORDER),
                  background: i < photos ? GREEN_LIGHT : GREY_BG,
                  cursor: i === photos ? 'pointer' : 'default',
                  fontSize: 22, color: TEXT,
                }}
              >
                {i < photos ? 'ok' : i === photos ? '+' : ''}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: TEXT_SECONDARY }}>Click + to add photos (mock)</div>
        </div>
        <MockFilePicker label="Work video (recommended, under 3 minutes)" hint="A short video walkthrough of a completed job significantly improves your approval rate." onPick={() => setVideo(true)} picked={video} />
        <div style={{ marginBottom: 20 }}>
          <FieldLabel>Client reference emails - minimum 3 of 5 must respond</FieldLabel>
          <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginBottom: 10 }}>We send each client a short survey. Your application is paused for up to 14 days until 3 responses are received.</div>
          {refs.map((r, i) => (
            <input
              key={i} type="email" value={r}
              onChange={e => setRefs(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
              placeholder={'Client ' + (i + 1) + ' email address'}
              style={{ display: 'block', width: '100%', padding: '10px 14px', border: '1.5px solid ' + BORDER, borderRadius: 8, fontSize: 14, marginBottom: 8, boxSizing: 'border-box', fontFamily: 'inherit', color: TEXT, background: WHITE }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(7)}>Back</Btn>
          <Btn onClick={() => saveAndGo(9)} disabled={photos < 5}>Continue</Btn>
        </div>
      </>
    )
  }

  // ---- Step 9: Reputation ----
  function S9() {
    return (
      <>
        <StepTitle title="Reputation scan" subtitle="Automated scan across search engines, social media, news archives and review platforms." />
        <InfoBox type="info">This scan runs continuously throughout your membership - not just at application. All material findings are reviewed by a TradieCheck Analyst before any action is taken.</InfoBox>
        {!repDone ? (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Btn variant="ghost" onClick={() => setStep(8)}>Back</Btn>
            <Btn onClick={async () => { await doRepScan(); saveAndGo(10) }} disabled={busy}>
              {busy ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner /><span style={{ color: WHITE }}>{busyMsg}</span></span> : 'Run reputation scan'}
            </Btn>
          </div>
        ) : (
          <>
            <InfoBox type="success">Scan complete - no material adverse findings detected.</InfoBox>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" onClick={() => setStep(8)}>Back</Btn>
              <Btn onClick={() => saveAndGo(10)}>Continue</Btn>
            </div>
          </>
        )}
      </>
    )
  }

  // ---- Step 10: Subscription ----
  function S10() {
    return (
      <>
        <StepTitle title="Choose your subscription" subtitle="All tiers include the TradieCheck Verified badge. Upgrade for TradieWallet escrow and deeper financial monitoring." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {TIERS.map(t => (
            <div
              key={t.id} onClick={() => setTier(t.id)}
              style={{
                padding: '20px 22px', borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'all 0.15s',
                border: '2px solid ' + (tier === t.id ? BLUE : t.highlight ? BLUE_LIGHT : BORDER),
                background: tier === t.id ? BLUE_LIGHT : WHITE,
              }}
            >
              {t.highlight && (
                <div style={{ position: 'absolute', top: -11, left: 18, background: BLUE, color: WHITE, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>Most popular</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{t.id}</div>
                  {t.wallet && <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, marginTop: 2 }}>Includes TradieWallet</div>}
                </div>
                <div>
                  <span style={{ fontSize: 26, fontWeight: 800, color: TEXT }}>${t.price}</span>
                  <span style={{ fontSize: 12, color: TEXT_SECONDARY }}>/mo</span>
                </div>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.8 }}>
                {t.features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <InfoBox type="info">Annual billing available at a 15% discount. Payment is processed on approval only - not during application.</InfoBox>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Btn variant="ghost" onClick={() => setStep(9)}>Back</Btn>
          <Btn onClick={() => saveAndGo(11)}>Submit application</Btn>
        </div>
      </>
    )
  }

  // ---- Step 11: Confirmation ----
  function S11() {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>ok</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: GREEN_DARK, marginBottom: 12 }}>Application submitted</h2>
        <p style={{ fontSize: 15, color: TEXT_SECONDARY, lineHeight: 1.7, marginBottom: 28 }}>
          A Verification Analyst will review your documents within 3 business days. Two-person sign-off is required before your badge is issued.
        </p>
        <div style={{ background: GREY_BG, borderRadius: 10, padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Application summary</div>
          {[
            ['Entity', company?.entityName ?? '-'],
            ['Director confirmed', director || '-'],
            ['Credit result', credit?.result ?? '-'],
            ['Combined score', combinedScore + '/90'],
            ['Work categories', trades.length + ' selected'],
            ['Subscription', tier],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid ' + BORDER, fontSize: 13.5 }}>
              <span style={{ color: TEXT_SECONDARY, fontWeight: 500 }}>{k}</span>
              <span style={{ fontWeight: 600, color: TEXT }}>{v}</span>
            </div>
          ))}
        </div>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', background: BLUE, color: WHITE, borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
          Back to TradieCheck Registers
        </Link>
      </div>
    )
  }

  const steps = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11]
  const CurrentStep = steps[step] || S0

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
      <div style={{ fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif", minHeight: '100vh', background: GREY_BG, padding: '24px 16px 60px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Image src="/TradieCheckLogo_transparent.png" alt="TradieCheck" width={160} height={40} style={{ objectFit: 'contain' }} priority />
            <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginTop: 6 }}>Path A Verification - Company / Trust / Partnership</div>
          </div>
          {step < 11 && <ProgressBar step={step} total={12} />}
          <div style={{ background: WHITE, border: '1px solid ' + BORDER, borderRadius: 12, padding: '32px 36px' }}>
            {steps[step] ? steps[step]() : S0()}
          </div>
          {step > 0 && step < 11 && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: TEXT_SECONDARY }}>
              Progress saved automatically{appId ? ' . ID: ' + appId.slice(0, 8) + '...' : ''}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
