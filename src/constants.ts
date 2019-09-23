export const MIN_NODE_VERSION = ">=10.0.0";

export const MAX_STATION_DISTANCE = 5;
export const MAX_MEASUREMENT_AGE_HOURS = 6;
export const MIN_AQI_MEASUREMENT_COUNT = 1;

export const EEA_FETCH_INTERVAL = 60;
export const ADDRESS_RETRIEVER_INTERVAL = 60;
export const EEA_AQI_THRESHOLDS: { [indicator: string]: number[] } = {
    "o3": [80, 120, 180, 240, 600],
    "pm2.5": [10, 20, 25, 50, 800],
    "pm10": [20, 35, 50, 100, 1200],
    "no2": [40, 100, 200, 400, 1000],
    "so2": [100, 200, 350, 500, 1250],
};

export const FILESYSTEM_ENCODING = "utf8";

export const STORAGE_LOCATION_INDEX_DIR = "_index";
export const STORAGE_LOCATION_INDEX_FILE = "eeaLocationIndex.json";
export const STORAGE_STATION_LOCATION_FILE = "_location.json";

export const ADDRESS_FETCHER_TIMEOUT = 1000;
