import { doc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        setPerfil(null)
        setCarregando(false)
      }
    })
    return unsubAuth
  }, [])

  useEffect(() => {
    if (!user) return
    setCarregando(true)
    const unsubDoc = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setPerfil(snap.exists() ? { uid: snap.id, ...snap.data() } : null)
        setCarregando(false)
      },
      (erro) => {
        console.error('Erro ao carregar perfil:', erro)
        setPerfil(null)
        setCarregando(false)
      },
    )
    return unsubDoc
  }, [user])

  const value = {
    user,
    perfil,
    carregando,
    aprovado: perfil?.status === 'aprovado',
    pendente: perfil?.status === 'pendente',
    admin: perfil?.papel === 'admin' && perfil?.status === 'aprovado',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
