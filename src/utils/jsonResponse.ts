import { JsonResponse, JsonResponseStatus } from "../models/jsonResponse";

export function jsonSuccess<ResultType>(result: ResultType): JsonResponse<ResultType> {
    return { status: JsonResponseStatus.Success, result };
}

export function jsonError(error: any): JsonResponse<any> {
    return { status: JsonResponseStatus.Error, error };
}
