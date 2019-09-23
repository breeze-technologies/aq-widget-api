import { logProcessUptime } from "../../utils/process";
import { addressRetriever } from "../addressRetriever";

export async function addressRetrieverJob() {
    await addressRetriever.retrieveIncompleteAddresses();
    logProcessUptime("Address Retriever");
}
