export const SHORT_NAME_LENGTH = 10;
const LINK_QPS_LEVEL_WEIGHT = 0.7;
export const LINK_QPS_LEVELS = [
  { id: 1, min: 0, max: 50, weight: Number(LINK_QPS_LEVEL_WEIGHT) },
  { id: 2, min: 50, max: 100, weight: 2 * LINK_QPS_LEVEL_WEIGHT },
  { id: 3, min: 100, max: 200, weight: 3 * LINK_QPS_LEVEL_WEIGHT },
  { id: 4, min: 200, max: 500, weight: 4 * LINK_QPS_LEVEL_WEIGHT },
  { id: 5, min: 500, max: 1000, weight: 5 * LINK_QPS_LEVEL_WEIGHT },
  { id: 6, min: 1000, max: Number.POSITIVE_INFINITY, weight: 6 * LINK_QPS_LEVEL_WEIGHT },
];
