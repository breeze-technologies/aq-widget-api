import { Measurement } from "aq-client-eea";
import { EEA_AQI_THRESHOLDS, MIN_AQI_MEASUREMENT_COUNT } from "../constants";
import { convertDateToIsoString, timeframeEqualsHours } from "./date";

export function calculateAqi(measurements: Measurement[]): Measurement | null {
    const aqiRelevantIndicators = Object.keys(EEA_AQI_THRESHOLDS);
    measurements = measurements.filter((m) => aqiRelevantIndicators.indexOf(m.indicator) !== -1);
    measurements = filterTimeFrames(measurements);

    if (measurements.length < MIN_AQI_MEASUREMENT_COUNT) {
        return null;
    }

    const start = measurements[0].dateStart;
    const end = measurements[0].dateEnd;
    if (!timeframeEqualsHours(start, end, 1)) {
        return null;
    }

    const score = measurements
        .map((m) => {
            const thresholds = EEA_AQI_THRESHOLDS[m.indicator];
            return thresholds.reduce((prevScore, threshold, index) => {
                if (m.value > threshold) {
                    return index + 1;
                }
                return prevScore;
            }, 0);
        })
        .reduce((maxScore, currScore) => {
            if (currScore > maxScore) {
                return currScore;
            }
            return maxScore;
        });

    return {
        dateStart: start,
        dateEnd: end,
        indicator: "eea_aqi",
        value: score,
        unit: "",
    };
}

function filterTimeFrames(measurements: Measurement[]): Measurement[] {
    const timeframeIndex: { [timeframe: string]: Measurement[] } = {};

    for (const m of measurements) {
        const dateStart = convertDateToIsoString(m.dateStart);
        const dateEnd = convertDateToIsoString(m.dateEnd);
        const timeframeKey = dateStart + "_" + dateEnd;
        if (!timeframeIndex[timeframeKey]) {
            timeframeIndex[timeframeKey] = [m];
        } else {
            timeframeIndex[timeframeKey].push(m);
        }
    }

    const timeframeKeys = Object.keys(timeframeIndex);
    if (timeframeKeys.length === 1) {
        return measurements;
    }

    let maxMeasurements: Measurement[] = [];
    for (const t of timeframeKeys) {
        if (timeframeIndex[t].length > maxMeasurements.length) {
            maxMeasurements = timeframeIndex[t];
        }
    }
    return maxMeasurements;
}
