import { EeaUtdFetcherConfig } from "aq-client-eea";
import { EeaConstants, Station } from "aq-client-eea";
import exitHook from "exit-hook";
import { EEA_FETCH_INTERVAL } from "../config";
import { EeaLocationIndex, EeaLocationIndexEntry } from "../models/eeaDataIndex";
import { calcDistanceFromLatLonInKm } from "../utils/geoalgebra";
import { logging } from "../utils/logging";
import { isArray, isDict } from "../utils/types";
import { addressRetrieverScheduler } from "./addressRetrieverScheduler";
import { jobRunner } from "./jobRunner";
import { dataStorage } from "./storage";

class EeaService {
    private interval: NodeJS.Timeout;
    private intervalMinutes = EEA_FETCH_INTERVAL;

    private locationIndexEntries: EeaLocationIndexEntry[] = [];

    constructor() {
        this.interval = setInterval(this.runFetchJobsAndIndex.bind(this), this.intervalMinutes * 60 * 1000);
        exitHook(() => {
            clearInterval(this.interval);
        });

        const storedIndex = dataStorage.readEeaLocationIndex();
        if (storedIndex) {
            this.locationIndexEntries = storedIndex;
        }
    }

    public triggerImmediateFetch() {
        clearInterval(this.interval);
        this.interval = setInterval(this.runFetchJobsAndIndex.bind(this), this.intervalMinutes * 60 * 1000);

        setImmediate(this.runFetchJobsAndIndex.bind(this), 100);
    }

    public findNearestLocationIndexEntry(longitude: number, latitude: number): EeaLocationIndexEntry | null {
        let nearestEntry = null;
        let nearestDistance = Infinity;
        for (const entry of this.locationIndexEntries) {
            const distance = calcDistanceFromLatLonInKm(latitude, longitude, entry.lat, entry.lon);
            if (nearestEntry === null || distance < nearestDistance) {
                nearestEntry = entry;
                nearestDistance = distance;
            }
        }
        return nearestEntry;
    }

    public getStation(countryCode: string, stationId: string) {
        const stationContents = dataStorage.readEeaStation(countryCode, stationId);
        if (!stationContents) {
            return null;
        }

        const mergedStation = this.mergeStationObjects(stationContents);
        return mergedStation;
    }

    public getStationByIndexEntry(indexEntry: EeaLocationIndexEntry) {
        const stationContents = dataStorage.readEeaStation(indexEntry.cc, indexEntry.id || "undefined");
        if (!stationContents) {
            return null;
        }

        const mergedStation = this.mergeStationObjects(stationContents);
        return mergedStation;
    }

    private mergeStationObjects(stationContents: Station[]) {
        const mergedStation: any = {};
        for (const s of stationContents) {
            const keys = Object.keys(s);
            for (const key of keys) {
                const value = (s as any)[key];
                if (mergedStation[key] === undefined) {
                    mergedStation[key] = value;
                } else if (mergedStation[key] !== value) {
                    // logging.warn("Merging key", key, "but there is a conflict:", mergedStation[key], value);
                    if (isDict(value) && isDict(mergedStation[key])) {
                        mergedStation[key] = { ...mergedStation[key], ...value };
                    } else if (isArray(value) && isArray(mergedStation[key])) {
                        mergedStation[key] = [...mergedStation[key], ...value];
                    }
                }
            }
        }
        return mergedStation as Station;
    }

    private async runFetchJobsAndIndex() {
        let locationIndexAll: EeaLocationIndex = {};
        for (const countryCode of EeaConstants.COUNTRY_CODES) {
            for (const pollutantCode of EeaConstants.POLLUTANT_CODES) {
                const fetchConfig = {
                    countryCode,
                    pollutantCode,
                };
                const locationIndex = await this.fetchConcurrentAndPromisify(fetchConfig);
                locationIndexAll = { ...locationIndexAll, ...locationIndex };
            }
        }
        logging.debug("Saving location index\n");
        this.locationIndexEntries = Object.keys(locationIndexAll).map((id) => ({
            ...locationIndexAll[id],
            id,
        }));
        dataStorage.saveEeaLocationIndex(this.locationIndexEntries);

        addressRetrieverScheduler.triggerImmediateRetrieval();
    }

    private fetchConcurrentAndPromisify(fetchConfig: EeaUtdFetcherConfig): Promise<EeaLocationIndex> {
        return new Promise((resolve, reject) => {
            jobRunner.run("eeaFetchRunner", fetchConfig, (result, error) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    }
}

export const eeaService = new EeaService();
