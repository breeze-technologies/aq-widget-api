import winston, { format } from "winston";
import { LOG_DIR } from "../config";
import { convertToJson } from "./json";

const logFormat = format.printf(({ level, message, timestamp, metadata }) => {
    const metadataString =
        metadata && !Array.isArray(metadata)
            ? Object.keys(metadata)
                  .filter((k) => k !== "timestamp")
                  .map((k) => `${k}=${convertToJson(metadata[k])}`)
                  .join(", ")
            : convertToJson(metadata);
    const pid = "pid:" + process.pid;
    return `${timestamp} [${pid.padEnd(9, " ")}] [${level.padStart(5, " ")}] ${message} ${metadataString}`;
});

const baseFormat = format.combine(format.timestamp(), format.errors({ stack: true }), logFormat, format.metadata());

export const logging = winston.createLogger({
    level: "debug",
    format: format.combine(baseFormat, format.json()),
    transports: [
        new winston.transports.File({ filename: LOG_DIR + "/error.log", level: "error" }),
        new winston.transports.File({ filename: LOG_DIR + "/combined.log", level: "info" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logging.add(
        new winston.transports.Console({
            format: format.combine(baseFormat, format.colorize({ all: true })),
        }),
    );
}
