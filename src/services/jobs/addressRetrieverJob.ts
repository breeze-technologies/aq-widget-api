import moment from "moment";
import { addressRetriever } from "../addressRetriever";

export async function addressRetrieverJob() {
    const startTime = moment();
    await addressRetriever.retrieveIncompleteAddresses();
    const endTime = moment();
    const duration = endTime.diff(startTime);
    console.log("Duration: " + moment.duration(duration).as("seconds") + " seconds \n");
}
