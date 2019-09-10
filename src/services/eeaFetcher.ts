import { EeaUtdClient, Station } from "aq-client-eea";
import { EeaUtdFetcherConfig } from "aq-client-eea";
import moment from "moment";
import { MAX_MEASUREMENT_AGE_HOURS } from "../config";
import { EeaLocationIndex, EeaStationIndex } from "../models/eeaDataIndex";
import { logging } from "../utils/logging";
import { dataStorage } from "./storage";

class EeaFetcher {
    private eeaUtdClient: EeaUtdClient;

    constructor() {
        this.eeaUtdClient = new EeaUtdClient();
    }

    public async fetchByConfig(fetchConfig: EeaUtdFetcherConfig): Promise<EeaLocationIndex> {
        const locationIndex: EeaLocationIndex = {};
        try {
            logging.debug("Loading " + fetchConfig.countryCode + "_" + fetchConfig.pollutantCode);
            const countryIndicatorData = await this.loadEEADataByCountryAndIndicator(
                fetchConfig.countryCode,
                fetchConfig.pollutantCode,
            );

            logging.debug("Filtering " + countryIndicatorData.length + " entries");
            const filteredStations = this.filterStations(countryIndicatorData);

            logging.debug("Indexing " + filteredStations.length + " entries");
            const indexedLatestStations = this.indexLatestStations(filteredStations);

            logging.debug("Saving " + Object.keys(indexedLatestStations).length + " indexed entries");
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
            logging.warn("Failed to load/process EEA data:", JSON.stringify(fetchConfig), e);
        }
        return locationIndex;
    }

    private loadEEADataByCountryAndIndicator(countryCode: string, pollutantCode: string): Promise<Station[]> {
        const fetcherConfig = { countryCode, pollutantCode };
        return this.eeaUtdClient.fetchLatestData(fetcherConfig);
    }

    private filterStations(unfilteredStations: Station[]): Station[] {
        const earliestAllowedTime = moment().subtract(MAX_MEASUREMENT_AGE_HOURS, "hours");
        return unfilteredStations.filter((station) => earliestAllowedTime.isBefore(station.measurements[0].dateEnd));
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
