import { Link, Routes, Route } from 'react-router-dom';
import UI from './components/UI';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import WishList from './pages/WishList';


export function AppRoutes() {
  return (
    <Routes>
      <Route element={<UI />}>
        <Route index element={<Home />} />
        <Route path="movie/:id" element={<MovieDetails />} />
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
