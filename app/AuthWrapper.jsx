'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Login from './login'

export default function AuthWrapper({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (!session) return <Login onLogin={() => {}} />

  return (
    <div>
      <div style={{ position: "fixed", top: 8, right: 12, zIndex: 9999 }}>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "transparent", border: "1px solid #D8E6EE", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "#888", cursor: "pointer", fontFamily: "sans-serif" }}>
          Sign Out
        </button>
      </div>
      {children}
    </div>
  )
}