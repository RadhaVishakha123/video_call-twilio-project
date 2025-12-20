import express from "express";
import cors from "cors";
import tokenRoutes from "./routes/tokenroutes"
import roomRoutes from "./routes/roomroutes"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", tokenRoutes);
app.use("api",roomRoutes);

export default app;
