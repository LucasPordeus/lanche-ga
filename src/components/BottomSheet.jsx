import { useEffect } from 'react'

export default function BottomSheet({ aberto, onClose, titulo, children }) {
  useEffect(() => {
    if (!aberto) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [aberto])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className="safe-bottom relative w-full max-w-lg rounded-t-2xl bg-white p-5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 md:rounded-2xl md:p-6"
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-600 md:hidden" />
        {titulo && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{titulo}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
