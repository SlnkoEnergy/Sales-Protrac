import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './services/context/AuthContext'
import AuthSyncListener from './AuthSyncListener'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthSyncListener>
    <App />
    </AuthSyncListener>
    </AuthProvider>
  </StrictMode>
)
