import * as dotenv from 'dotenv';
import { scrape } from './functions/scrape';
dotenv.config();

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CHANNEL_ID) {
  throw new Error('DISCORD_TOKEN and DISCORD_CHANNEL_ID must be set');
}

export { scrape };
