import express from "express";
const router = express.Router();

import stationRouter from "./api/v1/stations";

router.use("/api/v1/stations", stationRouter);

export default router;
