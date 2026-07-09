
window.addEventListener('error', function(e) {
  document.body.innerHTML += '<div style="color:red;position:fixed;top:0;left:0;z-index:9999;background:white;padding:20px;">' + e.error?.message + '<br/>' + e.error?.stack + '</div>';
});
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AdminApp from './AdminApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
