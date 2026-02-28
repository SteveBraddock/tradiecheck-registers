'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setMessage('Password updated! You can now sign in with your new password.')
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
            <a href="/" style={{ color: "#4AABDB", fontSize: 13 }}>Go to TradieCheck</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #D8E6EE", borderRadius: 6, fontSize: 14, boxSizing: "border-box", color: "#3D3D3D" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #D8E6EE", borderRadius: 6, fontSize: 14, boxSizing: "border-box", color: "#3D3D3D" }} />
            </div>
            {error && <div style={{ color: "#B02020", fontSize: 13, marginBottom: 14, textAlign: "center" }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#4AABDB", color: "#FFF", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

**Ctrl + S** to save.

Now go to your Supabase dashboard → **Authentication** → **Email Templates** → click on **Reset Password**. Change the URL in the email template from:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
```

To:
```
{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery