const express = require('express');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
app.use(express.json());

app.post('/proxy', async (req, res) => {
  const secret = req.headers['x-proxy-secret'];
  if (secret !== process.env.PROXY_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const agent = new HttpsProxyAgent(process.env.QUOTAGUARDSTATIC_URL);
    const response = await fetch('https://api.digiflazz.com/v2/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      agent,
    });
    const data = await response.text();
    res.status(response.status)
      .set('Content-Type', 'application/json')
      .send(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
