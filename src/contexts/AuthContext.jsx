import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { firebaseService } from '../services/firebaseService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(true)

  const firebaseReady = firebaseService.isConfigured()

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false)
      return undefined
    }

    const unsub = firebaseService.subscribeAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setRole('user')
        setLoading(false)
        return
      }
      try {
        const r = await firebaseService.getUserRole(firebaseUser.uid)
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email })
        setRole(r)
      } catch {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email })
        setRole('user')
      }
      setLoading(false)
    })

    return () => unsub()
  }, [firebaseReady])

  const login = useCallback(async ({ email, password }) => {
    if (!firebaseService.isConfigured()) {
      throw new Error('Firebase non configuré. Ajoutez les variables VITE_FIREBASE_* dans .env')
    }
    await firebaseService.signInWithEmail(email.trim(), password)
  }, [])

  const register = useCallback(async ({ email, password }) => {
    if (!firebaseService.isConfigured()) {
      throw new Error('Firebase non configuré. Ajoutez les variables VITE_FIREBASE_* dans .env')
    }
    await firebaseService.signUpWithEmail(email.trim(), password)
  }, [])

  const logout = useCallback(async () => {
    if (!firebaseService.isConfigured()) return
    await firebaseService.signOut()
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      firebaseReady,
      login,
      register,
      logout,
    }),
    [user, role, loading, firebaseReady, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
