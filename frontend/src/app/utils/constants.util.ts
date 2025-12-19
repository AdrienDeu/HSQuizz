// src/app/utils/constants.util.ts

export const DUST_VALUES: { [key: string]: number } = {
  'FREE': 0, // Free cards usually cannot be crafted, or have 0 dust value
  'COMMON': 40,
  'RARE': 100,
  'EPIC': 400,
  'LEGENDARY': 1600,
};