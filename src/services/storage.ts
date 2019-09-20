import { Location, Station } from "aq-client-eea";
import { STORAGE_DIR } from "../config";
import { STORAGE_LOCATION_INDEX_DIR, STORAGE_LOCATION_INDEX_FILE, STORAGE_STATION_LOCATION_FILE } from "../constants";
import { EeaLocationIndexEntry } from "../models/eeaDataIndex";
import { convertDateToIsoString } from "../utils/date";
import { createDirIfNotExists, dirExists, fileExists, listFiles, readFile, writeFile } from "../utils/file";
import { convertFromJson, convertToJson } from "../utils/json";

class DataStorage {
    private storageDir: string;

    constructor(storageDir: string) {
        this.storageDir = storageDir;

        createDirIfNotExists(this.storageDir);
    }

    public saveEeaStation(countryCode: string, indicatorCode: string, station: Station) {
        const countryDir = `${this.storageDir}/${countryCode}`;
        const stationDir = `${countryDir}/${station.id}`;
        createDirIfNotExists(countryDir);
        createDirIfNotExists(stationDir);

        const preparedStation = this.prepareEeaStationDates(station);

        const filePath = `${stationDir}/${station.id}_${indicatorCode}.json`;
        writeFile(filePath, convertToJson(preparedStation));
    }

    public readEeaStation(countryCode: string, stationId: string): Station[] | null {
        const countryDir = `${this.storageDir}/${countryCode}`;
        const stationDir = `${countryDir}/${stationId}`;
        if (!dirExists(stationDir)) {
            return null;
        }
        const fileContents = [];

        for (const f of listFiles(stationDir)) {
            const filePath = `${stationDir}/${f}`;
            let content = convertFromJson(readFile(filePath));
            if (f.endsWith(STORAGE_STATION_LOCATION_FILE)) {
                content = { location: content };
            }
            fileContents.push(content);
        }
        return fileContents;
    }

    public saveEeaLocationIndex(index: EeaLocationIndexEntry[]) {
        const indexDir = `${this.storageDir}/${STORAGE_LOCATION_INDEX_DIR}`;
        createDirIfNotExists(indexDir);

        const filePath = `${indexDir}/${STORAGE_LOCATION_INDEX_FILE}`;
        writeFile(filePath, convertToJson(index));
    }

    public readEeaLocationIndex(): EeaLocationIndexEntry[] | null {
        const indexDir = `${this.storageDir}/${STORAGE_LOCATION_INDEX_DIR}`;
        const filePath = `${indexDir}/${STORAGE_LOCATION_INDEX_FILE}`;
        if (!fileExists(filePath)) {
            return null;
        }
        return convertFromJson(readFile(filePath));
    }

    public saveEeaStationLocation(countryCode: string, stationId: string, location: Location) {
        const stationDir = `${this.storageDir}/${countryCode}/${stationId}/`;
        if (!dirExists(stationDir)) {
            return;
        }

        const filePath = `${stationDir}/${STORAGE_STATION_LOCATION_FILE}`;
        writeFile(filePath, convertToJson(location));
    }

    private prepareEeaStationDates(station: Station) {
        if (station.measurements) {
            return {
                ...station,
                measurements: station.measurements.map((m) => {
                    return {
                        ...m,
                        dateStart: convertDateToIsoString(m.dateStart, true),
                        dateEnd: convertDateToIsoString(m.dateEnd, true),
                    };
                }),
            };
        }
        return station;
    }
}

export const dataStorage = new DataStorage(STORAGE_DIR);
