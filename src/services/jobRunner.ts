import exitHook from "exit-hook";
import workerFarm, { FarmOptions, Workers } from "worker-farm";
import * as jobRunnerRegistry from "./jobRunnerRegistry";

class JobRunner {
    private jobRunnerRegistryEntries: string[];
    private workers: Workers;
    private workerFarmOptions: FarmOptions = {
        maxRetries: 1,
        maxConcurrentCallsPerWorker: 5,
        maxCallsPerWorker: 20,
        maxCallTime: 30000,
    };

    constructor() {
        this.jobRunnerRegistryEntries = Object.keys(jobRunnerRegistry);
        this.workers = workerFarm(
            this.workerFarmOptions,
            require.resolve("./jobRunnerRegistry"),
            this.jobRunnerRegistryEntries,
        );
        const thisJobRunner = this;
        exitHook(() => {
            console.log("JOB RUNNER", "Stopping all workers...");
            thisJobRunner.end();
            console.log("JOB RUNNER", "Workers stopped.");
        });
        console.log("JOB RUNNER", "Registered job runners:", this.jobRunnerRegistryEntries);
    }

    public run(runner: string, args: any, callback: (result: any, error: any) => void) {
        if (this.jobRunnerRegistryEntries.indexOf(runner) === -1) {
            console.error("JOB RUNNER", "Runner not found!");
            return;
        }
        console.log("JOB RUNNER", process.pid, "Starting " + runner + " job");
        this.workers[runner](args, (result: any, error: any) => {
            if (error) {
                console.warn("JOB RUNNER", process.pid, "FAILED " + runner + " job\n");
            } else {
                console.log("JOB RUNNER", process.pid, "Finished " + runner + " job\n");
            }
            callback(result, error);
        });
    }

    public end() {
        workerFarm.end(this.workers);
    }
}

export const jobRunner = new JobRunner();
