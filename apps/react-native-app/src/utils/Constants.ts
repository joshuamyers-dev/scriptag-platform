import {Dimensions} from 'react-native';
import {getTimeZone} from 'react-native-localize';


export const SCREEN_HEIGHT = Dimensions.get('screen').height;
export const SCREEN_WIDTH = Dimensions.get('screen').width;
export const DEVICE_TIMEZONE = getTimeZone();
export const UNIT_MEASUREMENTS = [
  {
    title: 'Milligrams (mg)',
    value: 'mg',
  },
  {
    title: 'Micrograms (mcg)',
    value: 'mcg',
  },
  {
    title: 'Grams (g)',
    value: 'g',
  },
  {
    title: 'Units',
    value: 'units',
  },
  {
    title: 'Milliliters (ml)',
    value: 'ml',
  },
  {
    title: 'Teaspoons (tsp)',
    value: 'tsp',
  },
  {
    title: 'Tablespoons (tbsp)',
    value: 'tbsp',
  },
  {
    title: 'Pills',
    value: 'pills',
  },
  {
    title: 'Capsules',
    value: 'capsules',
  },
  {
    title: 'Drops',
    value: 'drops',
  },
  {
    title: 'Sprays',
    value: 'sprays',
  },
  {
    title: 'Puffs',
    value: 'puffs',
  },
  {
    title: 'Inhalations',
    value: 'inhalations',
  },
  {
    title: 'Milliequivalents (mEq)',
    value: 'mEq',
  },
  {
    title: 'International Units (IU)',
    value: 'IU',
  },
  {
    title: 'Millions of Units (MU)',
    value: 'MU',
  },
];

export const MEDICATION_END_TYPE_SPECIFIC_DATE = 'specific_date';
export const MEDICATION_END_TYPE_PRESCRIPTION_REPEATS = 'prescription_repeats';
export const MEDICATION_END_TYPE_DOSES_FINISHED = 'doses_finished';
export const MEDICATION_END_TYPE_NEVER = 'never';
export const MEDICATION_END_TYPES = [
  {
    title: 'When I’ve finished all the doses or units',
    value: MEDICATION_END_TYPE_DOSES_FINISHED,
  },
  {
    title: 'After a set number of prescription repeats (e.g., refills)',
    value: MEDICATION_END_TYPE_PRESCRIPTION_REPEATS,
  },
  {
    title: 'On a specific date',
    value: MEDICATION_END_TYPE_SPECIFIC_DATE,
  },
  {
    title: 'Never',
    value: MEDICATION_END_TYPE_NEVER,
  },
];