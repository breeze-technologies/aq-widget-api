import { EeaUtdFetcherConfig, fetchLatestData, Station } from "aq-client-eea";
import { MAX_MEASUREMENT_AGE_HOURS } from "../constants";
import { EeaLocationIndex, EeaStationIndex } from "../models/eeaDataIndex";
import { isDateAfter, isDateBefore, now, subtractHoursFromDate } from "../utils/date";
import { logging } from "../utils/logging";
import { dataStorage } from "./storage";

class EeaFetcher {
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
                dataStorage.saveEeaStation(fetchConfig.countryCode, fetchConfig.pollutantCode, stationData);
                locationIndex[stationId] = {
                    lon: stationData.location.longitude,
                    lat: stationData.location.latitude,
                    cc: stationData.location.countryCode,
                };
            }
        } catch (e) {
            logging.warn("Failed to load/process EEA data:", {fetchConfig, e});
        }
        return locationIndex;
    }

    private loadEEADataByCountryAndIndicator(countryCode: string, pollutantCode: string): Promise<Station[]> {
        const fetcherConfig = { countryCode, pollutantCode };
        return fetchLatestData(fetcherConfig);
    }

    private filterStations(unfilteredStations: Station[]): Station[] {
        const earliestAllowedTime = subtractHoursFromDate(now(), MAX_MEASUREMENT_AGE_HOURS);
        return unfilteredStations.filter((station) =>
            isDateBefore(earliestAllowedTime, station.measurements[0].dateEnd),
        );
    }

    private indexLatestStations(unindexedStations: Station[]): EeaStationIndex {
        const indexedLatestStation: EeaStationIndex = {};
        for (const station of unindexedStations) {
            const stationId = station.id;
            if (indexedLatestStation.hasOwnProperty(stationId)) {
                const date = station.measurements[0].dateEnd;
                const prevStationDate = indexedLatestStation[stationId].measurements[0].dateEnd;
                if (isDateAfter(date, prevStationDate)) {
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
