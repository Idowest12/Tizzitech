
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AdminApp from './AdminApp.tsx';
import './index.css';
import { AppRescueBoundary } from './components/AppRescueBoundary';

window.addEventListener('error', function(e) {
  console.error("Global admin error caught:", e.error);
  // Do not leak stack traces to the UI directly. Let the AppRescueBoundary or backend handle logging.
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRescueBoundary>
      <AdminApp />
    </AppRescueBoundary>
  </StrictMode>,
);
