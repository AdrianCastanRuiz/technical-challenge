import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import WishList from '../../pages/WishList/Index';

jest.mock('../../../api/tmdb', () => ({
  posterUrl: (path: string, _size?: string) => `https://img.test/${path}`,
}));

const LS_KEY = 'wishlist';

const seedLS = (items: Array<{ id: number; title: string; poster_path: string | null; year?: string }>) => {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
};

describe('WishList', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('muestra loading inicial y luego estado vacío si no hay items', async () => {
    render(
      <MemoryRouter>
        <WishList />
      </MemoryRouter>
    );

    expect(await screen.findByText(/your wish list is empty/i)).toBeInTheDocument();

    const discover = screen.getByRole('link', { name: /discover movies/i });
    expect(discover).toHaveAttribute('href', '/');
  });

  it('renderiza items desde localStorage y muestra cabecera y contador', async () => {
    seedLS([
      { id: 1, title: 'Movie One', poster_path: '/p1.jpg', year: '2020' },
      { id: 2, title: 'Movie Two', poster_path: null,        year: '2021' },
    ]);

    render(
      <MemoryRouter>
        <WishList />
      </MemoryRouter>
    );

    const heading = await screen.findByRole('heading', { level: 1, name: /wish list/i });
    expect(heading).toBeInTheDocument();

    expect(screen.getByLabelText('2 items')).toBeInTheDocument();

    const link1 = screen.getByRole('link', { name: /open movie one/i });
    const link2 = screen.getByRole('link', { name: /open movie two/i });
    expect(link1).toHaveAttribute('href', '/movie/1');
    expect(link2).toHaveAttribute('href', '/movie/2');

    expect(screen.getByRole('img', { name: 'Movie One' })).toBeInTheDocument();

    expect(screen.getByLabelText(/no image/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /clear wish list/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /remove movie one from wish list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove movie two from wish list/i })).toBeInTheDocument();
  });

  it('elimina un item al pulsar "Remove" y actualiza contador y localStorage', async () => {
    seedLS([
      { id: 1, title: 'Movie One', poster_path: '/p1.jpg' },
      { id: 2, title: 'Movie Two', poster_path: '/p2.jpg' },
    ]);

    render(
      <MemoryRouter>
        <WishList />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 1, name: /wish list/i });
    expect(screen.getByLabelText('2 items')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /remove movie two from wish list/i }));

    expect(screen.queryByRole('link', { name: /open movie two/i })).not.toBeInTheDocument();

    expect(screen.getByLabelText('1 items')).toBeInTheDocument(); // así lo construye tu componente

    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    expect(saved).toEqual([{ id: 1, title: 'Movie One', poster_path: '/p1.jpg' }]);
  });

  it('vacía todo al pulsar "Clear all" y muestra estado vacío', async () => {
    seedLS([
      { id: 1, title: 'Movie One', poster_path: '/p1.jpg' },
      { id: 2, title: 'Movie Two', poster_path: null },
    ]);

    render(
      <MemoryRouter>
        <WishList />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 1, name: /wish list/i });

    await userEvent.click(screen.getByRole('button', { name: /clear wish list/i }));

    expect(await screen.findByText(/your wish list is empty/i)).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    expect(saved).toEqual([]);
  });
});
