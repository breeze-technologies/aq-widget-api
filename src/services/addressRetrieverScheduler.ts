import { ADDRESS_RETRIEVER_INTERVAL } from "../constants";
import { onProcessExit } from "../utils/process";
import { jobRunner } from "./jobRunner";

class AddressRetrieverScheduler {
    private interval: NodeJS.Timeout;
    private intervalMilliseconds = ADDRESS_RETRIEVER_INTERVAL * 60 * 1000;

    constructor() {
        this.interval = setInterval(this.retrieveAllIncompleteAddresses, this.intervalMilliseconds);
        onProcessExit(() => {
            clearInterval(this.interval);
        });
    }

    public triggerImmediateRetrieval() {
        clearInterval(this.interval);
        this.interval = setInterval(this.retrieveAllIncompleteAddresses.bind(this), this.intervalMilliseconds);

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
