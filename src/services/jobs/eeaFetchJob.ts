import moment from "moment";

import { EeaUtdFetcherConfig } from "aq-client-eea/dist/models/eeaUtdFetcherConfig";
import { eeaFetcher } from "../eeaFetcher";

export async function eeaFetchJob(fetchConfig: EeaUtdFetcherConfig) {
    const startTime = moment();
    const locationIndex = await eeaFetcher.fetchByConfig(fetchConfig);
    const endTime = moment();
    const duration = endTime.diff(startTime);
    console.log("Duration: " + moment.duration(duration).as("seconds") + " seconds");
    return locationIndex;
}