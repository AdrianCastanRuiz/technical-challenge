import { render, screen } from '@testing-library/react';
import Loading from '../components/Loading/Index';

describe('Loading', () => {
  it('renderiza por defecto con nombre accesible y atributos ARIA correctos', () => {
    render(<Loading />);

    const status = screen.getByRole('status', { name: /loading/i });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('aplica tamaño al spinner y usa label personalizado', () => {
    render(<Loading size={48} label="Cargando…" />);

    // nombre accesible personalizado
    const status = screen.getByRole('status', { name: 'Cargando…' });
    expect(status).toBeInTheDocument();

    // El spinner es el PRIMER span dentro del status
    const spinner = status.querySelector('span') as HTMLElement;
    expect(spinner).toBeTruthy();

    // Estilos inline generados a partir de size=48 (borderWidth = max(2, round(48/8)) = 6)
    expect(spinner).toHaveStyle('width: 48px; height: 48px; border-width: 6px;');
  });

  it('cuando overlay=true, el status está envuelto por un overlay (padre distinto)', () => {
    render(<Loading overlay label="Loading overlay" />);

    const status = screen.getByRole('status', { name: 'Loading overlay' });
    const overlay = status.parentElement as HTMLElement;

    expect(overlay).toBeTruthy();
    expect(overlay).not.toBe(status);        // está envuelto
    // y el overlay contiene al status
    expect(overlay.contains(status)).toBe(true);
  });
});
