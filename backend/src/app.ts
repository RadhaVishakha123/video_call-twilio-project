import express from "express";
import cors from "cors";
import tokenRoutes from "./routes/tokenroutes"
import roomRoutes from "./routes/roomroutes"
import refreshaccessRoutes from "./routes/refreshaccessroutes"
import authRoutes from './routes/authroutes'
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", tokenRoutes);
app.use("api",roomRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/refresh",refreshaccessRoutes);

export default app;
