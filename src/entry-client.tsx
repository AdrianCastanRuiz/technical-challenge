import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, type RouterState } from 'react-router';
import { routes } from './routes';

type Hydration = Partial<Pick<RouterState, 'loaderData' | 'actionData' | 'errors'>>;

declare global {
  interface Window {
    __STATIC_ROUTER_DATA__?: Hydration;
  }
}

const router = createBrowserRouter(routes, {
  hydrationData: window.__STATIC_ROUTER_DATA__,
});

hydrateRoot(
  document.getElementById('root')!,
  <RouterProvider router={router} />
);
