import { WillHabenConfig } from '../../services/willHaben.service';
import {
  PROPERTYTYPES,
  VIENNADISTRICTS,
  NO_OF_ROOMS_BUCKET,
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
  NO_OF_ROOMS_BUCKET: [
    NO_OF_ROOMS_BUCKET.FOUR,
    NO_OF_ROOMS_BUCKET.FIVE,
    NO_OF_ROOMS_BUCKET.SIX_AND_MORE,
  ],
  PRICE_FROM: '700',
  PRICE_TO: '2700',
  keyword: 'altbau',
  LIVING_AREA_FROM: '95',
  // TIME_PERIOD: '2',
};

export default willHabenConfig;
