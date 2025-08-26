import { Link, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout/Layout';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetail/Index';
import WishList from './pages/WishList/Index';
import { MovieDetailProvider } from './contexts/MovieDetailContext';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="movie/:id" element={<MovieDetailProvider><MovieDetails /></MovieDetailProvider>} />
        <Route path="wishlist" element={<WishList />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return (
    <main>
      <h2>404</h2>
      <p>Page not found. <Link to="/">Go back</Link></p>
    </main>
  );
}
