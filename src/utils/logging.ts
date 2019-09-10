import winston, { format } from "winston";
import { LOG_DIR } from "../config";

const baseFormat = format.combine(
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
);

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
            format: format.combine(baseFormat, format.colorize(), format.simple(), format.align()),
        }),
    );
}
