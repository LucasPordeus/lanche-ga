import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function registrarAtividade({ tipo, uid, sabado, descricao }) {
  await addDoc(collection(db, 'atividades'), {
    tipo,
    uid,
    sabado: sabado || null,
    descricao,
    criadoEm: serverTimestamp(),
  })
}

export function ouvirAtividadesRecentes(callback, qtd = 10, onError) {
  const q = query(collection(db, 'atividades'), orderBy('criadoEm', 'desc'), limit(qtd))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}
