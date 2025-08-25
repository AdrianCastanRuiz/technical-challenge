import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MovieDetails from '../pages/MovieDetail/Index'; 


jest.mock('../../api/tmdb', () => ({
  getMovie: jest.fn(),
  posterUrl: jest.fn((p: string) => `https://img.test${p}`),
}));

import { getMovie } from '../../api/tmdb';
const LS_KEY = 'wishlist';

const makeMovie = (overrides: Partial<any> = {}) => ({
  id: 123,
  title: 'Test Movie',
  poster_path: '/p.jpg',
  release_date: '2024-05-17',
  vote_average: 7.234,
  overview: 'A very nice movie.',
  genres: [{ id: 28, name: 'Action' }],
  ...overrides,
});

function renderWithRoute(path = '/movie/123') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MovieDetails', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('muestra estado de loading y luego los detalles', async () => {
    (getMovie as jest.Mock).mockResolvedValueOnce(makeMovie());

    renderWithRoute();

    expect(screen.getByRole('status', { name: /loading movie/i })).toBeInTheDocument();

    expect(await screen.findByRole('heading', { level: 1, name: 'Test Movie' })).toBeInTheDocument();

    const img = screen.getByRole('img', { name: 'Test Movie' }) as HTMLImageElement;
    expect(img.src).toContain('https://img.test/p.jpg'); 

    expect(screen.getByText(/2024 · ⭐ 7\.2/)).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: /add "test movie" to wish list/i });
    expect(addBtn).toBeEnabled();
    expect(addBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('muestra un error si getMovie falla', async () => {
    (getMovie as jest.Mock).mockRejectedValueOnce(new Error('Network down'));

    renderWithRoute();

    expect(await screen.findByText(/error: /i)).toHaveTextContent('Network down');
  });

  it('añade a la wishlist al pulsar el botón y lo deja deshabilitado', async () => {
    (getMovie as jest.Mock).mockResolvedValueOnce(makeMovie());

    renderWithRoute();

    await screen.findByRole('heading', { level: 1, name: 'Test Movie' });

    const addBtn = screen.getByRole('button', { name: /add "test movie" to wish list/i });
    await userEvent.click(addBtn);

    expect(screen.getByRole('button', { name: /already in wish list: test movie/i })).toBeDisabled();
    expect(screen.getByText('Added ✓')).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    expect(saved).toEqual([
      {
        id: 123,
        title: 'Test Movie',
        poster_path: '/p.jpg',
        year: '2024',
      },
    ]);
  });

it('si ya está en wishlist, el botón aparece deshabilitado desde el inicio (esperando al efecto)', async () => {
  localStorage.setItem(
    'wishlist',
    JSON.stringify([{ id: 123, title: 'Test Movie', poster_path: '/p.jpg', year: '2024' }])
  );

  (getMovie as jest.Mock).mockResolvedValueOnce(makeMovie());

  renderWithRoute();

  await screen.findByRole('heading', { level: 1, name: 'Test Movie' });

  const btn = await screen.findByRole('button', { pressed: true });

  expect(btn).toBeDisabled();
  expect(btn).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Added ✓')).toBeInTheDocument();
});



  it('si no hay datos retorna null (no explota) — id inválido', async () => {
    (getMovie as jest.Mock).mockResolvedValueOnce(null);

    const { container } = renderWithRoute('/movie/NaN');
    await screen.findByRole('status', { name: /loading movie/i });
    expect(container.querySelector('article')).toBeNull();
  });
});
