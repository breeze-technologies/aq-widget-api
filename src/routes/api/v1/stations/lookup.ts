import express from "express";
import { MAX_STATION_DISTANCE } from "../../../../constants";
import { eeaService } from "../../../../services/eeaService";
import { calcDistanceFromLatLonInKm } from "../../../../utils/geoalgebra";
import { jsonError, jsonSuccess } from "../../../../utils/jsonResponse";

const router = express.Router();

router.get("/", (req, res, next) => {
    const longitude = req.query.longitude;
    const latitude = req.query.latitude;

    if (!longitude || !latitude) {
        res.status(400).json(jsonError("Please provide longitude and latitude query parameters."));
        return;
    }

    const nearestIndexEntry = eeaService.findNearestLocationIndexEntry(longitude, latitude);
    if (!nearestIndexEntry) {
        res.status(404).json(jsonError("Could not find any stations nearby."));
        return;
    }

    const distance = calcDistanceFromLatLonInKm(latitude, longitude, nearestIndexEntry.lat, nearestIndexEntry.lon);
    if (distance > MAX_STATION_DISTANCE) {
        res.status(404).json(
            jsonError("Could not find any stations within the required distance of " + MAX_STATION_DISTANCE + "km."),
        );
        return;
    }

    const formattedEntry = {
        countryCode: nearestIndexEntry.cc,
        stationId: nearestIndexEntry.id,
        longitude: nearestIndexEntry.lon,
        latitude: nearestIndexEntry.lat,
    };

    res.json(jsonSuccess(formattedEntry));
});

export default router;
