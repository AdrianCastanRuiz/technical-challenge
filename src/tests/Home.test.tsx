import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';

describe('Home', () => {
  it('renderiza el contenedor principal <main>', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renderiza 3 carousels con los títulos correctos', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Cada <Carousel> usa <section aria-label={title}> → role="region"
    const regions = screen.getAllByRole('region');
    expect(regions).toHaveLength(3);

    // Comprueba los encabezados visibles dentro de cada región
    const headings = regions.map(r => within(r).getByRole('heading', { level: 2 }));

    expect(headings[0]).toHaveTextContent('Action');
    expect(headings[1]).toHaveTextContent('Comedy');
    expect(headings[2]).toHaveTextContent('Drama');

    // También puedes localizarlos directamente
    expect(screen.getByRole('region', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Comedy' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Drama' })).toBeInTheDocument();
  });

  it('mantiene el orden Action → Comedy → Drama', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const regions = screen.getAllByRole('region');
    const names = regions.map(r => r.getAttribute('aria-label'));
    expect(names).toEqual(['Action', 'Comedy', 'Drama']);
  });
});
