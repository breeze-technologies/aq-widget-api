import { Location, Station } from "aq-client-eea";
import { STORAGE_DIR } from "../config";
import { ADDRESS_FETCHER_TIMEOUT, STORAGE_LOCATION_INDEX_DIR, STORAGE_STATION_LOCATION_FILE } from "../constants";
import { dirExists, listDirs, listFiles, readFile } from "../utils/file";
import { reverseGeocode } from "../utils/geocoder";
import { convertFromJson } from "../utils/json";
import { logging } from "../utils/logging";
import { sleep } from "../utils/sleep";
import { dataStorage } from "./storage";

class AddressRetriever {
    private storageDir: string;
    constructor(storageDir: string) {
        this.storageDir = storageDir;
    }

    public async retrieveIncompleteAddresses() {
        if (!dirExists(this.storageDir)) {
            logging.warn("Storage directory does not exist.");
            return;
        }

        const countryDirs = listDirs(this.storageDir);
        for (const countryDir of countryDirs) {
            if (countryDir === STORAGE_LOCATION_INDEX_DIR) {
                continue;
            }

            const countryDirPath = `${this.storageDir}/${countryDir}`;
            for (const stationDir of listDirs(countryDirPath)) {
                const fullStationDir = `${countryDirPath}/${stationDir}`;
                await this.retrieveIncompleteAddressForStation(countryDir, stationDir, fullStationDir);
            }
        }
    }

    private async retrieveIncompleteAddressForStation(countryCode: string, stationId: string, stationDir: string) {
        const stationFiles = listFiles(stationDir).map((f) => `${stationDir}/${f}`);

        const location = this.getLocationFromStationFiles(stationFiles);
        if (!location) {
            return;
        }
        if (location.city) {
            return;
        }

        try {
            logging.debug("Retrieving address for:", countryCode, stationId, location);
            const reverseGeocodedLocation = await reverseGeocode(location.longitude, location.latitude);
            if (!reverseGeocodedLocation) {
                return;
            }

            logging.debug("Saving retrieved address for:", countryCode, stationId, location);
            dataStorage.saveEeaStationLocation(countryCode, stationId, reverseGeocodedLocation);
        } catch (e) {
            logging.warn("Could not retrieve or save address for:", location);
        } finally {
            await sleep(ADDRESS_FETCHER_TIMEOUT);
        }
    }

    private getLocationFromStationFiles(stationFiles: string[]): Location | null {
        let completeLocation = null;
        let partLocation = null;
        for (const filePath of stationFiles) {
            const fileContent = readFile(filePath);
            if (filePath.endsWith(STORAGE_STATION_LOCATION_FILE)) {
                completeLocation = convertFromJson(fileContent) as Location;
            } else {
                const station = convertFromJson(fileContent) as Station;
                if (
                    station.location &&
                    station.location.longitude &&
                    station.location.latitude &&
                    station.location.countryCode
                ) {
                    partLocation = station.location;
                }
            }
        }
        return completeLocation ? completeLocation : partLocation;
    }
}

export const addressRetriever = new AddressRetriever(STORAGE_DIR);
