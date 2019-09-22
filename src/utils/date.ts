import moment from "moment";

export function now() {
    return new Date();
}

export function isDateBefore(date1: Date, date2: Date) {
    return moment(date1)
        .clone()
        .isBefore(date2);
}

export function isDateAfter(date1: Date, date2: Date) {
    return moment(date1)
        .clone()
        .isAfter(date2);
}

export function isDateSame(date1: Date, date2: Date) {
    return moment(date1)
        .clone()
        .isSame(date2);
}

export function subtractHoursFromDate(date: Date, hours: number) {
    return moment(date)
        .clone()
        .subtract(hours, "hours")
        .toDate();
}

export function addHoursToDate(date: Date, hours: number) {
    return moment(date)
        .clone()
        .add(hours, "hours")
        .toDate();
}

export function timeframeEqualsHours(dateStart: Date, dateEnd: Date, hours: number) {
    const start = moment(dateStart).clone();
    const end = moment(dateEnd).clone();
    const xHoursEnd = start.clone().add(hours, "hours");

    return isDateSame(end.toDate(), xHoursEnd.toDate());
}

export function convertDateToIsoString(date: Date, keepOffset: boolean = false) {
    return moment(date).toISOString(keepOffset);
}

export function convertMillisecondsToDurationString(seconds: number) {
    const duration = moment.duration(seconds, "seconds");
    return `${Math.floor(duration.asMinutes())} min ${duration.seconds()} s ${duration.milliseconds().toFixed(3)} ms`;
}
