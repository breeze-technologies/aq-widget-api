import workerFarm, { FarmOptions, Workers } from "worker-farm";
import { logging } from "../utils/logging";
import { onProcessExit } from "../utils/process";
import * as jobRunnerRegistry from "./jobRunnerRegistry";

class JobRunner {
    private jobRunnerRegistryEntries: string[];
    private workers: Workers;
    private workerFarmOptions: FarmOptions = {
        maxRetries: 1,
        maxConcurrentCallsPerWorker: 5,
        maxCallsPerWorker: 20,
        maxCallTime: 30 * 60 * 1000,
    };

    constructor() {
        this.jobRunnerRegistryEntries = Object.keys(jobRunnerRegistry);
        this.workers = workerFarm(
            this.workerFarmOptions,
            require.resolve("./jobRunnerRegistry"),
            this.jobRunnerRegistryEntries,
        );
        const thisJobRunner = this;
        onProcessExit(() => {
            logging.info("JOB RUNNER Stopping all workers...");
            thisJobRunner.end();
            logging.info("JOB RUNNER Workers stopped.");
        });
        logging.info("JOB RUNNER Registered job runners:", this.jobRunnerRegistryEntries);
    }

    public run(runner: string, args: any, callback: (result: any, error: any) => void) {
        if (this.jobRunnerRegistryEntries.indexOf(runner) === -1) {
            logging.error("JOB RUNNER Runner not found!");
            return;
        }
        logging.info("JOB RUNNER Starting " + runner + " job:", args);
        this.workers[runner](args, (result: any, error: any) => {
            if (error) {
                logging.error("JOB RUNNER FAILED " + runner + " job:", args, error);
            } else {
                logging.info("JOB RUNNER Finished " + runner + " job:", args);
            }
            callback(result, error);
        });
    }

    public end() {
        workerFarm.end(this.workers);
    }
}

export const jobRunner = new JobRunner();
