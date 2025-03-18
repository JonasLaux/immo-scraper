import { CloudEventFunction } from '@google-cloud/functions-framework';
import WillHabenService from '../../services/willHaben.service';
import DiscordService from '../../services/discord.service';

import 'source-map-support/register';
import willHabenConfig from './willhaben.config';
import ImmoSuchmaschineService from '../../services/immoSuchmaschine.service';

const willHabenService = new WillHabenService();
const immoSuchmaschineService = new ImmoSuchmaschineService();
// No payload needed for now
export const scrape: CloudEventFunction = async () => {
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
    const [willHabenFlats, immoSuchmaschineFlats] = await Promise.all([
      willHabenService.getFlats(willHabenConfig),
      immoSuchmaschineService.getFlats(),
    ]);
    const flats = [...willHabenFlats, ...immoSuchmaschineFlats];

    await discordService.connect();

    // Fetch the channel once
    const channel = await discordService.getChannel();

    // Fetch all messages from the channel once
    const messages = await channel.messages.fetch({ limit: 100 });

    let messagesPosted = 0;
    await Promise.all(
      flats.map(async flat => {
        const isMessagePosted = await discordService.isFlatPosted(
          flat.id,
          messages
        );
        if (!isMessagePosted) {
          // Pass the channel to publishMessage
          await discordService.publishMessage(
            discordService.constructEmbed(flat),
            channel
          );
          messagesPosted++;
        }
      })
    );
    console.log(`Posted ${messagesPosted} messages`);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await discordService.disconnect();
  }
};

export default scrape;
