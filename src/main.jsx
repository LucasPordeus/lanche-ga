import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const root = createRoot(document.getElementById('root'))

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  root.render(
    <div style={{ maxWidth: 480, margin: '10vh auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Configuração pendente</h1>
      <p>
        Preencha o arquivo <code>.env</code> com as credenciais do seu projeto Firebase (veja{' '}
        <code>.env.example</code> e o <code>README.md</code>) e reinicie o servidor.
      </p>
    </div>,
  )
} else {
  Promise.all([import('react-router-dom'), import('react-hot-toast'), import('./App.jsx')]).then(
    ([{ BrowserRouter }, { Toaster }, { default: App }]) => {
      root.render(
        <StrictMode>
          <BrowserRouter>
            <App />
            <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
          </BrowserRouter>
        </StrictMode>,
      )
    },
  )
}
