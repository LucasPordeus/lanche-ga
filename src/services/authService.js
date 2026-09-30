import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ADMIN_EMAIL, auth, db, googleProvider } from '../firebase'

function papelEStatusIniciais(email) {
  const admin = ADMIN_EMAIL && email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  return {
    papel: admin ? 'admin' : 'membro',
    status: admin ? 'aprovado' : 'pendente',
  }
}

async function garantirDocUsuario(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()

  const { papel, status } = papelEStatusIniciais(user.email)
  const dados = {
    nome: user.displayName || user.email?.split('@')[0] || 'Novo membro',
    email: user.email,
    foto: user.photoURL || null,
    papel,
    status,
    criadoEm: serverTimestamp(),
  }
  await setDoc(ref, dados)
  return dados
}

export async function cadastrar({ nome, email, senha }) {
  const cred = await createUserWithEmailAndPassword(auth, email, senha)
  if (nome) await updateProfile(cred.user, { displayName: nome })
  await garantirDocUsuario({ ...cred.user, displayName: nome || cred.user.displayName })
  return cred.user
}

export async function entrarComEmail({ email, senha }) {
  const cred = await signInWithEmailAndPassword(auth, email, senha)
  await garantirDocUsuario(cred.user)
  return cred.user
}

export async function entrarComGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  await garantirDocUsuario(cred.user)
  return cred.user
}

export async function recuperarSenha(email) {
  await sendPasswordResetEmail(auth, email)
}

export async function sair() {
  await signOut(auth)
}
