'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else if (onLogin) onLogin()
    setLoading(false)
  }

  async function handleReset(e) {
    e.preventDefault()
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')
    setMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError(error.message)
    else setMessage('Check your email for a reset link.')
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#F5F8FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#FFF", borderRadius: 12, padding: 40, width: 360, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #D8E6EE" }}>
        <img src="/logo.png" alt="TradieCheck" style={{ display: "block", margin: "0 auto 20px", height: 80 }} />
        <p style={{ color: "#888", textAlign: "center", marginBottom: 28, fontSize: 13 }}>{resetMode ? "Reset your password" : "Sign in to continue"}</p>
        <form onSubmit={resetMode ? handleReset : handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #D8E6EE", borderRadius: 6, fontSize: 14, boxSizing: "border-box", color: "#3D3D3D" }} />
          </div>
          {!resetMode && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #D8E6EE", borderRadius: 6, fontSize: 14, boxSizing: "border-box", color: "#3D3D3D" }} />
            </div>
          )}
          {error && <div style={{ color: "#B02020", fontSize: 13, marginBottom: 14, textAlign: "center" }}>{error}</div>}
          {message && <div style={{ color: "#1B7A4A", fontSize: 13, marginBottom: 14, textAlign: "center" }}>{message}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#4AABDB", color: "#FFF", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>
            {loading ? (resetMode ? "Sending..." : "Signing in...") : (resetMode ? "Send Reset Link" : "Sign In")}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => { setResetMode(!resetMode); setError(''); setMessage(''); }} style={{ background: "none", border: "none", color: "#4AABDB", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
            {resetMode ? "Back to Sign In" : "Forgot password?"}
          </button>
        </div>
      </div>
    </div>
  )
}