import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './app/router/AppRouter';
import './index.css';

// Aplica el tema guardado antes de renderizar (incluida la pantalla de login).
document.documentElement.classList.toggle('dark', localStorage.getItem('gfo_theme') === 'dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
