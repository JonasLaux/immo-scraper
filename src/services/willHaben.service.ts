import { chromium } from 'playwright-chromium';
import { FlatElement } from '../global.types';
const dayjs = require('dayjs');
import {
  VIENNADISTRICTS,
  PROPERTYTYPES,
  FREEAREATYPES,
} from './willHaben.types';

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

export type WillHabenConfig = {
  AREA_ID?: VIENNADISTRICTS[];
  PRICE_FROM?: string;
  PRICE_TO?: string;
  LIVING_AREA_FROM?: string;
  LIVING_AREA_TO?: string;
  FREE_AREA_TYPE?: FREEAREATYPES[];
  PROPERTY_TYPE?: PROPERTYTYPES[];
  TIME_PERIOD?: string;
  keyword?: string;
};

export default class WillHabenService {
  private url =
    'https://www.willhaben.at/iad/immobilien/mietwohnungen/mietwohnung-angebote';

  public async getFlats(config: WillHabenConfig): Promise<FlatElement[]> {
    const params = new URLSearchParams();

    config.AREA_ID?.forEach(area => {
      params.append('areaId', area);
    });
    config.PROPERTY_TYPE?.forEach(type => {
      params.append('PROPERTY_TYPE', type);
    });
    config.FREE_AREA_TYPE?.forEach(freeArea => {
      params.append('FREE_AREA/FREE_AREA_TYPE', freeArea);
    });

    config.keyword ? params.append('keyword', config.keyword) : null;
    config.PRICE_FROM ? params.append('PRICE_FROM', config.PRICE_FROM) : null;
    config.PRICE_TO ? params.append('PRICE_TO', config.PRICE_TO) : null;
    config.LIVING_AREA_FROM
      ? params.append('ESTATE_SIZE/LIVING_AREA_FROM', config.LIVING_AREA_FROM)
      : null;
    config.LIVING_AREA_TO
      ? params.append('ESTATE_SIZE/LIVING_AREA_TO', config.LIVING_AREA_TO)
      : null;
    config.TIME_PERIOD ? params.append('periode', config.TIME_PERIOD) : null;

    const browser = await chromium.launch({
      headless: true,
    });

    this.url = `${this.url}?${params.toString()}`;

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
              id: element.id,
              description: element.description,
              link: element.contextLinkList.contextLink.find(
                (links: ContextLinks) => links.id === 'iadShareLink'
              )?.uri,
              location: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'LOCATION'
              )?.values[0],
              price: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'PRICE_FOR_DISPLAY'
              )?.values[0],
              squareMeters: element.teaserAttributes.find(
                (attr: TeaserAttributes) => attr.postfix === 'm²'
              )?.value,
              rooms: element.teaserAttributes.find(
                (attr: TeaserAttributes) => attr.postfix === 'Zimmer'
              )?.value,
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
