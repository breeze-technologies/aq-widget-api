import { EeaUtdFetcherConfig } from "aq-client-eea";
import { logProcessUptime } from "../../utils/process";
import { eeaFetcher } from "../eeaFetcher";

export async function eeaFetchJob(fetchConfig: EeaUtdFetcherConfig) {
    const locationIndex = await eeaFetcher.fetchByConfig(fetchConfig);
    logProcessUptime("EEA Fetch Job");
    return locationIndex;
}
