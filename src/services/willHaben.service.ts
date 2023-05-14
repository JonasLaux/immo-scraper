import { chromium } from 'playwright';
import { FlatElement } from '../types';
const dayjs = require('dayjs');

type AdvertImage = {
  mainImageUrl: string;
};

type ContextLinks = {
  id: string;
  uri: string;
};
type Attribute = {
  name: string;
  values: string[];
};

type TeaserAttributes = {
  postfix: string;
  value: string;
};
export default class WillHabenService {
  private url =
    'https://www.willhaben.at/iad/immobilien/mietwohnungen/mietwohnung-angebote?areaId=117224&PRICE_TO=2500&ESTATE_SIZE/LIVING_AREA_FROM=90';
  public async getFlats(): Promise<FlatElement[]> {
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(this.url);

    try {
      const dataRaw = await page.locator('#__NEXT_DATA__').textContent();
      if (dataRaw) {
        const flats: Array<FlatElement> = [];
        const data = JSON.parse(dataRaw);
        data.props?.pageProps?.searchResult?.advertSummaryList?.advertSummary?.forEach(
          (element: any) => {
            // Get that date
            const publishedAtRaw = JSON.parse(
              element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'PUBLISHED'
              ).values[0]
            );

            const images = element.advertImageList.advertImage.map(
              (image: AdvertImage) => image.mainImageUrl
            );
            const publishedAt = dayjs(publishedAtRaw).format('DD.MM.YYYY');

            const newFlat: FlatElement = {
              description: element.description,
              link: element.contextLinkList.contextLink.find(
                (links: ContextLinks) => links.id === 'iadShareLink'
              ).uri,
              location: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'LOCATION'
              ).values[0],
              price: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'PRICE_FOR_DISPLAY'
              ).values[0],
              squareMeters: element.teaserAttributes.find(
                (attr: TeaserAttributes) => attr.postfix === 'm²'
              ).value,
              rooms: element.teaserAttributes.find(
                (attr: TeaserAttributes) => attr.postfix === 'Zimmer'
              ).value,
              publishedAt,
              images,
            };
            flats.push(newFlat);
          }
        );
        return Promise.resolve(flats);
      } else {
        return Promise.reject('No data found!');
      }
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    } finally {
      await browser.close();
    }
  }
}
