import { Measurement } from "aq-client-eea";
import moment from "moment";

const EEA_AQI_THRESHOLDS: { [indicator: string]: number[] } = {
    "o3": [80, 120, 180, 240, 600],
    "pm2.5": [10, 20, 25, 50, 800],
    "pm10": [20, 35, 50, 100, 1200],
    "no2": [40, 100, 200, 400, 1000],
    "so2": [100, 200, 350, 500, 1250],
};

export function calculateAqi(measurements: Measurement[]): Measurement | null {
    const aqiRelevantIndicators = Object.keys(EEA_AQI_THRESHOLDS);
    measurements = measurements.filter((m) => aqiRelevantIndicators.indexOf(m.indicator) !== -1);
    measurements = filterTimeframes(measurements);

    if (measurements.length < 2) {
        return null;
    }

    const start = moment(measurements[0].dateStart);
    const end = moment(measurements[0].dateEnd);
    const oneHourEnd = start.clone().add(1, "hour");
    if (!end.isSame(oneHourEnd)) {
        return null;
    }

    const score = measurements
        .map((m) => {
            const thresholds = EEA_AQI_THRESHOLDS[m.indicator];
            if (m.indicator === "pm10") {
                console.log("pm10", thresholds, m);
            }
            return thresholds.reduce((prevScore, threshold, index) => {
                if (m.value >= threshold) {
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

function filterTimeframes(measurements: Measurement[]): Measurement[] {
    const timeframeIndex: { [timeframe: string]: Measurement[] } = {};

    for (const m of measurements) {
        const dateStart = moment(m.dateStart).toISOString();
        const dateEnd = moment(m.dateEnd).toISOString();
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
