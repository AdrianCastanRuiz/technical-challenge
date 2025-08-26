import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

jest.mock('../../contexts/CarouselContext', () => ({
  useCarousel: jest.fn(),
}));

jest.mock('../../../api/tmdb', () => ({
  posterUrl: (p: string) => `https://img.test${p}`,
}));

import Carousel from '../../components/Carousel/Index';
import { useCarousel } from '../../contexts/CarouselContext';
import type { TmdbMovie } from '../../types/TmdbMovie';

type UC = jest.MockedFunction<typeof useCarousel>;

const fakeMovie = (id: number, withPoster = true, overrides: Partial<TmdbMovie> = {}): TmdbMovie => ({
  id,
  title: `Movie ${id}`,
  poster_path: withPoster ? `/p${id}.jpg` : null,
  overview: 'Lorem ipsum',
  release_date: '2024-01-01',
  total_pages: 1,
  vote_average: 2,
  genres: [{id: 2, name: "Acttion" }]
});

describe('Carousel (presentational)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra estado de loading', () => {
    (useCarousel as UC).mockReturnValue({
      items: [],
      loading: true,
      error: null,
      pageIndex: 0,
      isFetchingMore: false,
      canPrev: false,
      canNext: false,
      visible: [],
      prev: jest.fn(),
      next: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Carousel title="Action" />
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: /loading action/i })).toBeInTheDocument();
  });

  it('muestra estado de error', () => {
    (useCarousel as UC).mockReturnValue({
      items: [],
      loading: false,
      error: 'Boom',
      pageIndex: 0,
      isFetchingMore: false,
      canPrev: false,
      canNext: false,
      visible: [],
      prev: jest.fn(),
      next: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Carousel title="Action" />
      </MemoryRouter>
    );

    expect(screen.getByText(/error: boom/i)).toBeInTheDocument();
  });

  it('muestra estado vacío', () => {
    (useCarousel as UC).mockReturnValue({
      items: [],
      loading: false,
      error: null,
      pageIndex: 0,
      isFetchingMore: false,
      canPrev: false,
      canNext: false,
      visible: [],
      prev: jest.fn(),
      next: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Carousel title="Action" />
      </MemoryRouter>
    );

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it('renderiza tarjetas y llama a next/prev correctamente', async () => {
    const prev = jest.fn();
    const next = jest.fn();

    (useCarousel as UC).mockReturnValue({
      items: [fakeMovie(1), fakeMovie(2, false)],
      loading: false,
      error: null,
      pageIndex: 0,
      isFetchingMore: false,
      canPrev: false,
      canNext: true,
      visible: [fakeMovie(1), fakeMovie(2, false)],
      prev,
      next,
    });

    render(
      <MemoryRouter>
        <Carousel title="Action" />
      </MemoryRouter>
    );

    expect(screen.getByRole('img', { name: 'Movie 1' })).toBeInTheDocument();
    expect(screen.getByLabelText(/no image/i)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /previous/i });
    const nextBtn = screen.getByRole('button', { name: /next/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    await userEvent.click(nextBtn);
    expect(next).toHaveBeenCalledTimes(1);

    await userEvent.click(prevBtn); 
    expect(prev).not.toHaveBeenCalled();
  });

  it('muestra loader inline cuando isFetchingMore=true', () => {
    (useCarousel as UC).mockReturnValue({
      items: [fakeMovie(1)],
      loading: false,
      error: null,
      pageIndex: 0,
      isFetchingMore: true,
      canPrev: false,
      canNext: false,
      visible: [fakeMovie(1)],
      prev: jest.fn(),
      next: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Carousel title="Action" />
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: /loading more/i })).toBeInTheDocument();
  });
});
