import { FlatElement } from '../global.types';
import dayjs from 'dayjs';
import {
  VIENNADISTRICTS,
  PROPERTYTYPES,
  FREEAREATYPES,
  NO_OF_ROOMS_BUCKET,
  Attribute,
  AdvertImage,
  ContextLinks,
} from './willHaben.types';
import * as Cheerio from 'cheerio';

export type WillHabenConfig = {
  AREA_ID?: VIENNADISTRICTS[];
  PRICE_FROM?: string;
  PRICE_TO?: string;
  LIVING_AREA_FROM?: string;
  LIVING_AREA_TO?: string;
  FREE_AREA_TYPE?: FREEAREATYPES[];
  PROPERTY_TYPE?: PROPERTYTYPES[];
  TIME_PERIOD?: string;
  NO_OF_ROOMS_BUCKET?: NO_OF_ROOMS_BUCKET[];
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
    config.NO_OF_ROOMS_BUCKET?.forEach(rooms => {
      params.append('NO_OF_ROOMS_BUCKET', rooms);
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

    try {
      this.url = `${this.url}?${params.toString()}`;
      const response = await fetch(this.url);
      if (!response.ok) {
        return Promise.reject('Failed to fetch data');
      }
      const html = await response.text();
      const $ = Cheerio.load(html);
      const dataRaw = $('#__NEXT_DATA__').html();
      if (dataRaw) {
        const flats: Array<FlatElement> = [];
        const data = JSON.parse(dataRaw);
        data.props?.pageProps?.searchResult?.advertSummaryList?.advertSummary?.forEach(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              price: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'PRICE'
              )?.values[0],
              rooms: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'NUMBER_OF_ROOMS'
              )?.values[0],
              description: element.description,
              link: element.contextLinkList.contextLink.find(
                (links: ContextLinks) => links.id === 'iadShareLink'
              )?.uri,
              location: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'LOCATION'
              )?.values[0],
              address: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'ADDRESS'
              )?.values[0],
              freeArea: (() => {
                const areas =
                  element.attributes.attribute.find(
                    (attr: Attribute) =>
                      attr.name === 'FREE_AREA/FREE_AREA_AREA_TOTAL'
                  )?.values || [];
                const types =
                  element.attributes.attribute.find(
                    (attr: Attribute) => attr.name === 'FREE_AREA_TYPE_NAME'
                  )?.values || [];
                return areas
                  .map(
                    (area: string, index: number) =>
                      `${area}qm ${types[index] || ''}`
                  )
                  .join(', ');
              })(),
              squareMeters: element.attributes.attribute.find(
                (attr: Attribute) => attr.name === 'ESTATE_SIZE'
              )?.values[0],
              publishedAt,
              id: element.id,
              company: element['advertiserInfo'].label,
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
    }
  }
}
