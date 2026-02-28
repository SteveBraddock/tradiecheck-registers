'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import Login from './login'

export default function AuthWrapper({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#F5F8FA", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>Loading...</div>

  if (!session && pathname !== '/reset-password') return <Login onLogin={() => {}} />

  return (
    <div>
      <div style={{ background: "#3D3D3D", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: 13 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/" style={{ color: "#FFF", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>TradieCheck</Link>
          <Link href="/register" style={{ color: pathname === "/register" ? "#4AABDB" : "#AAA", textDecoration: "none", fontWeight: pathname === "/register" ? 700 : 400 }}>Register</Link>
          <Link href="/actions" style={{ color: pathname === "/actions" ? "#4AABDB" : "#AAA", textDecoration: "none", fontWeight: pathname === "/actions" ? 700 : 400 }}>Actions</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#888", fontSize: 12 }}>{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "#4AABDB", border: "none", borderRadius: 4, padding: "5px 12px", fontSize: 12, color: "#FFF", cursor: "pointer", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}