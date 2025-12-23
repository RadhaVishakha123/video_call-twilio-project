import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import {ConnectDB} from './config/db'
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
ConnectDB();
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
