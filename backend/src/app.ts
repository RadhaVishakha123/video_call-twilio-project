import express from 'express';
import cors from 'cors';
import tokenRoutes from './routes/token-routes';
import roomRoutes from './routes/room-routes';
import authRoutes from './routes/auth-routes';
import refreshaccessRoutes from "./routes/refreshaccess-routes"
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/token", tokenRoutes);
app.use("api/room",roomRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/refresh",refreshaccessRoutes);

export default app;
