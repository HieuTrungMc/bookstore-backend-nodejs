import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(
  '/book',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
  })
);

app.use(
  '/cart',
  createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
  })
);
app.get('/', (req, res) => {
  res.json({ message: 'API Gateway is running' });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running at http://localhost:${PORT}`);
});