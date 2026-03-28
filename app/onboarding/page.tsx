'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const C = {
  blue: '#1E90D4', blueDark: '#0B6DAA', blueLight: '#E6F1FB',
  green: '#6DBE45', greenDark: '#3E7A22', greenLight: '#EEF7E8',
  red: '#DC2626', redLight: '#FEE2E2', orange: '#E87722', orangeLight: '#FEF3E8',
  grey: '#F5F8FA', border: '#D8E6EE', text: '#1a1a1a', muted: '#64748B', white: '#FFFFFF',
}

const TIERS = [
  { id: 'Basic', price: 49, features: ['TradieCheck Verified badge','Public verified profile','Homeowner lead enquiries','Annual Equifax refresh','Continuous reputation monitoring'], wallet: false },
  { id: 'Premium', price: 99, features: ['Everything in Basic','TradieWallet escrow (once live)','Xero / MYOB integration','6-monthly financial ratio refresh','Priority support'], wallet: true, highlight: true },
  { id: 'Platinum', price: 149, features: ['Everything in Premium','Quarterly financial ratio refresh','Featured placement in search','Dedicated account manager','Early access to new features'], wallet: true },
]

const TRADE_GROUPS = [
  { group: 'Electrical', trades: [
    { id: 'elec_res', label: 'Residential Electrical', licensed: true, reg: 'EWRB' },
    { id: 'elec_com', label: 'Commercial Electrical', licensed: true, reg: 'EWRB' },
  ]},
  { group: 'Plumbing, Gasfitting & Drainlaying', trades: [
    { id: 'plumb', label: 'Plumbing', licensed: true, reg: 'PGDB' },
    { id: 'gas_nat', label: 'Gasfitting - Natural Gas', licensed: true, reg: 'PGDB' },
    { id: 'gas_lpg', label: 'Gasfitting - LPG', licensed: true, reg: 'PGDB' },
    { id: 'drain', label: 'Drainlaying', licensed: true, reg: 'PGDB' },
  ]},
  { group: 'Building & Construction', trades: [
    { id: 'carp', label: 'Carpentry', licensed: true, reg: 'LBP' },
    { id: 'site', label: 'Site (General Building)', licensed: true, reg: 'LBP' },
    { id: 'roof', label: 'Roofing', licensed: true, reg: 'LBP' },
    { id: 'reno', label: 'Renovations & Alterations', licensed: false },
    { id: 'decks', label: 'Decks & Pergolas', licensed: false },
  ]},
  { group: 'Painting & Decorating', trades: [
    { id: 'paint_int', label: 'Interior Painting', licensed: false },
    { id: 'paint_ext', label: 'Exterior Painting', licensed: false },
  ]},
  { group: 'Tiling & Plastering', trades: [
    { id: 'tile', label: 'Floor & Wall Tiling', licensed: false },
    { id: 'plaster', label: 'Interior Plastering', licensed: false },
  ]},
  { group: 'Landscaping & Outdoor', trades: [
    { id: 'land', label: 'Landscape Construction', licensed: false },
    { id: 'fence', label: 'Fencing', licensed: false },
  ]},
  { group: 'Other Residential Trades', trades: [
    { id: 'insul', label: 'Insulation', licensed: false },
    { id: 'floor', label: 'Flooring', licensed: false },
    { id: 'glaze', label: 'Glazing & Window Joinery', licensed: false },
    { id: 'concrete', label: 'Concrete & Driveways', licensed: false },
  ]},
]

