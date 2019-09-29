import express from "express";
import expressWinston from "express-winston";
import path from "path";
import winston from "winston";

import { CORS_ALLOW_ORIGIN } from "./config";
import indexRouter from "./routes/index";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", CORS_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use("/", indexRouter);

app.use(
    expressWinston.errorLogger({
        transports: [new winston.transports.Console()],
        format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    }),
);

export default app;
