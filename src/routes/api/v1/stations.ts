import express from "express";
const router = express.Router();

import { eeaService } from "../../../services/eeaService";
import { calculateAqi } from "../../../utils/aqi";
import { jsonError, jsonSuccess } from "../../../utils/jsonResponse";
import lookupRouter from "./stations/lookup";

router.get("/:countryCode/:stationId", (req, res, next) => {
    const { countryCode, stationId } = req.params;

    if (!countryCode || !stationId) {
        res.status(400).json(jsonError("Please provide a countryCode and stationId."));
        return;
    }

    const station = eeaService.getStation(countryCode, stationId);
    if (!station) {
        res.status(404).json(jsonError("Station not found."));
        return;
    }

    if (station.measurements && station.measurements.length > 0) {
        const aqi = calculateAqi(station.measurements);
        if (aqi) {
            station.measurements = [...station.measurements, aqi];
        }
    }

    res.json(jsonSuccess(station));
});

router.use("/lookup", lookupRouter);

export default router;
