import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { registrarAtividade } from './atividadesService'
import { situacaoTroca } from './trocasRegras'
import { formatarDataBr, hojeIso } from '../utils/datas'

export function ouvirTrocas(callback, onError) {
  const q = query(collection(db, 'trocas'), orderBy('criadaEm', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

/** Pede para trocar `sabado` (meu) por `sabadoDestino` (do colega). */
export async function solicitarTroca({ sabado, sabadoDestino, solicitanteUid, destinatarioUid }) {
  await addDoc(collection(db, 'trocas'), {
    sabado,
    sabadoDestino,
    solicitanteUid,
    destinatarioUid,
    status: 'pendente',
    criadaEm: serverTimestamp(),
    respondidaEm: null,
  })
}

async function sabadosAtuais(troca) {
  const [origem, destino] = await Promise.all([
    getDoc(doc(db, 'sabados', troca.sabado)),
    getDoc(doc(db, 'sabados', troca.sabadoDestino)),
  ])
  return new Map(
    [origem, destino].filter((s) => s.exists()).map((s) => [s.id, { id: s.id, ...s.data() }]),
  )
}

/** Aceita a troca invertendo os responsáveis das duas datas numa única gravação. */
export async function aceitarTroca(troca) {
  const situacao = situacaoTroca(troca, await sabadosAtuais(troca), hojeIso())
  if (situacao !== 'valida') {
    const erro = new Error(
      situacao === 'expirada' ? 'Essa troca expirou.' : 'A escala mudou; essa troca não vale mais.',
    )
    erro.amigavel = true
    throw erro
  }

  const batch = writeBatch(db)
  batch.update(doc(db, 'trocas', troca.id), { status: 'aceita', respondidaEm: serverTimestamp() })
  batch.update(doc(db, 'sabados', troca.sabado), {
    responsavelUid: troca.destinatarioUid,
    trocaId: troca.id,
    atualizadoEm: serverTimestamp(),
  })
  batch.update(doc(db, 'sabados', troca.sabadoDestino), {
    responsavelUid: troca.solicitanteUid,
    trocaId: troca.id,
    atualizadoEm: serverTimestamp(),
  })
  await batch.commit()

  await registrarAtividade({
    tipo: 'troca_aceita',
    uid: troca.destinatarioUid,
    sabado: troca.sabado,
    descricao: `Troca aceita: ${formatarDataBr(troca.sabado)} ⇄ ${formatarDataBr(troca.sabadoDestino)}`,
  })
}

export async function recusarTroca(troca) {
  await updateDoc(doc(db, 'trocas', troca.id), {
    status: 'recusada',
    respondidaEm: serverTimestamp(),
  })
  await registrarAtividade({
    tipo: 'troca_recusada',
    uid: troca.destinatarioUid,
    sabado: troca.sabado,
    descricao: `Troca recusada: ${formatarDataBr(troca.sabado)} ⇄ ${formatarDataBr(troca.sabadoDestino)}`,
  })
}

/** O próprio solicitante desiste de um pedido ainda pendente. */
export async function cancelarTroca(troca) {
  await updateDoc(doc(db, 'trocas', troca.id), {
    status: 'cancelada',
    respondidaEm: serverTimestamp(),
  })
}
