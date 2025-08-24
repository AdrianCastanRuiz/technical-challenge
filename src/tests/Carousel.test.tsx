import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Carousel from '../components/Carousel';
// Mock del módulo de la API
jest.mock('../../api/tmdb', () => ({
  posterUrl: (p: string) => `https://img.test/${p}`,
  discoverByGenre: jest.fn(),
}));

import { discoverByGenre } from '../../api/tmdb';

const moviesPage = (page: number, total_pages: number, count: number, startId = 1) => ({
  page,
  total_pages,
  results: Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Movie ${startId + i}`,
    poster_path: `p${startId + i}.jpg`,
  })),
});

describe('Carousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra loading y luego renderiza películas', async () => {
    (discoverByGenre as jest.Mock).mockResolvedValueOnce(
      moviesPage(1, 2, 5) // 5 resultados en la primera página
    );

    render(
      <MemoryRouter>
        <Carousel title="Top Action" genreId={28} />
      </MemoryRouter>
    );

    // Loading visible
    expect(screen.getByLabelText(/Loading Top Action/i)).toBeInTheDocument();

    // Espera a que aparezca el primer título
    expect(await screen.findByText('Movie 1')).toBeInTheDocument();
    // Deben estar 5 visibles (PAGE_SIZE = 5)
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Movie ${i}`)).toBeInTheDocument();
    }
  });

  test('al pulsar Next pide otra página cuando no hay más locales', async () => {
    // 1ª carga: 5 pelis (una "slide" completa)
    (discoverByGenre as jest.Mock)
      .mockResolvedValueOnce(moviesPage(1, 2, 5))
      // 2ª página desde API: otras 5
      .mockResolvedValueOnce(moviesPage(2, 2, 5, 6));

    render(
      <MemoryRouter>
        <Carousel title="Top Action" genreId={28} />
      </MemoryRouter>
    );

    // Espera render inicial
    await screen.findByText('Movie 1');

    // Next debería estar habilitado porque hay más remoto
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    expect(nextBtn).toBeEnabled();

    // Click en Next -> no hay más locales, así que fetch de página 2 y avanza
    await userEvent.click(nextBtn);

    // Espera a que aparezca contenido de la segunda tanda
    await waitFor(() => {
      expect(screen.getByText('Movie 6')).toBeInTheDocument();
    });
  });

  test('deshabilita Prev al inicio', async () => {
    (discoverByGenre as jest.Mock).mockResolvedValueOnce(moviesPage(1, 1, 5));

    render(
      <MemoryRouter>
        <Carousel title="Top Action" genreId={28} />
      </MemoryRouter>
    );

    await screen.findByText('Movie 1');

    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    expect(prevBtn).toBeDisabled();
  });

  test('muestra estado de error si la API falla', async () => {
    (discoverByGenre as jest.Mock).mockRejectedValueOnce(new Error('Network down'));

    render(
      <MemoryRouter>
        <Carousel title="Top Action" genreId={28} />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Error:/i)).toHaveTextContent('Network down');
  });
});
