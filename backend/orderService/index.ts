import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';

const app = express();
const port = 4003;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Order Service is running' });
});

app.use('/orders', orderRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Order Service listening at http://localhost:${port}`);
});