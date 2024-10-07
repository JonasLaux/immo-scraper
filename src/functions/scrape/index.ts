import { HttpFunction } from '@google-cloud/functions-framework';
import WillHabenService from '../../services/willHaben.service';
import DiscordService from '../../services/discord.service';

import 'source-map-support/register';
import willHabenConfig from './willhaben.config';

const willHabenService = new WillHabenService();

export const scrape: HttpFunction = async (req, res) => {
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

  try {
    const flats = await willHabenService.getFlats(willHabenConfig);
    await discordService.connect();
    await Promise.all(
      flats.map(async flat => {
        const isMessagePosted = await discordService.isFlatPosted(flat.id);
        if (!isMessagePosted) {
          return discordService.publishMessage(
            discordService.constructEmbed(flat)
          );
        }
      })
    );
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('An error occurred');
  } finally {
    await discordService.disconnect();
  }

  res.send('OK!');
};

export default scrape;
