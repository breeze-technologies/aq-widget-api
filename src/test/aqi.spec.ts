import { Measurement } from "aq-client-eea";
import { expect } from "chai";
import "mocha";
import moment from "moment";
import { calculateAqi } from "../utils/aqi";

describe("AQI calculation and assessment", () => {
    it("empty measurements should evaluate to null", () => {
        const aqi = calculateAqi([]);
        expect(aqi).to.equal(null);
    });

    const tests = [
        { measurements: [{ indicator: "o3", value: 25 }], expected: 0 },
        { measurements: [{ indicator: "pm2.5", value: 32 }], expected: 3 },
        { measurements: [{ indicator: "pm10", value: 1300 }], expected: 5 },
        { measurements: [{ indicator: "no2", value: 50 }], expected: 1 },
        { measurements: [{ indicator: "so2", value: 100 }], expected: 0 },
        { measurements: [{ indicator: "so2", value: 101 }, { indicator: "pm2.5", value: 40 }], expected: 3 },
        {
            measurements: [
                { indicator: "pm10", value: 48 },
                { indicator: "o3", value: 40 },
                { indicator: "no2", value: 399.99 },
            ],
            expected: 3,
        },
        {
            measurements: [
                { indicator: "pm10", value: 12 },
                { indicator: "o3", value: 210 },
                { indicator: "no2", value: 400.01 },
                { indicator: "so2", value: 220 },
                { indicator: "pm2.5", value: 13 },
            ],
            expected: 4,
        },
    ];

    const convertedTests = tests.map((t) => ({
        ...t,
        measurements: t.measurements.map((m) => ({
            unit: "ug/m3",
            dateStart: moment("2019-09-01 12:00:00").toDate(),
            dateEnd: moment("2019-09-01 13:00:00").toDate(),
            ...m,
        })),
    }));

    convertedTests.forEach((test) => {
        const indicators = test.measurements.map((m) => `${m.indicator}(${m.value})`).join(", ");
        const testComment = `${test.measurements.length} measurement(s) of indicators [${indicators}]`;

        it(`${testComment} should evaluate to ${test.expected}`, () => {
            const expected: Measurement = {
                value: test.expected,
                unit: "",
                dateStart: moment("2019-09-01 12:00:00").toDate(),
                dateEnd: moment("2019-09-01 13:00:00").toDate(),
                indicator: "eea_aqi",
            };

            const aqi = calculateAqi(test.measurements);
            expect(aqi).to.deep.equal(expected);
        });
    });

    it("measurements of durations unequal to 1 hour should evaluate to null", () => {
        const measurements: Measurement[] = convertedTests[0].measurements.map((m) => ({
            ...m,
            dateStart: moment("2019-09-01 11:59:00").toDate(),
        }));
        const aqi = calculateAqi(measurements);
        expect(aqi).to.equal(null);
    });
});
