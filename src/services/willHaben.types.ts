export type AdvertImage = {
  mainImageUrl: string;
};

export type ContextLinks = {
  id: string;
  uri: string;
};
export type Attribute = {
  name: string;
  values: string[];
};

export enum VIENNADISTRICTS {
  FIRST = '117223',
  SECOND = '117224',
  THIRD = '117225',
  FOURTH = '117226',
  FIFTH = '117227',
  SIXTH = '117228',
  SEVENTH = '117229',
  EIGHTH = '117230',
  NINTH = '117231',
  TENTH = '117232',
  ELEVENTH = '117233',
  TWELFTH = '117234',
  THIRTEENTH = '117235',
  FOURTEENTH = '117236',
  FIFTEENTH = '117237',
  SIXTEENTH = '117238',
  SEVENTEENTH = '117239',
  EIGHTEENTH = '117240',
  NINETEENTH = '117241',
  TWENTIETH = '117242',
  TWENTYFIRST = '117243',
  TWENTYSECOND = '117244',
  TWENTYTHIRD = '117245',
}

export enum PROPERTYTYPES {
  TOPFLOOR_APARTMENT = '110',
  GROUND_FLOOR_APARTMENT = '105',
  COOPERATIVE_APARTMENT = '113',
  LOFT = '100',
  MAISONETTE = '101',
  PENTHOUSE = '102',
  APARTMENT = '3',
}

export enum FREEAREATYPES {
  BALCONY = '20',
  ROOFTERRACE = '40',
  GARDEN = '60',
  LOGGIA = '30',
  TERRACE = '10',
  WINTERGARDEN = '50',
}

export enum NO_OF_ROOMS_BUCKET {
  FOUR = '4X4',
  FIVE = '5X5',
  SIX_AND_MORE = '6X9',
}
