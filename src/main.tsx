import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { QueryProvider } from '@/lib/query'
import { setTokenGetter } from '@/lib/api'

// Initialize token getter via local storage decoupling store from Axios
setTokenGetter(() => {
  try {
    const token = localStorage.getItem('gymapp_admin_v3_access_token')
    if (token) return token

    const raw = localStorage.getItem('gymapp_admin_v3_current_user')
    if (!raw) return null
    const user = JSON.parse(raw) as { accessToken?: string }
    return user.accessToken || null
  } catch {
    return null
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
)
