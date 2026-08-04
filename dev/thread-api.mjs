import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeIndex } from '../scripts/build-index.mjs';

const pexec = promisify(execFile);
const ROOT = 'public/threads';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 50e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const send = (res, code, obj) => {
  res.statusCode = code; res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
};
// 僅允許安全 id / filename，擋路徑穿越
const safe = s => /^[A-Za-z0-9._一-鿿-]+$/.test(s);

async function handle(req, res) {
  const url = req.url.split('?')[0];
  const body = await readBody(req);
  if (url === '/api/thread') {
    const t = body.thread;
    if (!t?.id || !safe(t.id)) return send(res, 400, { error: 'bad id' });
    const dir = path.join(ROOT, t.id);
    await fs.mkdir(path.join(dir, 'images'), { recursive: true });
    await fs.writeFile(path.join(dir, 'post.json'), JSON.stringify(t, null, 2));
    return send(res, 200, { ok: true });
  }
  if (url === '/api/thread/delete') {
    if (!safe(body.id)) return send(res, 400, { error: 'bad id' });
    await fs.rm(path.join(ROOT, body.id), { recursive: true, force: true });
    return send(res, 200, { ok: true });
  }
  if (url === '/api/upload') {
    const { id, filename, dataUrl } = body;
    if (!safe(id) || !safe(filename)) return send(res, 400, { error: 'bad name' });
    const b64 = String(dataUrl).replace(/^data:[^;]+;base64,/, '');
    await fs.mkdir(path.join(ROOT, id, 'images'), { recursive: true });
    await fs.writeFile(path.join(ROOT, id, 'images', filename), Buffer.from(b64, 'base64'));
    return send(res, 200, { path: `images/${filename}` });
  }
  if (url === '/api/publish') {
    try {
      const idx = writeIndex();
      const msg = body.message || `post: update (${idx.length} threads)`;
      await pexec('git', ['add', '-A']);
      await pexec('git', ['commit', '-m', msg]);
      const { stdout } = await pexec('git', ['push']);
      return send(res, 200, { ok: true, log: stdout, count: idx.length });
    } catch (e) {
      return send(res, 200, { ok: false, error: e.stderr || e.message });
    }
  }
  return send(res, 404, { error: 'not found' });
}

/** @returns {import('vite').Plugin} */
export default function threadApiPlugin() {
  return {
    name: 'thread-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url.startsWith('/api/')) {
          handle(req, res).catch(e => send(res, 500, { error: String(e) }));
        } else next();
      });
    },
  };
}
