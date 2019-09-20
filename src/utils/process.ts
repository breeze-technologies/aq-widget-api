import exitHook from "exit-hook";
import { logging } from "./logging";

export function onProcessExit(func: () => void) {
    exitHook(func);
}

export function logProcessUptime(processName: string) {
    const uptime = process.uptime();
    const uptimeMinutes = uptime / 60;
    const uptimeString = uptimeMinutes.toFixed(2);

    logging.info(`Process uptime for "${processName}: ${uptimeString} min`);
}
