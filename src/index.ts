import http from "http";
import app from "./app";
import { eeaService } from "./services/eeaService";
import { logging } from "./utils/logging";

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
