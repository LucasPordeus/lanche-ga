import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { registrarAtividade } from './atividadesService'
import { formatarDataBr, hojeIso } from '../utils/datas'
import { podeConfirmarEntrega } from '../utils/sabados'

export function ouvirSabados(callback, onError) {
  const q = query(collection(db, 'sabados'), orderBy('data'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export async function atribuirResponsavel(id, responsavelUid) {
  await updateDoc(doc(db, 'sabados', id), {
    responsavelUid,
    status: 'agendado',
    atualizadoEm: serverTimestamp(),
  })
}

export async function cancelarSabado(id, executorUid) {
  await updateDoc(doc(db, 'sabados', id), {
    status: 'cancelado',
    atualizadoEm: serverTimestamp(),
  })
  await registrarAtividade({
    tipo: 'sabado_cancelado',
    uid: executorUid,
    sabado: id,
    descricao: `Sábado ${formatarDataBr(id)} foi cancelado`,
  })
}

export async function reabrirSabado(id) {
  await updateDoc(doc(db, 'sabados', id), {
    status: 'agendado',
    atualizadoEm: serverTimestamp(),
  })
}

function garantirConfirmavel(sabado) {
  if (!podeConfirmarEntrega(sabado, hojeIso())) {
    throw new Error('Só é possível confirmar sábados de hoje ou anteriores, com responsável.')
  }
}

export async function marcarEntregue(sabado, { descricaoLanche, executorUid } = {}) {
  garantirConfirmavel(sabado)
  const dados = {
    status: 'entregue',
    entregueEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  }
  if (descricaoLanche !== undefined) dados.descricaoLanche = descricaoLanche
  await updateDoc(doc(db, 'sabados', sabado.id), dados)
  await registrarAtividade({
    tipo: 'entrega',
    uid: executorUid,
    sabado: sabado.id,
    descricao: `Lanche do sábado ${formatarDataBr(sabado.id)} marcado como entregue`,
  })
}

export async function marcarNaoEntregue(sabado, { executorUid } = {}) {
  garantirConfirmavel(sabado)
  await updateDoc(doc(db, 'sabados', sabado.id), {
    status: 'nao_entregue',
    entregueEm: null,
    atualizadoEm: serverTimestamp(),
  })
  await registrarAtividade({
    tipo: 'nao_entregue',
    uid: executorUid,
    sabado: sabado.id,
    descricao: `Lanche do sábado ${formatarDataBr(sabado.id)} marcado como não entregue`,
  })
}

/** Volta um sábado confirmado para "agendado", para corrigir uma marcação errada. */
export async function desfazerConfirmacao(sabado) {
  garantirConfirmavel(sabado)
  await updateDoc(doc(db, 'sabados', sabado.id), {
    status: 'agendado',
    entregueEm: null,
    atualizadoEm: serverTimestamp(),
  })
}
