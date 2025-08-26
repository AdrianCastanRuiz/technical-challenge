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
      index: false, // deja index.html al SSR
    })
  );
}

/* ========= API (montar antes del SSR) ========= */
app.use('/api/tmdb', tmdbRoutes({ token: TMDB_TOKEN_V4 }));

/* ============= SSR catch-all ============= */
app.use(async (req, res, next) => {
  try {
    const url = req.originalUrl;

    let template = isProd
      ? fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8')
      : fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

    if (!isProd) {
      template = await vite.transformIndexHtml(url, template);
    }

    const render = isProd
      ? (await import(path.resolve(__dirname, 'dist/server/entry-server.js'))).render
      : (await vite.ssrLoadModule('/src/entry-server.tsx')).render;

    const appHtml = await render(url);
    const html = template.replace('<!--ssr-outlet-->', appHtml);

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    if (!isProd && vite) vite.ssrFixStacktrace(e);
    next(e);
  }
});

const port = readOpt('--port', 5173);
app.listen(port, () => {
  console.log(`[${isProd ? 'prod' : 'dev'}] listo en http://localhost:${port}`);
});
