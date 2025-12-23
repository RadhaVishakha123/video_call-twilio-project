import express from 'express';
import cors from 'cors';
import tokenRoutes from './routes/token-routes';
import roomRoutes from './routes/room-routes';
import authRoutes from './routes/authroutes';
import refreshaccessRoutes from "./routes/refreshaccessroutes"
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", tokenRoutes);
app.use("api",roomRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/refresh",refreshaccessRoutes);

export default app;
