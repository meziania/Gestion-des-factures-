import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const LS_KEY = 'gdf_auth_v1'

function readLocalAuth() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocalAuth(value) {
  try {
    if (!value) localStorage.removeItem(LS_KEY)
    else localStorage.setItem(LS_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('user') // user | admin
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const existing = readLocalAuth()
    if (existing?.user) {
      setUser(existing.user)
      setRole(existing.role || 'user')
    }
    setLoading(false)
  }, [])

  const login = async ({ email, password }) => {
    if (!email || !password) throw new Error('Email et mot de passe requis')

    const nextRole = email.toLowerCase().includes('admin') ? 'admin' : 'user'
    const nextUser = { uid: email, email }

    setUser(nextUser)
    setRole(nextRole)
    writeLocalAuth({ user: nextUser, role: nextRole })
  }

  const logout = async () => {
    setUser(null)
    setRole('user')
    writeLocalAuth(null)
  }

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      login,
      logout,
    }),
    [user, role, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

