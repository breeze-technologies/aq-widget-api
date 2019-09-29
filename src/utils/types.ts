export function isDict(obj: any) {
    return typeof obj === "object" && obj !== null && !(obj instanceof Array) && !(obj instanceof Date);
}

export function isArray(obj: any) {
    return Array.isArray(obj);
}
