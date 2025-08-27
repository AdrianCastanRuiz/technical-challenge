import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import tmdbRoutes from './api/tmdb.routes.mjs';
import { TMDB_TOKEN_V4 } from './tmdb.secrets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readFlag(name, def = false) {
  return process.argv.includes(name) ? true : def;
}
function readOpt(name, def) {
  const prefix = `${name}=`;
  const arg = process.argv.find(a => a.startsWith(prefix));
  if (!arg) return def;
  const v = arg.slice(prefix.length);
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

const isProd =
  readFlag('--prod') ||
  fs.existsSync(path.resolve(__dirname, 'dist/server/entry-server.js'));

let vite;
const app = express();

if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const serveStatic = (await import('serve-static')).default;
  app.use(compression());
  app.use(
    serveStatic(path.resolve(__dirname, 'dist/client'), {
      index: false, 
    })
  );
}

app.use('/api/tmdb', tmdbRoutes({ token: TMDB_TOKEN_V4 }));

app.use(async (req, res, next) => {
  try {
    let template = isProd
      ? fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8')
      : fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

    if (!isProd && vite) {
      template = await vite.transformIndexHtml(req.originalUrl, template);
    }

    const mod = isProd
      ? await import(path.resolve(__dirname, 'dist/server/entry-server.js'))
      : await vite.ssrLoadModule('/src/entry-server.tsx');

    const forwardedProto = req.get('x-forwarded-proto');
    const forwardedHost = req.get('x-forwarded-host');
    const origin =
      (forwardedProto && forwardedHost)
        ? `${forwardedProto}://${forwardedHost}`
        : (req.protocol && req.get('host'))
          ? `${req.protocol}://${req.get('host')}`
          : 'http://localhost';

    const absoluteUrl = new URL(req.originalUrl, origin).toString();

    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v || ''])
    );

    const result = await mod.render(absoluteUrl, headers);

    if ('redirect' in result) {
      const status = result.status || 302;
      if (result.headers) res.set(result.headers);
      return res.redirect(status, result.redirect);
    }

    if (result.hydrationData === null) {
      const status = result.status || 500;
      if (result.headers) res.set(result.headers);
      return res.status(status).send(result.html);
    }

    const hydrationScript =
      `<script>window.__STATIC_ROUTER_DATA__=${JSON.stringify(result.hydrationData).replace(/</g, '\\u003c')}</script>`;

    const html = template
      .replace('<!--ssr-outlet-->', result.html)
      .replace('</body>', `${hydrationScript}\n</body>`);

    const status = result.status || 200;
    res.status(status).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    if (!isProd && vite) vite.ssrFixStacktrace(e);
    next(e);
  }
});

const port = readOpt('--port', 5173);
app.listen(port, () => {
  console.log(`[${isProd ? 'prod' : 'dev'}] listo en http://localhost:${port}`);
});
