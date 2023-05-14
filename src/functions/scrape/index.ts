import { http, Request, Response } from '@google-cloud/functions-framework';
import { WillHabenService } from '../../services/willHaben.service';
import { DiscordPublisher } from '../../services/discord.service';

const willHabenService = new WillHabenService();
const discordPublisher = new DiscordPublisher();

http('scrape', async (req: Request, res: Response) => {
  await willHabenService.doScrape();
  res.send('OK!');
});

// test + hot-reload
// willHabenService.doScrape();
const main = async () => {
  await discordPublisher.connect();
  await discordPublisher.publishMessage('Ale is mean!');
  discordPublisher.disconnect();
};

main();
