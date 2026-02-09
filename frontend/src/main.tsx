import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './components/providers';
import { router } from './router';
import i18n from './lib/i18n';
import './index.css';

// Wait for i18n to initialize before rendering
i18n.on('initialized', () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </React.StrictMode>
  );
});

// If i18n is already initialized (shouldn't happen, but just in case)
if (i18n.isInitialized) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </React.StrictMode>
  );
}
