import * as Cheerio from 'cheerio';
import { FlatElement } from '../global.types';
import dayjs from 'dayjs';

export default class ImmoSuchmaschineService {
  private baseUrl = 'https://www.immosuchmaschine.at/suche';

  public async getFlats(): Promise<FlatElement[]> {
    const params = new URLSearchParams();

    // Add all the query parameters using append
    params.append('orderby', 'obj.created_date');
    params.append('sortmode', '1');
    params.append('newsearch', '1');
    params.append('form_page', 'welcome');
    [
      '9_901',
      '9_902',
      '9_903',
      '9_904',
      '9_906',
      '9_907',
      '9_908',
      '9_909',
    ].forEach(district => {
      params.append('district_id[]', district);
    });

    params.append('province_id[]', '9');
    params.append('objpay_type', '1_2');
    params.append('price_to', '2600');
    params.append('size_from', '90');
    params.append('rooms_from', '4');
    params.append('tags[]', '8');

    try {
      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.text();
        console.error('ImmoSuchmaschineService error', error);
        return Promise.resolve([]);
      }
      const html = await response.text();
      const $ = Cheerio.load(html);
      const flats: Array<FlatElement> = [];

      const resultListElementList = $('.result-list').children();

      resultListElementList.each((index, element) => {
        const resultListElement = $(element);

        const elementId = resultListElement.attr('id');
        const link = resultListElement.find('.data_title a').attr('href');

        if (!elementId || !link) {
          return;
        }

        const priceValue = this.extractInformationFromElement({
          resultListElement,
          className: 'data_price',
          parentElementType: 'dd',
          shouldExtractNumber: true,
        });
        const squareMetersValue = this.extractInformationFromElement({
          resultListElement,
          className: 'data_size',
          parentElementType: 'dd',
          shouldExtractNumber: true,
        });
        const roomsValue = this.extractInformationFromElement({
          resultListElement,
          className: 'data_rooms',
          parentElementType: 'dd',
          shouldExtractNumber: true,
        });

        const publishedAt = this.extractInformationFromElement({
          resultListElement,
          className: 'data_created',
          parentElementType: '',
          shouldExtractNumber: false,
        });

        const description = this.extractInformationFromElement({
          resultListElement,
          className: 'data_title',
          parentElementType: 'a',
          shouldExtractNumber: false,
        });

        const location = this.extractInformationFromElement({
          resultListElement,
          className: 'data_zipcity',
          parentElementType: '',
          shouldExtractNumber: false,
        })
          .replace('• Wohnung mieten', '')
          .trim();

        const tags = resultListElement.find('.data_tags li');
        const tagsArray: string[] = [];
        tags.each((i, tag) => {
          tagsArray.push($(tag).text().trim());
        });

        const images: string[] = [];

        resultListElement.find('img.img-responsive').each((i, img) => {
          if ($(img).attr('src')) {
            images.push($(img).attr('src')!);
          }
          images.push($(img).attr('data-src')!);
        });

        flats.push({
          price: priceValue,
          squareMeters: squareMetersValue,
          rooms: roomsValue,
          publishedAt,
          id: elementId!,
          address: 'NO ADDRESS FOUND',
          description,
          link: link!,
          location,
          company: 'Immo Suchmaschine',
          images: images.filter(Boolean), // Filter out undefined values
          tags: tagsArray,
        });
      });
      return Promise.resolve(flats);
    } catch (error) {
      console.error('Error occurred:', error);
      return Promise.reject(error);
    }
  }

  private extractInformationFromElement(params: {
    resultListElement: cheerio.Cheerio;
    className: string;
    parentElementType: string;
    shouldExtractNumber: boolean;
  }): string {
    const {
      resultListElement,
      className,
      parentElementType,
      shouldExtractNumber,
    } = params;

    // Find the element with the given class name
    const element = resultListElement.find(
      `.${className} ${parentElementType}`
    );

    // Get the text of the element
    const text = element.text().trim();

    if (shouldExtractNumber) {
      // Extract the numeric value from the text using a regular expression
      const match = text.match(/\d+/g);
      const value = match ? match.join('') : '';
      return value;
    }

    return text;
  }
}
