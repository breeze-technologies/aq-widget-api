import { EeaUtdClient, Station } from "aq-client-eea";
import { EeaUtdFetcherConfig } from "aq-client-eea/dist/models/eeaUtdFetcherConfig";
import moment from "moment";
import { EeaLocationIndex, EeaStationIndex } from "../models/eeaDataIndex";
import { dataStorage } from "./storage";

class EeaFetcher {
    private eeaUtdClient: EeaUtdClient;

    constructor() {
        this.eeaUtdClient = new EeaUtdClient();
    }

    public async fetchByConfig(fetchConfig: EeaUtdFetcherConfig): Promise<EeaLocationIndex> {
        const locationIndex: EeaLocationIndex = {};
        try {
            console.log("Loading " + fetchConfig.countryCode + "_" + fetchConfig.pollutantCode);
            const countryIndicatorData = await this.loadEEADataByCountryAndIndicator(
                fetchConfig.countryCode,
                fetchConfig.pollutantCode,
            );

            console.log("Filtering " + countryIndicatorData.length + " entries");
            const filteredStations = this.filterStations(countryIndicatorData);

            console.log("Indexing " + filteredStations.length + " entries");
            const indexedLatestStations = this.indexLatestStations(filteredStations);

            console.log("Saving " + Object.keys(indexedLatestStations).length + " indexed entries");
            for (const stationId of Object.keys(indexedLatestStations)) {
                const stationData = indexedLatestStations[stationId];
                await dataStorage.saveEeaStation(fetchConfig.countryCode, fetchConfig.pollutantCode, stationData);
                locationIndex[stationId] = {
                    lon: stationData.location.longitude,
                    lat: stationData.location.latitude,
                    cc: stationData.location.countryCode,
                };
            }
        } catch (e) {
            console.warn("Failed to load/process EEA data:", JSON.stringify(fetchConfig), e);
        }
        return locationIndex;
    }

    private loadEEADataByCountryAndIndicator(countryCode: string, pollutantCode: string): Promise<Station[]> {
        const fetcherConfig = { countryCode, pollutantCode };
        return this.eeaUtdClient.fetchLatestData(fetcherConfig);
    }

    private filterStations(unfilteredStations: Station[]): Station[] {
        const earliestAllowedTime = moment().subtract(6, "hours");
        return unfilteredStations.filter((station) => earliestAllowedTime.isAfter(station.measurements[0].dateEnd));
    }

    private indexLatestStations(unindexedStations: Station[]): EeaStationIndex {
        const indexedLatestStation: EeaStationIndex = {};
        for (const station of unindexedStations) {
            const stationId = station.id;
            if (indexedLatestStation.hasOwnProperty(stationId)) {
                const date = moment(station.measurements[0].dateEnd);
                const prevStationDate = moment(indexedLatestStation[stationId].measurements[0].dateEnd);
                if (date.isAfter(prevStationDate)) {
                    indexedLatestStation[stationId] = station;
                }
            } else {
                indexedLatestStation[stationId] = station;
            }
        }
        return indexedLatestStation;
    }
}

export const eeaFetcher = new EeaFetcher();
