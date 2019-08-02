import { Location } from "aq-client-eea";
import nodeGeocoder from "node-geocoder";

const geocoderOptions: nodeGeocoder.Options = {
    provider: "openstreetmap",
    httpAdapter: "https",
    language: "en",
};

const geocoder = nodeGeocoder(geocoderOptions);

export async function reverseGeocode(lon: number, lat: number): Promise<Location | null> {
    const results = await geocoder.reverse({ lat, lon });
    if (!results || results.length === 0) {
        return null;
    }
    const result = results[0];
    return {
        latitude: lat,
        longitude: lon,
        city: result.city,
        countryCode: result.countryCode || "",
        streetName: result.streetName,
        streetNumber: result.streetNumber,
    };
}
