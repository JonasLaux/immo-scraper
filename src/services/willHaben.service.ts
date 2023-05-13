import { chromium } from 'playwright';

type FlatElement = {
  description: string;
  id: string;
};

export class WillHabenService {
  private url = `https://www.willhaben.at/iad/immobilien/mietwohnungen/mietwohnung-angebote?areaId=117224&PRICE_TO=2500&ESTATE_SIZE/LIVING_AREA_FROM=90`;
  public async doScrape() {
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(this.url, {});

    try {
      const dataRaw = await page.locator('#__NEXT_DATA__').textContent();
      if (dataRaw) {
        const data = JSON.parse(dataRaw);
        data.props?.pageProps?.searchResult?.advertSummaryList?.advertSummary?.forEach(
          (element: FlatElement) => {
            console.log(element.description);
          }
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      await browser.close();
    }
  }
}
