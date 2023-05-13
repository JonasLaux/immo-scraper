import type { AxiosError } from 'axios';
import { http, Request, Response } from '@google-cloud/functions-framework';
import { WillHabenService } from '../../services/willHaben.service';

const willHabenService = new WillHabenService();

http('scrape', async (req: Request, res: Response) => {
  await willHabenService.doScrape();
  res.send('OK!');
});

// test + hot-reload
willHabenService.doScrape();
