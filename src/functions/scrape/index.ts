import { http, Request, Response } from '@google-cloud/functions-framework';
import WillHabenService from '../../services/willHaben.service';
import DiscordService from '../../services/discord.service';
import { constructMessage } from '../../services/util.service';

const willHabenService = new WillHabenService();

http('scrape', async (req: Request, res: Response) => {
  await willHabenService.getFlats();
  res.send('OK!');
});

// test + hot-reload
const main = async () => {
  if (
    !process.env.DISCORD_TOKEN &&
    typeof process.env.DISCORD_TOKEN !== 'string'
  ) {
    throw new Error('DISCORD_TOKEN env variable is not set');
  }
  if (
    !process.env.DISCORD_CHANNEL_ID &&
    typeof process.env.DISCORD_CHANNEL_ID !== 'string'
  ) {
    throw new Error('DISCORD_CHANNEL_ID env variable is not set');
  }
  console.log(process.env.DISCORD_TOKEN);
  const discordService = new DiscordService(
    process.env.DISCORD_TOKEN,
    process.env.DISCORD_CHANNEL_ID
  );

  const flats = await willHabenService.getFlats();
  await discordService.connect();
  await Promise.all(
    flats.map(flat => discordService.publishMessage(constructMessage(flat)))
  );
  await discordService.disconnect();
};

main();
