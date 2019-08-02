import { EeaUtdFetcherConfig } from "aq-client-eea/dist/models/eeaUtdFetcherConfig";
import { addressRetrieverJob } from "./jobs/addressRetrieverJob";
import { eeaFetchJob } from "./jobs/eeaFetchJob";

export function eeaFetchRunner(fetchConfig: EeaUtdFetcherConfig, callback: (result: any, error?: any) => void) {
    eeaFetchJob(fetchConfig).then((locationIndex) => callback(locationIndex));
}

export async function addressRetrieverRunner(input: string, callback: () => void) {
    await addressRetrieverJob();
    callback();
}