function Spinner() {
  return <div style={{ display:'inline-block', width:18, height:18, border:'3px solid #E6F1FB', borderTopColor:'#1E90D4', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
}

function InfoBox({ type, children }) {
  const s = { info:{bg:'#E6F1FB',border:'#1E90D4',icon:'i'}, warn:{bg:'#FEF3E8',border:'#E87722',icon:'!'}, error:{bg:'#FEE2E2',border:'#DC2626',icon:'x'}, success:{bg:'#EEF7E8',border:'#6DBE45',icon:'checkmark'} }[type]
  return <div style={{ background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:13.5, lineHeight:1.55 }}>{children}</div>
}

function Btn({ children, onClick, variant='primary', disabled=false }) {
  const styles = {
    primary: { background:'#1E90D4', color:'#fff', border:'none' },
    secondary: { background:'#fff', color:'#1E90D4', border:'2px solid #1E90D4' },
    ghost: { background:'transparent', color:'#64748B', border:'1px solid #D8E6EE' },
  }
  return <button onClick={onClick} disabled={disabled} style={{ padding:'11px 26px', borderRadius:8, fontWeight:600, fontSize:15, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, fontFamily:'inherit', ...styles[variant] }}>{children}</button>
}

function ProgressBar({ step, total }) {
  const pct = Math.round((step / (total-1)) * 100)
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748B', marginBottom:6 }}>
        <span>Step {step+1} of {total}</span><span>{pct}% complete</span>
      </div>
      <div style={{ height:6, background:'#D8E6EE', borderRadius:3 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#1E90D4,#6DBE45)', borderRadius:3, transition:'width 0.4s' }} />
      </div>
    </div>
  )
}

function simulateCredit() {
  const r = Math.random()
  if (r < 0.4) return { score: Math.floor(701 + Math.random()*400), result: 'Auto-Pass' }
  if (r < 0.8) return { score: Math.floor(501 + Math.random()*200), result: 'Monitor' }
  return { score: Math.floor(200 + Math.random()*300), result: 'Decline' }
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [busyMsg, setBusyMsg] = useState('')
  const [appId, setAppId] = useState(null)
  const [email, setEmail] = useState('')
  const [structure, setStructure] = useState('')
  const [nzbn, setNzbn] = useState('')
  const [nzbnError, setNzbnError] = useState('')
  const [company, setCompany] = useState(null)
  const [director, setDirector] = useState('')
  const [credit, setCredit] = useState(null)
  const [ratioScore, setRatioScore] = useState(null)
  const [combinedScore, setCombinedScore] = useState(null)
  const [gatePass, setGatePass] = useState(null)
  const [insFile, setInsFile] = useState(false)
  const [insExpiry, setInsExpiry] = useState('')
  const [trades, setTrades] = useState([])
  const [photos, setPhotos] = useState(0)
  const [video, setVideo] = useState(false)
  const [refs, setRefs] = useState(['','','','',''])
  const [tier, setTier] = useState('Premium')

  async function save(toStep) {
    const payload = {
      email, path:'A', business_structure:structure, current_step:toStep,
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
    if (appId) {
      await supabase.from('tradie_applications').update(payload).eq('id', appId)
    } else {
      const { data } = await supabase.from('tradie_applications').insert(payload).select('id').single()
      if (data?.id) setAppId(data.id)
    }
    setStep(toStep)
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  async function lookupNZBN() {
    setNzbnError('')
    setBusy(true); setBusyMsg('Looking up NZBN...')
    try {
      const res = await fetch(`/api/nzbn?nzbn=${encodeURIComponent(nzbn)}`)
      const json = await res.json()
      if (!res.ok) { setNzbnError(json.error ?? 'Lookup failed'); setBusy(false); return }
      const d = json.data
      const months = (Date.now() - new Date(d.registrationDate)) / (1000*60*60*24*30.4)
      if (months < 36) { setNzbnError(`Incorporated ${new Date(d.registrationDate).toLocaleDateString('en-NZ',{month:'long',year:'numeric'})} â€” less than 36 months. Minimum 3-year trading history required.`); setBusy(false); return }
      setCompany(d)
    } catch { setNzbnError('Could not reach Companies Register. Please try again.') }
    setBusy(false)
  }

  async function runCredit() {
    setBusy(true)
    for (const m of ['Contacting Equifax...','Pulling business credit report...','Analysing score and defaults...','Checking director history...']) { setBusyMsg(m); await new Promise(r=>setTimeout(r,900)) }
    setCredit(simulateCredit())
    setBusy(false)
  }

  async function runRatios() {
    setBusy(true)
    for (const m of ['Reading financial accounts...','Calculating liquidity ratios...','Calculating leverage & profitability...','Applying trade benchmarks...']) { setBusyMsg(m); await new Promise(r=>setTimeout(r,800)) }
    const threshold = credit?.result === 'Monitor' ? 55 : 45
    const rs = Math.floor(threshold + Math.random()*15)
    const creditPts = credit?.result === 'Auto-Pass' ? 25 : 15
    const combined = creditPts + rs
    setRatioScore(rs); setCombinedScore(combined); setGatePass(combined >= 90)
    setBusy(false)
  }

  async function runReputation() {
    setBusy(true)
    for (const m of ['Scanning search engines...','Checking social media...','Querying review platforms...','Compiling report...']) { setBusyMsg(m); await new Promise(r=>setTimeout(r,1000)) }
    setBusy(false)
    save(10)
  }

  function toggleTrade(id) { setTrades(t => t.includes(id) ? t.filter(x=>x!==id) : [...t,id]) }

  const card = { background:'#fff', border:'1px solid #D8E6EE', borderRadius:12, padding:'32px 36px' }
  const inputStyle = { width:'100%', padding:'11px 14px', border:'1.5px solid #D8E6EE', borderRadius:8, fontSize:15, fontFamily:'inherit', boxSizing:'border-box', color:'#1a1a1a' }
  const label = { display:'block', fontSize:13, fontWeight:600, color:'#1a1a1a', marginBottom:6 }

  const steps = [
    // Step 0 - Email
    <div key={0}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Let's get started</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Enter your email address to begin. We'll save your progress as you go.</p>
      <label style={label}>Email address</label>
      <input style={{ ...inputStyle, marginBottom:20 }} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@yourbusiness.co.nz" />
      <InfoBox type="info">Your email is used to send your verification result and to resume your application if needed.</InfoBox>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <Btn onClick={()=>save(1)} disabled={!/\S+@\S+\.\S+/.test(email)}>Get started â†’</Btn>
      </div>
    </div>,

    // Step 1 - Structure
    <div key={1}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>What type of business are you registering?</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>All three structures follow Path A â€” the same verification process.</p>
      {['Company','Trust','Partnership'].map(s => (
        <div key={s} onClick={()=>setStructure(s)} style={{ padding:'16px 20px', borderRadius:10, border:`2px solid ${structure===s?'#1E90D4':'#D8E6EE'}`, background:structure===s?'#E6F1FB':'#fff', cursor:'pointer', marginBottom:10 }}>
          <div style={{ fontWeight:600, fontSize:15 }}>{s}</div>
          <div style={{ fontSize:13, color:'#64748B', marginTop:3 }}>
            {s==='Company'&&'NZ registered company (Ltd) â€” NZBN required'}
            {s==='Trust'&&'Family or trading trust with NZBN registration'}
            {s==='Partnership'&&'Formal partnership registered with the Companies Office'}
          </div>
        </div>
      ))}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:24 }}>
        <Btn variant="ghost" onClick={()=>setStep(0)}>â† Back</Btn>
        <Btn onClick={()=>save(2)} disabled={!structure}>Continue â†’</Btn>
      </div>
    </div>,

    // Step 2 - NZBN
    <div key={2}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Entity verification</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Enter your NZBN or Company Number. We'll verify directly with the Companies Register.</p>
      {!company ? (
        <>
          <label style={label}>NZBN (13 digits) or Company Number</label>
          <input style={{ ...inputStyle, marginBottom:8 }} value={nzbn} onChange={e=>setNzbn(e.target.value)} placeholder="9429000000000" />
          <div style={{ fontSize:12, color:'#64748B', marginBottom:20 }}>Found at app.companiesoffice.govt.nz</div>
          {nzbnError && <InfoBox type="error">{nzbnError}</InfoBox>}
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="ghost" onClick={()=>setStep(1)}>â† Back</Btn>
            <Btn onClick={lookupNZBN} disabled={busy||nzbn.length<7}>
              {busy ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><Spinner/>{busyMsg}</span> : 'Look up entity â†’'}
            </Btn>
          </div>
        </>
      ) : (
        <>
          <InfoBox type="success"><strong>Entity confirmed</strong> â€” {company.entityName}</InfoBox>
          <div style={{ background:'#F5F8FA', borderRadius:10, padding:'16px 20px', marginBottom:24 }}>
            {[['Entity',company.entityName],['NZBN',company.nzbn],['Status',company.entityStatusCode],['Registered',new Date(company.registrationDate).toLocaleDateString('en-NZ',{day:'numeric',month:'long',year:'numeric'})],['GST',(company.gstNumbers?.length??0)>0?'Registered':'Not shown']].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #D8E6EE', fontSize:14 }}>
                <span style={{ color:'#64748B' }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          {(company.directors||[]).filter(d=>d.roleStatus==='ACTIVE').length > 0 && (
            <>
              <label style={label}>Confirm your director role â€” select your name</label>
              {(company.directors||[]).filter(d=>d.roleStatus==='ACTIVE').map(d=>(
                <div key={d.fullName} onClick={()=>setDirector(d.fullName)} style={{ padding:'12px 16px', borderRadius:8, border:`2px solid ${director===d.fullName?'#1E90D4':'#D8E6EE'}`, background:director===d.fullName?'#E6F1FB':'#fff', cursor:'pointer', marginBottom:8, fontSize:14, fontWeight:500 }}>
                  {d.fullName} <span style={{ fontSize:12, color:'#64748B' }}>Â· Director since {d.appointmentDate}</span>
                </div>
              ))}
            </>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:16 }}>
            <Btn variant="ghost" onClick={()=>setCompany(null)}>â† Change NZBN</Btn>
            <Btn onClick={()=>save(3)} disabled={(company.directors||[]).filter(d=>d.roleStatus==='ACTIVE').length>0&&!director}>Continue â†’</Btn>
          </div>
        </>
      )}
    </div>,

    // Step 3 - Credit
    <div key={3}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Credit check</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>We run an Equifax Standard Business Report. This is mandatory â€” you cannot opt out.</p>
      {!credit ? (
        <>
          <div style={{ background:'#F5F8FA', borderRadius:8, padding:'14px 16px', marginBottom:20, fontSize:13.5 }}>
            <strong>Thresholds:</strong> 701+ Auto-Pass (25 pts) Â· 501â€“700 Monitor (15 pts) Â· Below 501 Declined
          </div>
          <InfoBox type="warn">By proceeding you consent to TradieCheck obtaining your business credit report from Equifax. This consent is stored for 7 years.</InfoBox>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="ghost" onClick={()=>setStep(2)}>â† Back</Btn>
            <Btn onClick={runCredit} disabled={busy}>{busy?<span style={{ display:'flex', alignItems:'center', gap:8 }}><Spinner/>{busyMsg}</span>:'I consent â€” run credit check â†’'}</Btn>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign:'center', padding:'28px 0', marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Equifax Business Score</div>
            <div style={{ fontSize:72, fontWeight:800, lineHeight:1, color: credit.result==='Auto-Pass'?'#3E7A22':credit.result==='Monitor'?'#E87722':'#DC2626', marginBottom:12 }}>{credit.score}</div>
            <div style={{ fontSize:11, color:'#64748B', marginBottom:16 }}>out of 1,200</div>
            <span style={{ padding:'5px 16px', borderRadius:20, fontWeight:600, fontSize:14, background:credit.result==='Auto-Pass'?'#EEF7E8':credit.result==='Monitor'?'#FEF3E8':'#FEE2E2', color:credit.result==='Auto-Pass'?'#3E7A22':credit.result==='Monitor'?'#E87722':'#DC2626' }}>
              {credit.result==='Auto-Pass'?'Auto-Pass':credit.result==='Monitor'?'Monitor â€” higher ratio bar required':'Declined'}
            </span>
          </div>
          {credit.result==='Decline'&&<InfoBox type="error"><strong>Application paused.</strong> Score below minimum threshold. 6-month wait applies. $90 reapplication fee within 12 months.</InfoBox>}
          {credit.result==='Monitor'&&<InfoBox type="warn">Monitor range â€” you can continue, but ratios must score at least 55/65 rather than the standard 45/65.</InfoBox>}
          {credit.result==='Auto-Pass'&&<InfoBox type="success">Excellent result. You've cleared the credit threshold with full points.</InfoBox>}
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="ghost" onClick={()=>setStep(2)}>â† Back</Btn>
            <Btn onClick={()=>save(4)} disabled={credit.result==='Decline'}>{credit.result==='Decline'?'Application paused':'Continue â†’'}</Btn>
          </div>
        </>
      )}
    </div>,

    // Step 4 - Ratios
    <div key={4}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Financial ratio assessment</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Upload your last three years of annual financial accounts. We calculate 11 ratios across 4 categories.</p>
      {ratioScore === null ? (
        <>
          <InfoBox type="info">Premium subscribers can connect Xero or MYOB to automate this step.</InfoBox>
          {['Year 1 (most recent)','Year 2','Year 3'].map(y=>(
            <div key={y} style={{ border:`2px dashed ${insFile?'#6DBE45':'#D8E6EE'}`, borderRadius:8, padding:'18px', textAlign:'center', marginBottom:12, cursor:'pointer', background:'#F5F8FA' }} onClick={()=>setInsFile(true)}>
              <span style={{ fontSize:14, color:'#64748B' }}>Annual accounts â€” {y} {insFile?'âœ“':''}</span>
            </div>
          ))}
          <div style={{ background:'#F5F8FA', borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:13 }}>
            Score required: {credit?.result==='Monitor'?'55/65 (Monitor threshold)':'45/65 (standard)'}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="ghost" onClick={()=>setStep(3)}>â† Back</Btn>
            <Btn onClick={runRatios} disabled={!insFile||busy}>{busy?<span style={{ display:'flex', alignItems:'center', gap:8 }}><Spinner/>{busyMsg}</span>:'Calculate ratios â†’'}</Btn>
          </div>
        </>
      ) : (
        <>
          {[['Liquidity',Math.floor(ratioScore*0.31),20],['Leverage',Math.floor(ratioScore*0.23),15],['Profitability',Math.floor(ratioScore*0.23),15],['Efficiency',Math.floor(ratioScore*0.23),15]].map(([label,score,max])=>(
            <div key={label} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span style={{ fontWeight:500 }}>{label}</span><span style={{ color:'#64748B' }}>{score}/{max}</span></div>
              <div style={{ height:8, background:'#D8E6EE', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${(score/max)*100}%`, background:score/max>=0.7?'#6DBE45':score/max>=0.5?'#E87722':'#DC2626', borderRadius:4, transition:'width 0.6s' }} />
              </div>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24 }}>
            <Btn variant="ghost" onClick={()=>setStep(3)}>â† Back</Btn>
            <Btn onClick={()=>save(5)}>View combined score â†’</Btn>
          </div>
        </>
      )}
    </div>,

    // Step 5 - Gate
    <div key={5}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Financial gate</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Your combined credit and ratio score determines whether you can proceed.</p>
      <div style={{ textAlign:'center', padding:'32px', borderRadius:12, marginBottom:24, background:gatePass?'#EEF7E8':'#FEE2E2', border:`2px solid ${gatePass?'#6DBE45':'#DC2626'}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Combined Score</div>
        <div style={{ fontSize:72, fontWeight:800, lineHeight:1, color:gatePass?'#3E7A22':'#DC2626', marginBottom:10 }}>{combinedScore}</div>
        <div style={{ fontSize:13, color:'#64748B', marginBottom:16 }}>out of 90 required</div>
        <div style={{ display:'inline-block', padding:'6px 20px', borderRadius:20, background:gatePass?'#6DBE45':'#DC2626', color:'#fff', fontWeight:700, fontSize:15 }}>
          {gatePass?'PASSED â€” proceed to documents':'DECLINED â€” threshold not met'}
        </div>
      </div>
      <div style={{ display:'flex', gap:16, marginBottom:24 }}>
        <div style={{ flex:1, padding:14, background:'#F5F8FA', borderRadius:8, textAlign:'center' }}>
          <div style={{ color:'#64748B', fontSize:13, marginBottom:4 }}>Credit points</div>
          <div style={{ fontSize:24, fontWeight:700 }}>{credit?.result==='Auto-Pass'?25:15}/25</div>
          <div style={{ fontSize:12, color:'#64748B' }}>{credit?.result}</div>
        </div>
        <div style={{ flex:1, padding:14, background:'#F5F8FA', borderRadius:8, textAlign:'center' }}>
          <div style={{ color:'#64748B', fontSize:13, marginBottom:4 }}>Ratio points</div>
          <div style={{ fontSize:24, fontWeight:700 }}>{ratioScore}/65</div>
          <div style={{ fontSize:12, color:'#64748B' }}>Required: {credit?.result==='Monitor'?55:45}</div>
        </div>
      </div>
      {!gatePass&&<InfoBox type="error"><strong>Application not passed.</strong> 6-month wait applies. You'll receive a full breakdown by email.</InfoBox>}
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Btn variant="ghost" onClick={()=>setStep(4)}>â† Back</Btn>
        <Btn onClick={()=>save(6)} disabled={!gatePass}>{gatePass?'Proceed to documents â†’':'Application paused'}</Btn>
      </div>
    </div>,

    // Step 6 - Insurance
    <div key={6}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Insurance verification</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Upload your Certificate of Currency. Minimum $2M public liability cover required.</p>
      <div onClick={()=>setInsFile(true)} style={{ border:`2px dashed ${insFile?'#6DBE45':'#D8E6EE'}`, borderRadius:8, padding:'24px', textAlign:'center', cursor:'pointer', background:insFile?'#EEF7E8':'#F5F8FA', marginBottom:20 }}>
        {insFile?<span style={{ color:'#3E7A22', fontWeight:600 }}>âœ“ Certificate attached (mock)</span>:<span style={{ color:'#64748B' }}>Click to attach Certificate of Currency</span>}
      </div>
      <label style={label}>Policy expiry date</label>
      <input style={{ ...inputStyle, marginBottom:20 }} type="date" value={insExpiry} onChange={e=>setInsExpiry(e.target.value)} />
      <InfoBox type="info">Automated reminders at 60 and 30 days before expiry. Badge suspended immediately on lapse â€” no grace period.</InfoBox>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Btn variant="ghost" onClick={()=>setStep(5)}>â† Back</Btn>
        <Btn onClick={()=>save(7)} disabled={!insFile||!insExpiry}>Continue â†’</Btn>
      </div>
    </div>,

    // Step 7 - Trades
    <div key={7}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Work categories & licences</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Select all trade categories your business operates in.</p>
      {TRADE_GROUPS.map(g=>(
        <div key={g.group} style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{g.group}</div>
          {g.trades.map(t=>{
            const sel = trades.includes(t.id)
            return (
              <div key={t.id} onClick={()=>toggleTrade(t.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:8, border:`1.5px solid ${sel?'#1E90D4':'#D8E6EE'}`, background:sel?'#E6F1FB':'#fff', cursor:'pointer', marginBottom:6 }}>
                <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${sel?'#1E90D4':'#D8E6EE'}`, background:sel?'#1E90D4':'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {sel&&<span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>âœ“</span>}
                </div>
                <span style={{ flex:1, fontSize:14 }}>{t.label}</span>
                {t.licensed&&<span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background:'#FEF3E8', color:'#E87722', fontWeight:600 }}>{t.reg} required</span>}
              </div>
            )
          })}
        </div>
      ))}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
        <Btn variant="ghost" onClick={()=>setStep(6)}>â† Back</Btn>
        <Btn onClick={()=>save(8)} disabled={trades.length===0}>Continue â†’</Btn>
      </div>
    </div>,

    // Step 8 - Portfolio
    <div key={8}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Portfolio & references</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Upload 5 photos of your best work and provide 5 client email addresses. Minimum 3 of 5 survey responses required.</p>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Work photos â€” {photos}/5</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:8 }}>
          {[...Array(5)].map((_,i)=>(
            <div key={i} onClick={i===photos?()=>setPhotos(p=>Math.min(p+1,5)):undefined} style={{ width:80, height:80, borderRadius:8, border:`2px dashed ${i<photos?'#6DBE45':'#D8E6EE'}`, background:i<photos?'#EEF7E8':'#F5F8FA', display:'flex', alignItems:'center', justifyContent:'center', cursor:i===photos?'pointer':'default', fontSize:24 }}>
              {i<photos?'ðŸ–¼':i===photos?'+':''}
            </div>
          ))}
        </div>
      </div>
      <div onClick={()=>setVideo(true)} style={{ border:`2px dashed ${video?'#6DBE45':'#D8E6EE'}`, borderRadius:8, padding:'18px', textAlign:'center', cursor:'pointer', background:video?'#EEF7E8':'#F5F8FA', marginBottom:24 }}>
        {video?<span style={{ color:'#3E7A22', fontWeight:600 }}>âœ“ Video attached (mock)</span>:<span style={{ color:'#64748B' }}>Add work video (recommended, under 3 mins)</span>}
      </div>
      <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Client reference emails</div>
      {refs.map((r,i)=>(
        <input key={i} type="email" value={r} onChange={e=>setRefs(prev=>{const n=[...prev];n[i]=e.target.value;return n})} placeholder={`Client ${i+1} email address`} style={{ ...inputStyle, marginBottom:8 }} />
      ))}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:16 }}>
        <Btn variant="ghost" onClick={()=>setStep(7)}>â† Back</Btn>
        <Btn onClick={()=>save(9)} disabled={photos<5}>Continue â†’</Btn>
      </div>
    </div>,

    // Step 9 - Reputation
    <div key={9}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Reputation scan</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>Automated scan across search engines, social media, news, and review platforms.</p>
      <InfoBox type="info">This scan runs continuously throughout your membership â€” not just at application. All material findings are reviewed by a TradieCheck Analyst before any action is taken.</InfoBox>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Btn variant="ghost" onClick={()=>setStep(8)}>â† Back</Btn>
        <Btn onClick={runReputation} disabled={busy}>{busy?<span style={{ display:'flex', alignItems:'center', gap:8 }}><Spinner/>{busyMsg}</span>:'Run reputation scan â†’'}</Btn>
      </div>
    </div>,

    // Step 10 - Subscription
    <div key={10}>
      <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Choose your subscription</div>
      <p style={{ color:'#64748B', marginBottom:24 }}>All tiers include the TradieCheck Verified badge. Upgrade for TradieWallet and deeper monitoring.</p>
      {TIERS.map(t=>(
        <div key={t.id} onClick={()=>setTier(t.id)} style={{ padding:'20px 22px', borderRadius:10, border:`2px solid ${tier===t.id?'#1E90D4':t.highlight?'#E6F1FB':'#D8E6EE'}`, background:tier===t.id?'#E6F1FB':'#fff', cursor:'pointer', marginBottom:12, position:'relative' }}>
          {t.highlight&&<div style={{ position:'absolute', top:-11, left:18, background:'#1E90D4', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:10 }}>Most popular</div>}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
            <div><div style={{ fontSize:16, fontWeight:700 }}>{t.id}</div>{t.wallet&&<div style={{ fontSize:11, color:'#1E90D4', fontWeight:600 }}>Includes TradieWallet</div>}</div>
            <div><span style={{ fontSize:24, fontWeight:800 }}>${t.price}</span><span style={{ fontSize:12, color:'#64748B' }}>/mo</span></div>
          </div>
          <ul style={{ margin:0, padding:'0 0 0 16px', fontSize:13, color:'#64748B', lineHeight:1.7 }}>{t.features.map(f=><li key={f}>{f}</li>)}</ul>
        </div>
      ))}
      <InfoBox type="info">Annual billing available at 15% discount. Payment processed on approval only.</InfoBox>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Btn variant="ghost" onClick={()=>setStep(9)}>â† Back</Btn>
        <Btn onClick={()=>save(11)}>Submit application â†’</Btn>
      </div>
    </div>,

    // Step 11 - Done
    <div key={11} style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>âœ…</div>
      <h2 style={{ fontSize:24, fontWeight:800, color:'#3E7A22', marginBottom:12 }}>Application submitted</h2>
      <p style={{ fontSize:15, color:'#64748B', lineHeight:1.7, marginBottom:28 }}>A Verification Analyst will review your documents within 3 business days. Two-person sign-off is required before your badge is issued.</p>
      <div style={{ background:'#F5F8FA', borderRadius:10, padding:'20px 24px', textAlign:'left', marginBottom:28 }}>
        {[['Entity',company?.entityName??'â€”'],['Director',director||'â€”'],['Credit result',credit?.result??'â€”'],['Combined score',`${combinedScore}/90`],['Work categories',`${trades.length} selected`],['Subscription',tier]].map(([k,v])=>(
          <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #D8E6EE', fontSize:13.5 }}>
            <span style={{ color:'#64748B' }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
      <Link href="/" style={{ display:'inline-block', padding:'12px 28px', background:'#1E90D4', color:'#fff', borderRadius:8, fontWeight:600, fontSize:15, textDecoration:'none' }}>Back to TradieCheck Registers</Link>
    </div>,
  ]

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontFamily:"'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif", minHeight:'100vh', background:'#F5F8FA', padding:'24px 16px 60px' }}>
        <div style={{ maxWidth:620, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <Image src="/TradieCheckLogo_transparent.png" alt="TradieCheck" width={160} height={40} style={{ objectFit:'contain' }} priority />
            <div style={{ fontSize:13, color:'#64748B', marginTop:6 }}>Path A Verification â€” Company / Trust / Partnership</div>
          </div>
          {step < 11 && <ProgressBar step={step} total={12} />}
          <div style={{ background:'#fff', border:'1px solid #D8E6EE', borderRadius:12, padding:'32px 36px' }}>
            {steps[step]}
          </div>
          {step > 0 && step < 11 && (
            <div style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#64748B' }}>
              Progress saved automatically{appId&&` Â· ID: ${appId.slice(0,8)}â€¦`}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
