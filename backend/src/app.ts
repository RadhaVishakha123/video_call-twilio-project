import express from 'express';
import cors from 'cors';
import tokenRoutes from './routes/token-routes';
import roomRoutes from './routes/room-routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/token', tokenRoutes);
app.use('/api/room', roomRoutes);

export default app;
