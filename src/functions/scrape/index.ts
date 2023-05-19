import { http, Request, Response } from '@google-cloud/functions-framework';
import WillHabenService from '../../services/willHaben.service';
import DiscordService from '../../services/discord.service';

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
  const discordService = new DiscordService(
    process.env.DISCORD_TOKEN,
    process.env.DISCORD_CHANNEL_ID
  );

  let flats = await willHabenService.getFlats();
  flats = flats.slice(0, 3);
  await discordService.connect();
  await Promise.all(
    flats.map(async flat => {
      const isMessagePosted = await discordService.isFlatPosted(flats[0].id);
      if (!isMessagePosted) {
        discordService.publishMessage(discordService.constructEmbed(flat));
      }
    })
  );
  await discordService.disconnect();
};

main();
