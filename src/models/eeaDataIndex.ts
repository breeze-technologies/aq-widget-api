import { Station } from "aq-client-eea";

export interface EeaStationIndex {
    [stationIdentifier: string]: Station;
}

export interface EeaLocationIndex {
    [stationIdentifier: string]: EeaLocationIndexEntry;
}

export interface EeaLocationIndexEntry {
    lon: number;
    lat: number;
    cc: string; // Country Code
    id?: string;
}
