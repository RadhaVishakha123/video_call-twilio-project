import express from 'express';
import cors from 'cors';
import tokenRoutes from './routes/token-routes';
import roomRoutes from './routes/room-routes';
import { Authenticate } from './middleware/auth-middleware';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/token', Authenticate, tokenRoutes);
app.use('/api/room', Authenticate, roomRoutes);

export default app;
