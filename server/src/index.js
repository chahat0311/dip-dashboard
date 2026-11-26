import 'dotenv/config';
import { createApp } from './app.js';
import { createPool } from './db.js';

const pool = createPool();
const app = createApp({ pool });
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`DIP Dashboard API listening on port ${port}`);
});
