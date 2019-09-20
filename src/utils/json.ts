export function convertToJson(obj: any) {
    return JSON.stringify(obj);
}

export function convertFromJson(json: string) {
    return JSON.parse(json);
}
