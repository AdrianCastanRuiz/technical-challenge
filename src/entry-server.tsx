import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
  type StaticHandlerContext,
} from 'react-router';
import { routes } from './routes';

function toAbsolute(u: string) {
  try {
    return new URL(u).toString();           
  } catch {
    return new URL(u, 'http://localhost').toString(); 
  }
}

type RenderOk = {
  html: string;
  hydrationData: StaticHandlerContext;
  status?: number;
  headers?: Record<string, string>;
};
type RenderRedirect = { redirect: string; status?: number; headers?: Record<string, string> };
type RenderError = { html: string; hydrationData: null; status: number; headers?: Record<string, string> };

export async function render(
  url: string,
  headers: Record<string, string> = {}
): Promise<RenderOk | RenderRedirect | RenderError> {
  const { query, dataRoutes } = createStaticHandler(routes);
  const absUrl = toAbsolute(url);                         // 👈 asegura absoluta
  const request = new Request(absUrl, { headers, method: 'GET' });

  const contextOrResponse = await query(request);

  if (contextOrResponse instanceof Response) {
    const location = contextOrResponse.headers.get('Location');
    if (location && contextOrResponse.status >= 300 && contextOrResponse.status < 400) {
      return {
        redirect: location,
        status: contextOrResponse.status,
        headers: Object.fromEntries(contextOrResponse.headers.entries()),
      };
    }
    const body = await contextOrResponse.text().catch(() => '');
    return {
      html: body || `<html><body><h1>Error ${contextOrResponse.status}</h1></body></html>`,
      hydrationData: null,
      status: contextOrResponse.status || 500,
      headers: Object.fromEntries(contextOrResponse.headers.entries()),
    };
  }

  const context = contextOrResponse as StaticHandlerContext;
  const router = createStaticRouter(dataRoutes, context);
  const html = renderToString(<StaticRouterProvider router={router} context={context} />);
  const status = (context as any).statusCode ?? 200;

  return { html, hydrationData: context, status };
}
