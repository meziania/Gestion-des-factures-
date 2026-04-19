import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getDatabase,
  push,
  ref,
  remove,
  set,
  get,
  child,
  update,
} from 'firebase/database'

function getFirebaseConfig() {
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  if (!cfg.apiKey || !cfg.databaseURL || !cfg.projectId) return null
  return cfg
}

function ensureApp() {
  const cfg = getFirebaseConfig()
  if (!cfg) return null
  if (getApps().length) return getApps()[0]
  return initializeApp(cfg)
}

function ensureAuth() {
  const app = ensureApp()
  if (!app) {
    throw new Error(
      'Firebase non configuré. Créez un fichier .env avec VITE_FIREBASE_API_KEY, VITE_FIREBASE_DATABASE_URL, VITE_FIREBASE_PROJECT_ID, etc.',
    )
  }
  return getAuth(app)
}

function ensureDb() {
  const app = ensureApp()
  if (!app) {
    throw new Error(
      'Firebase non configuré. Renseignez les variables VITE_FIREBASE_* dans .env',
    )
  }
  return getDatabase(app)
}

async function readList(path) {
  const db = ensureDb()
  const snap = await get(child(ref(db), path))
  const val = snap.val() || {}
  return Object.entries(val).map(([id, data]) => ({ id, ...data }))
}

/** Rôle stocké dans Realtime Database : users/{uid}/role = "admin" | "user" */
async function getUserRole(uid) {
  const db = ensureDb()
  const snap = await get(child(ref(db), `users/${uid}`))
  const val = snap.val()
  if (!val) return 'user'
  return val.role === 'admin' ? 'admin' : 'user'
}

/** Crée le document utilisateur à l’inscription (rôle par défaut : user). */
async function ensureUserProfile(uid, email) {
  const db = ensureDb()
  const userRef = ref(db, `users/${uid}`)
  const snap = await get(userRef)
  if (snap.val()) return
  await set(userRef, {
    email,
    role: 'user',
    createdAt: Date.now(),
  })
}

export const firebaseService = {
  isConfigured: () => Boolean(getFirebaseConfig()),

  /** Connexion Email / Mot de passe (Authentication) */
  signInWithEmail: (email, password) =>
    signInWithEmailAndPassword(ensureAuth(), email, password),

  /** Inscription Email / Mot de passe + entrée dans Realtime DB `users/` */
  signUpWithEmail: async (email, password) => {
    const cred = await createUserWithEmailAndPassword(ensureAuth(), email, password)
    await ensureUserProfile(cred.user.uid, cred.user.email || email)
    return cred
  },

  signOut: () => signOut(ensureAuth()),

  /** Écoute les changements de session Firebase Auth */
  subscribeAuthState: (callback) => {
    const auth = ensureAuth()
    return onAuthStateChanged(auth, callback)
  },

  getUserRole,

  listClients: () => readList('clients'),
  createClient: async (data) => {
    const db = ensureDb()
    const newRef = push(ref(db, 'clients'))
    await set(newRef, data)
    return { id: newRef.key, ...data }
  },
  updateClient: async (id, data) => {
    const db = ensureDb()
    await update(ref(db, `clients/${id}`), data)
    return { id, ...data }
  },
  deleteClient: async (id) => {
    const db = ensureDb()
    await remove(ref(db, `clients/${id}`))
    return true
  },

  listFactures: () => readList('factures'),
  createFacture: async (data) => {
    const db = ensureDb()
    const newRef = push(ref(db, 'factures'))
    await set(newRef, data)
    return { id: newRef.key, ...data }
  },
  updateFacture: async (id, data) => {
    const db = ensureDb()
    await update(ref(db, `factures/${id}`), data)
    return { id, ...data }
  },
  deleteFacture: async (id) => {
    const db = ensureDb()
    await remove(ref(db, `factures/${id}`))
    return true
  },
}
