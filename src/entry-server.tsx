import { renderToString } from 'react-dom/server';
import { AppRoutes } from './routes';
import { StaticRouter } from 'react-router-dom';

export async function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  );
}
