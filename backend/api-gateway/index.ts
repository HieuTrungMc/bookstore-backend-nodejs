import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Security middleware
app.use(helmet());
app.use(cors());


// Proxy middleware setup
app.use(
  '/book',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
  })
);

app.use(
  '/chat',
  createProxyMiddleware({
    target: 'http://168.138.168.177:8000/',
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

app.use(
  '/user',
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
  })
);

// User statistics
app.use('/statistics/users',
  createProxyMiddleware({
    target: 'http://localhost:5003/',
    changeOrigin: true,
  })
);

// Order and sales statistics
app.use('/statistics/orders',
  createProxyMiddleware({
    target: 'http://localhost:5002/',
    changeOrigin: true,
  })
);

app.use('/statistics/sales',
  createProxyMiddleware({
    target: 'http://localhost:5001/',
    changeOrigin: true,
  })
);

// Book statistics
app.use('/statistics/top-books',
  createProxyMiddleware({
    target: 'http://localhost:5001/',
    changeOrigin: true,
  })
);

app.get('/', (req, res) => {
  res.json({ message: 'API Gateway is running' });
});

// Start HTTP server (optional, you can remove this if you only want HTTPS)
app.listen(PORT, () => {
  console.log(`API Gateway (HTTP) is running at http://localhost:${PORT}`);
});

// SSL options - paths to certificate files
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

// Create HTTPS server
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`API Gateway (HTTPS) is running at https://localhost:${HTTPS_PORT}`);
});
