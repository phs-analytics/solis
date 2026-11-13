import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './ui/tokens.css';
import './ui/components.css';
import './app.css';
import { App } from './App.tsx';
import { aplicarPreferencias, seguirSistema } from './ui/preferencias.ts';

aplicarPreferencias();
seguirSistema();

// Catalog exists only in dev builds; Vite drops this branch from production.
const Catalogo = import.meta.env.DEV ? lazy(() => import('./Catalogo.tsx')) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Catalogo && location.hash === '#catalogo' ? (
      <Suspense>
        <Catalogo />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
