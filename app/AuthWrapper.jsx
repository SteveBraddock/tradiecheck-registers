'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import Login from './login'

function ResetForm({ onBack }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setMessage('Password updated!')
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#F5F8FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#FFF", borderRadius: 12, padding: 40, width: 360, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #D8E6EE" }}>
        <img src="/logo.png" alt="TradieCheck" style={{ display: "block", margin: "0 auto 20px", height: 80 }} />
        <p style={{ color: "#888", textAlign: "center", marginBottom: 28, fontSize: 13 }}>Set your new password</p>
        {message ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#1B7A4A", fontSize: 14, marginBottom: 20 }}>{message}</div>
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#4AABDB", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Back to TradieCheck</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #D8E6EE", borderRadius: 6, fontSize: 14, boxSizing: "border-box", color: "#3D3D3D" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #D8E6EE", borderRadius: 6, fontSize: 14, boxSizing: "border-box", colo