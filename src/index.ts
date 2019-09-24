import http from "http";
import semver from "semver";
import app from "./app";
import { MIN_NODE_VERSION } from "./constants";
import { eeaService } from "./services/eeaService";
import { logging } from "./utils/logging";

if (!semver.satisfies(process.version, MIN_NODE_VERSION)) {
    logging.error(`NodeJS version ${MIN_NODE_VERSION} required. Current version: ${process.version}`);
    process.exit(1);
}

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: string) {
    const p = parseInt(val, 10);

    if (isNaN(p)) {
        return val;
    }

    if (p >= 0) {
        return p;
    }

    return false;
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + (addr ? addr.port : "port undefined");
    logging.info("Listening on " + bind);

    logging.info("Triggering initial EEA fetch...");
    eeaService.triggerImmediateFetch();
}

function onError(error: any) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    switch (error.code) {
        case "EACCES":
            logging.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            logging.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}
