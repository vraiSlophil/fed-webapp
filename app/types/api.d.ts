import type { Pagination } from '~/types/pagination';

export type ApiMessageParamValue = string | number | boolean | null;

export type ApiMessageParams = Record<string, ApiMessageParamValue>;

export type ApiRawMeta = Record<string, unknown>;

export type ApiValidationErrors = Record<string, string[]>;

export type ApiSuccessEnvelope<TData, TMeta extends ApiRawMeta = ApiRawMeta> = {
    status: 'success';
    message: string;
    message_code: string;
    message_params?: ApiMessageParams;
    data: TData;
    meta?: TMeta;
};

export type ApiErrorEnvelope<TErrors = unknown, TMeta extends ApiRawMeta = ApiRawMeta> = {
    status: 'error';
    message: string;
    message_code: string;
    message_params?: ApiMessageParams;
    data?: null;
    errors?: TErrors;
    meta?: TMeta;
};

export type ApiEnvelope<TData, TErrors = unknown, TMeta extends ApiRawMeta = ApiRawMeta> =
    | ApiSuccessEnvelope<TData, TMeta>
    | ApiErrorEnvelope<TErrors, TMeta>;

export type SplitApiMetaResult = {
    pagination: Pagination | null;
    metaExtras: ApiRawMeta;
};

export type ApiClientErrorShape<TErrors = unknown> = Error & {
    statusCode: number;
    messageCode: string | null;
    messageParams: ApiMessageParams | null;
    errors: TErrors | null;
    fieldErrors: ApiValidationErrors | null;
    meta: ApiRawMeta | null;
    requestId: string | null;
    headers: Headers;
};
