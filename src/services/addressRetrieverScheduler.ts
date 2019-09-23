import { ADDRESS_RETRIEVER_INTERVAL } from "../constants";
import { onProcessExit } from "../utils/process";
import { jobRunner } from "./jobRunner";

class AddressRetrieverScheduler {
    private interval: NodeJS.Timeout;
    private intervalMinutes = ADDRESS_RETRIEVER_INTERVAL;

    constructor() {
        this.interval = setInterval(this.retrieveAllIncompleteAddresses, this.intervalMinutes * 60 * 1000);
        onProcessExit(() => {
            clearInterval(this.interval);
        });
    }

    public triggerImmediateRetrieval() {
        clearInterval(this.interval);
        this.interval = setInterval(this.retrieveAllIncompleteAddresses.bind(this), this.intervalMinutes * 60 * 1000);

        setImmediate(this.retrieveAllIncompleteAddresses.bind(this), 100);
    }

    private retrieveAllIncompleteAddresses() {
        return new Promise((resolve, reject) => {
            jobRunner.run("addressRetrieverRunner", null, (result, error) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    }
}

export const addressRetrieverScheduler = new AddressRetrieverScheduler();
