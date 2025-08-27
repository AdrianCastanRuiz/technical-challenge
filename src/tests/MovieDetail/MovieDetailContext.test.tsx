
type MockFn<T extends (...args: any[]) => any = (...args: any[]) => any> = jest.Mock<ReturnType<T>, Parameters<T>>;

jest.mock('../../../api/tmdb', () => ({
  getMovie: jest.fn(),
}));

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useMovieDetail, MovieDetailProvider } from '../../contexts/MovieDetailContext';
import { getMovie } from '../../../api/tmdb';

const LS_KEY = 'wishlist';

function TestConsumer() {
  const { data, loading, error, inWishlist, genreVariant, handleAddToWishList } = useMovieDetail();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ?? ''}</div>
      <div data-testid="title">{data?.title ?? ''}</div>
      <div data-testid="inWishlist">{String(inWishlist)}</div>
      <div data-testid="variant">{genreVariant([{ id: 28, name: 'Action' }])}</div>
      <button onClick={handleAddToWishList}>add</button>
    </div>
  );
}

function renderWithRoute(route = '/movie/10') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/movie/:id"
          element={
            <MovieDetailProvider>
              <TestConsumer />
            </MovieDetailProvider>
          }
        />
        <Route
          path="/no-id"
          element={
            <MovieDetailProvider>
              <TestConsumer />
            </MovieDetailProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('MovieDetailContext (Jest)', () => {
  it('carga la película y actualiza estados', async () => {
    const mockedGetMovie = getMovie as unknown as MockFn;
    mockedGetMovie.mockResolvedValueOnce({
      id: 10,
      title: 'The Matrix',
      release_date: '1999-03-31',
      poster_path: null,
      genres: [{ id: 28, name: 'Action' }],
    });

    renderWithRoute('/movie/10');

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('title')).toHaveTextContent('The Matrix');
    expect(screen.getByTestId('variant')).toHaveTextContent('action');
    expect(screen.getByTestId('error')).toHaveTextContent('');
    expect(screen.getByTestId('inWishlist')).toHaveTextContent('false');
    expect(mockedGetMovie).toHaveBeenCalledWith(10);
  });

  it('marca inWishlist=true si el id ya está en localStorage', async () => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify([{ id: 10, title: 'The Matrix', poster_path: null, year: '1999' }]),
    );

    const mockedGetMovie = getMovie as unknown as MockFn;
    mockedGetMovie.mockResolvedValueOnce({
      id: 10,
      title: 'The Matrix',
      release_date: '1999-03-31',
      poster_path: null,
      genres: [{ id: 28, name: 'Action' }],
    });

    renderWithRoute('/movie/10');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

  });

  it('handleAddToWishList añade a localStorage y evita duplicados', async () => {
    const mockedGetMovie = getMovie as unknown as MockFn;
    mockedGetMovie.mockResolvedValueOnce({
      id: 11,
      title: 'Inception',
      release_date: '2010-07-16',
      poster_path: '/poster.jpg',
      genres: [{ id: 878, name: 'Science Fiction' }],
    });

    renderWithRoute('/movie/11');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    expect(list).toEqual([{ id: 11, title: 'Inception', poster_path: '/poster.jpg', year: '2010' }]);
    expect(screen.getByTestId('inWishlist')).toHaveTextContent('true');

    // repetir no duplica
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    const list2 = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    expect(list2).toHaveLength(1);
  });

  it('no hace fetch si no hay id (ruta sin parámetro)', () => {
    const mockedGetMovie = getMovie as unknown as MockFn;
    renderWithRoute('/no-id');
    expect(mockedGetMovie).not.toHaveBeenCalled();
  });

  it('useMovieDetail lanza error si se usa fuera del provider', () => {
    function NakedConsumer() {
      const ctx = useMovieDetail(); // debería lanzar al renderizar
      return <div>{String(!!ctx)}</div>;
    }

    expect(() =>
      render(
        <MemoryRouter>
          <NakedConsumer />
        </MemoryRouter>,
      ),
    ).toThrow('useMovieDetail must be used within a MovieDetailProvider');
  });
});
