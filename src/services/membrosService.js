import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, signOut, updateProfile } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { app, db } from '../firebase'
import { registrarAtividade } from './atividadesService'

export function ouvirMembros(callback, onError) {
  const q = query(collection(db, 'users'), orderBy('nome'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
    onError,
  )
}

export async function aprovarMembro(uid, executorUid) {
  await updateDoc(doc(db, 'users', uid), { papel: 'membro', status: 'aprovado' })
  const snap = await getDoc(doc(db, 'users', uid))
  await registrarAtividade({
    tipo: 'membro_aprovado',
    uid: executorUid,
    descricao: `${snap.data()?.nome || 'Novo membro'} foi aprovado no grupo`,
  })
}

export async function desativarMembro(uid) {
  await updateDoc(doc(db, 'users', uid), { status: 'inativo' })
}

export async function reativarMembro(uid) {
  await updateDoc(doc(db, 'users', uid), { status: 'aprovado' })
}

export async function promoverAdmin(uid) {
  await updateDoc(doc(db, 'users', uid), { papel: 'admin' })
}

export async function rebaixarMembro(uid) {
  await updateDoc(doc(db, 'users', uid), { papel: 'membro' })
}

export async function atualizarPerfil(uid, { nome, foto }) {
  const dados = {}
  if (nome !== undefined) dados.nome = nome
  if (foto !== undefined) dados.foto = foto
  await updateDoc(doc(db, 'users', uid), dados)
}

/**
 * Cria uma conta de membro já aprovada, sem deslogar o admin.
 * O cadastro roda numa instância secundária do Firebase (para não trocar a sessão
 * atual); o doc nasce como "pendente" — único estado que as regras permitem a quem
 * se cadastra — e em seguida o admin o aprova.
 */
export async function criarMembroPeloAdmin({ nome, email, senha }, executorUid) {
  const secundario = initializeApp(app.options, `criacao-${Date.now()}`)
  try {
    const authSec = getAuth(secundario)
    const cred = await createUserWithEmailAndPassword(authSec, email, senha)
    await updateProfile(cred.user, { displayName: nome })
    await setDoc(doc(getFirestore(secundario), 'users', cred.user.uid), {
      nome,
      email: cred.user.email,
      foto: null,
      papel: 'membro',
      status: 'pendente',
      criadoEm: serverTimestamp(),
    })
    await signOut(authSec)
    await aprovarMembro(cred.user.uid, executorUid)
    return cred.user.uid
  } finally {
    await deleteApp(secundario)
  }
}
