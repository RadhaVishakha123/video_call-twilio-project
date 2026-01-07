import dotenv from 'dotenv';
import http from 'http';
dotenv.config();
import app from './app';
import { InitSocket } from './socket/socket';
const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = http.createServer(app);
InitSocket(server);
server.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
