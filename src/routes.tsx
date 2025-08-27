import { type RouteObject, Link } from 'react-router'; 
import Layout from './pages/Layout/Layout';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetail/Index';
import WishList from './pages/WishList/Index';
import { MovieDetailProvider } from './contexts/MovieDetailContext';

function NotFound() {
  return (
    <main>
      <h2>404</h2>
      <p>
        Page not found. <Link to="/">Go back</Link>
      </p>
    </main>
  );
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'movie/:id',
        element: (
          <MovieDetailProvider>
            <MovieDetails />
          </MovieDetailProvider>
        ),
      },
      { path: 'wishlist', element: <WishList /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];


export function AppRoutes() {
  return null; 
}
