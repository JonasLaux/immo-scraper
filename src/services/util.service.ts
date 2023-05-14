import { FlatElement } from '../types';

export const constructMessage = (flat: FlatElement): string => {
  const message = `
  ----------------------------------------------------------------
  ${flat.description}
  ${flat.location}
  ${flat.price}
  ${flat.rooms} Rooms
  ${flat.squareMeters}m² 
  ${flat.publishedAt} published
  ${flat.link}
  ${flat.images?.join('\n')}
  `;
  return message;
};
