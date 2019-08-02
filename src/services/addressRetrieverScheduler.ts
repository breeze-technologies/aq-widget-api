import exitHook from "exit-hook";
import { jobRunner } from "./jobRunner";

class AddressRetrieverScheduler {
    private interval: NodeJS.Timeout;
    private intervalMinutes = 60;

    constructor() {
        this.interval = setInterval(this.retrieveAllIncompleteAddresses, this.intervalMinutes * 60 * 1000);
        exitHook(() => {
            clearInterval(this.interval);
        });
    }

    public retrieveAllIncompleteAddresses() {
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
