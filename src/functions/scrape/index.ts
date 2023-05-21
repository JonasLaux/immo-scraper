import { http, Request, Response } from '@google-cloud/functions-framework';
import WillHabenService, {
  WillHabenConfig,
} from '../../services/willHaben.service';
import {
  VIENNADISTRICTS,
  PROPERTYTYPES,
  FREEAREATYPES,
} from '../../services/willHaben.types';
import DiscordService from '../../services/discord.service';

const willHabenService = new WillHabenService();

http('scrape', async (req: Request, res: Response) => {
  // await willHabenService.getFlats();
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

  const willHabenConfig: WillHabenConfig = {
    AREA_ID: [
      VIENNADISTRICTS.FIRST,
      VIENNADISTRICTS.SECOND,
      VIENNADISTRICTS.THIRD,
      VIENNADISTRICTS.FOURTH,
      VIENNADISTRICTS.FIFTH,
      VIENNADISTRICTS.SIXTH,
      VIENNADISTRICTS.SEVENTH,
      VIENNADISTRICTS.EIGHTH,
      VIENNADISTRICTS.NINTH,
    ],
    PROPERTY_TYPE: [
      PROPERTYTYPES.APARTMENT,
      PROPERTYTYPES.COOPERATIVE_APARTMENT,
      PROPERTYTYPES.PENTHOUSE,
      PROPERTYTYPES.MAISONETTE,
      PROPERTYTYPES.GROUND_FLOOR_APARTMENT,
      PROPERTYTYPES.TOPFLOOR_APARTMENT,
      PROPERTYTYPES.LOFT,
    ],
    FREE_AREA_TYPE: [
      FREEAREATYPES.BALCONY,
      FREEAREATYPES.GARDEN,
      FREEAREATYPES.LOGGIA,
      FREEAREATYPES.ROOFTERRACE,
      FREEAREATYPES.TERRACE,
      FREEAREATYPES.WINTERGARDEN,
    ],
    PRICE_FROM: '700',
    PRICE_TO: '2500',
    keyword: 'fernwärme',
    LIVING_AREA_FROM: '85',
    TIME_PERIOD: '2',
  };

  let flats = await willHabenService.getFlats(willHabenConfig);
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
