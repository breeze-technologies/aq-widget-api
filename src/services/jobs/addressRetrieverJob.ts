import moment from "moment";
import { logging } from "../../utils/logging";
import { addressRetriever } from "../addressRetriever";

export async function addressRetrieverJob() {
    const startTime = moment();
    await addressRetriever.retrieveIncompleteAddresses();
    const endTime = moment();
    const duration = endTime.diff(startTime);
    logging.info("Address Retrieval Duration: " + moment.duration(duration).as("seconds") + " seconds \n");
}
