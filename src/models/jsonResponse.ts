export interface JsonResponse<ResultType> {
    status: JsonResponseStatus;
    error?: any;
    result?: ResultType;
}

export enum JsonResponseStatus {
    Success = "success",
    Error = "error",
}
