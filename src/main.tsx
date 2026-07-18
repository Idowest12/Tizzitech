import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppRescueBoundary } from './components/AppRescueBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRescueBoundary>
      <GoogleOAuthProvider clientId={(import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '850466444828-ocjc7iotr69hsv8e29hntu1no1n0aege.apps.googleusercontent.com'}>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </GoogleOAuthProvider>
    </AppRescueBoundary>
  </StrictMode>,
);

