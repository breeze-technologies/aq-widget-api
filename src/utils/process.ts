import exitHook from "exit-hook";
import { convertMillisecondsToDurationString } from "./date";
import { logging } from "./logging";

export function onProcessExit(func: () => void) {
    exitHook(func);
}

export function logProcessUptime(processName: string) {
    const uptime = process.uptime();
    const durationString = convertMillisecondsToDurationString(uptime);

    logging.info(`Process uptime for "${processName} (${process.pid})": ${durationString}`);
}
