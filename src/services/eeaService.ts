import { EeaLocationIndex, EeaLocationIndexEntry } from "../models/eeaDataIndex";

import { EeaConstants } from "aq-client-eea";

import { EeaUtdFetcherConfig } from "aq-client-eea/dist/models/eeaUtdFetcherConfig";
import exitHook from "exit-hook";
import { jobRunner } from "./jobRunner";
import { dataStorage } from "./storage";

class EeaService {
    private interval: NodeJS.Timeout;
    private intervalMinutes = 60;

    constructor() {
        this.interval = setInterval(this.runFetchJobsAndIndex, this.intervalMinutes * 60 * 1000);
        exitHook(() => {
            clearInterval(this.interval);
        });
    }

    public async runFetchJobsAndIndex() {
        let locationIndexAll: EeaLocationIndex = {};
        for (const countryCode of EeaConstants.COUNTRY_CODES) {
            for (const pollutantCode of EeaConstants.POLLUTANT_CODES) {
                const fetchConfig = {
                    countryCode,
                    pollutantCode,
                };
                const locationIndex = await this.fetchConcurrentAndPromise(fetchConfig);
                locationIndexAll = { ...locationIndexAll, ...locationIndex };
            }
        }
        console.log("Saving location index\n");
        const locationIndexEntries: EeaLocationIndexEntry[] = Object.keys(locationIndexAll).map((id) => ({
            ...locationIndexAll[id],
            id,
        }));
        dataStorage.saveEeaLocationIndex(locationIndexEntries);
    }

    private fetchConcurrentAndPromise(fetchConfig: EeaUtdFetcherConfig): Promise<EeaLocationIndex> {
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
