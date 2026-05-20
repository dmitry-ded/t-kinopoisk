export default async function handler(req, res) {
  const backend = (process.env.BACK4APP_API_URL || '').replace(/\/$/, '');
  if (!backend) {
    res.status(500).json({ message: 'BACK4APP_API_URL is not configured on Vercel' });
    return;
  }

  const pathParam = req.query.path;
  const subPath = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || '';
  const queryStart = req.url?.indexOf('?') ?? -1;
  const rawQuery = queryStart >= 0 ? req.url.slice(queryStart + 1) : '';
  const extra = rawQuery ? `?${rawQuery}` : '';
  const target = `${backend}/api/${subPath}${extra}`;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;

  const init = {
    method: req.method,
    headers,
    redirect: 'manual',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  const upstream = await fetch(target, init);
  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') return;
    res.setHeader(key, value);
  });
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}