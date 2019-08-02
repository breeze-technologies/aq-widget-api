import { Location, Station } from "aq-client-eea";
import fs from "fs";
import { STORAGE_DIR } from "../config";
import { EeaLocationIndexEntry } from "../models/eeaDataIndex";

class DataStorage {
    private storageDir: string;

    constructor(storageDir: string) {
        this.storageDir = storageDir;

        this.createDirectoryIfNotExists(this.storageDir);
    }

    public saveEeaStation(countryCode: string, indicatorCode: string, station: Station) {
        const countryDir = `${this.storageDir}/${countryCode}`;
        const stationDir = `${countryDir}/${station.id}`;
        this.createDirectoryIfNotExists(countryDir);
        this.createDirectoryIfNotExists(stationDir);

        const filePath = `${stationDir}/${station.id}_${indicatorCode}.json`;
        fs.writeFileSync(filePath, JSON.stringify(station));
    }

    public saveEeaLocationIndex(index: EeaLocationIndexEntry[]) {
        const indexDir = `${this.storageDir}/_index`;
        this.createDirectoryIfNotExists(indexDir);

        const filePath = `${indexDir}/eeaLocationIndex.json`;
        fs.writeFileSync(filePath, JSON.stringify(index));
    }

    public saveEeaStationLocation(countryCode: string, stationId: string, location: Location) {
        const stationDir = `${this.storageDir}/${countryCode}/${stationId}/`;
        if (!fs.existsSync(stationDir)) {
            return;
        }

        const filePath = `${stationDir}/_location.json`;
        fs.writeFileSync(filePath, JSON.stringify(location));
    }

    private createDirectoryIfNotExists(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
}

export const dataStorage = new DataStorage(STORAGE_DIR);
