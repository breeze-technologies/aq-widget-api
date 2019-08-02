import express from "express";
const router = express.Router();

import { eeaService } from "../../../services/eeaService";
import { jsonError, jsonSuccess } from "../../../utils/jsonResponse";
import lookupRouter from "./stations/lookup";

router.get("/:countryCode/:stationId", (req, res, next) => {
    const countryCode = req.params.countryCode;
    const stationId = req.params.stationId;
    console.log("get station", countryCode, stationId);
    if (!countryCode || !stationId) {
        res.status(400).json(jsonError("Please provide a countryCode and stationId."));
    }
    const station = eeaService.getStation(countryCode, stationId);
    res.json(jsonSuccess(station));
});

router.use("/lookup", lookupRouter);

export default router;
