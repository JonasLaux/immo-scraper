import { WillHabenConfig } from '../../services/willHaben.service';
import {
  FREEAREATYPES,
  PROPERTYTYPES,
  VIENNADISTRICTS,
} from '../../services/willHaben.types';

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

export default willHabenConfig;