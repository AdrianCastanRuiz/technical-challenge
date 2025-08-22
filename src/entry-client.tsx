import './global.scss';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
