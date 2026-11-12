import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './app/router/AppRouter';
import { installNumericInputGuard } from './core/utils/numericInputGuard';
import './index.css';

// Aplica el tema guardado antes de renderizar (incluida la pantalla de login).
document.documentElement.classList.toggle('dark', localStorage.getItem('gfo_theme') === 'dark');

// Evita que al borrar un número quede "0" fijo y al escribir "125" se forme "0125".
installNumericInputGuard();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
