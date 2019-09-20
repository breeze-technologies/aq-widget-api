import { EeaUtdFetcherConfig } from "aq-client-eea";
import { addressRetrieverJob } from "./jobs/addressRetrieverJob";
import { eeaFetchJob } from "./jobs/eeaFetchJob";

export async function eeaFetchRunner(fetchConfig: EeaUtdFetcherConfig, callback: (result: any, error?: any) => void) {
    const locationIndex = await eeaFetchJob(fetchConfig);
    callback(locationIndex);
}

export async function addressRetrieverRunner(input: string, callback: () => void) {
    await addressRetrieverJob();
    callback();
}
