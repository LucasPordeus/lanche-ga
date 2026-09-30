/**
 * O admin só confirma entrega (ou falta) de sábados que já chegaram: hoje ou antes,
 * nunca datas futuras, e só quando havia alguém escalado.
 */
export function podeConfirmarEntrega(sabado, hoje) {
  return !!sabado && sabado.id <= hoje && sabado.status !== 'cancelado' && !!sabado.responsavelUid
}
