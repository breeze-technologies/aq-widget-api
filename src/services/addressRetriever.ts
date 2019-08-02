import { Location, Station } from "aq-client-eea";
import * as fs from "fs";
import { STORAGE_DIR } from "../config";
import { reverseGeocode } from "../utils/geocoder";
import { sleep } from "../utils/sleep";
import { dataStorage } from "./storage";

class AddressRetriever {
    private storageDir: string;
    constructor(storageDir: string) {
        this.storageDir = storageDir;
    }

    public async retrieveIncompleteAddresses() {
        if (!fs.existsSync(this.storageDir)) {
            console.warn("Storage directory does not exist.");
            return;
        }

        const countryDirs = fs.readdirSync(this.storageDir, { withFileTypes: true });
        for (const countryDir of countryDirs) {
            if (!countryDir.isDirectory() || countryDir.name === "_index") {
                continue;
            }
            const stationDirs = fs.readdirSync(`${this.storageDir}/${countryDir.name}`, { withFileTypes: true });
            for (const stationDir of stationDirs) {
                if (!stationDir.isDirectory()) {
                    continue;
                }
                const fullStationDir = `${this.storageDir}/${countryDir.name}/${stationDir.name}`;
                await this.retrieveIncompleteAddressForStation(countryDir.name, stationDir.name, fullStationDir);
            }
        }
    }

    private async retrieveIncompleteAddressForStation(countryCode: string, stationId: string, stationDir: string) {
        const stationFiles = fs
            .readdirSync(stationDir, { withFileTypes: true })
            .filter((f) => f.isFile())
            .map((f) => `${stationDir}/${f.name}`);

        const location = this.getLocationFromStationFiles(stationFiles);
        if (!location) {
            return;
        }
        if (location.city) {
            return;
        }

        try {
            const reverseGeocodedLocation = await reverseGeocode(location.longitude, location.latitude);
            if (!reverseGeocodedLocation) {
                return;
            }

            dataStorage.saveEeaStationLocation(countryCode, stationId, reverseGeocodedLocation);
        } catch (e) {
            console.warn("Could not retrieve or save address for:", location, e);
        } finally {
            await sleep(1000);
        }
    }

    private getLocationFromStationFiles(stationFiles: string[]): Location | null {
        let completeLocation = null;
        let partLocation = null;
        for (const file of stationFiles) {
            const fileContent = fs.readFileSync(file, "utf8");
            if (file.endsWith("_location")) {
                completeLocation = JSON.parse(fileContent) as Location;
            } else {
                const station = JSON.parse(fileContent) as Station;
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