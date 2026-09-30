import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

export function ouvirIndisponibilidades(callback, onError) {
  const q = query(collection(db, 'indisponibilidades'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export function ouvirIndisponibilidadesDoUsuario(uid, callback, onError) {
  const q = query(collection(db, 'indisponibilidades'), where('uid', '==', uid))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export async function marcarIndisponibilidade({ uid, data, motivo }) {
  await addDoc(collection(db, 'indisponibilidades'), { uid, data, motivo: motivo || '' })
}

export async function removerIndisponibilidade(id) {
  await deleteDoc(doc(db, 'indisponibilidades', id))
}
