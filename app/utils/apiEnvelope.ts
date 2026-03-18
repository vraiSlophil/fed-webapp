import type {
    ApiClientErrorShape,
    ApiMessageParams,
    ApiRawMeta,
    ApiValidationErrors,
    SplitApiMetaResult,
} from '~/types/api';
import type { Pagination } from '~/types/pagination';

const PAGINATION_KEYS = [
    'current_page',
    'per_page',
    'total',
    'last_page',
    'from',
    'to',
    'has_next',
] as const;

const hasPaginationKey = (meta: ApiRawMeta, key: (typeof PAGINATION_KEYS)[number]): boolean => {
    return Object.prototype.hasOwnProperty.call(meta, key);
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isNullableNumber = (value: unknown): value is number | null => {
    return value === null || typeof value === 'number';
};

const isPaginationMeta = (meta: ApiRawMeta): meta is Pagination => {
    return (
        PAGINATION_KEYS.every((key) => hasPaginationKey(meta, key)) &&
        typeof meta.current_page === 'number' &&
        typeof meta.per_page === 'number' &&
        typeof meta.total === 'number' &&
        typeof meta.last_page === 'number' &&
        isNullableNumber(meta.from) &&
        isNullableNumber(meta.to) &&
        typeof meta.has_next === 'boolean'
    );
};

const resolveMetaRecord = (meta: unknown): ApiRawMeta | null => {
    if (!isObjectRecord(meta)) {
        return null;
    }

    return { ...meta };
};

const resolveValidationErrors = (errors: unknown): ApiValidationErrors | null => {
    if (!isObjectRecord(errors)) {
        return null;
    }

    const entries = Object.entries(errors).filter(([, value]) => {
        return Array.isArray(value) && value.every((item) => typeof item === 'string');
    });

    if (entries.length === 0) {
        return null;
    }

    return Object.fromEntries(entries) as ApiValidationErrors;
};

const resolveHeaders = (
    headers?: Headers | { get(_name: string): string | null | undefined } | null,
): Headers => {
    if (headers instanceof Headers) {
        return headers;
    }

    const normalizedHeaders = new Headers();

    if (headers?.get) {
        const requestId = headers.get('X-Request-Id');

        if (requestId) {
            normalizedHeaders.set('X-Request-Id', requestId);
        }
    }

    return normalizedHeaders;
};

export class ApiClientError<TErrors = unknown>
    extends Error
    implements ApiClientErrorShape<TErrors>
{
    public readonly statusCode: number;

    public readonly messageCode: string | null;

    public readonly messageParams: ApiMessageParams | null;

    public readonly errors: TErrors | null;

    public readonly fieldErrors: ApiValidationErrors | null;

    public readonly meta: ApiRawMeta | null;

    public readonly requestId: string | null;

    public readonly headers: Headers;

    public constructor(params: {
        message: string;
        statusCode: number;
        messageCode?: string | null;
        messageParams?: ApiMessageParams | null;
        errors?: TErrors | null;
        meta?: ApiRawMeta | null;
        requestId?: string | null;
        headers?: Headers | { get(_name: string): string | null | undefined } | null;
        cause?: unknown;
    }) {
        super(params.message, { cause: params.cause });
        this.name = 'ApiClientError';
        this.statusCode = params.statusCode;
        this.messageCode = params.messageCode ?? null;
        this.messageParams = params.messageParams ?? null;
        this.errors = params.errors ?? null;
        this.fieldErrors = resolveValidationErrors(params.errors);
        this.meta = params.meta ?? null;
        this.headers = resolveHeaders(params.headers);
        this.requestId = params.requestId ?? getRequestId(this.meta, this.headers);
    }
}

export const splitApiMeta = (meta: unknown): SplitApiMetaResult => {
    const metaRecord = resolveMetaRecord(meta);

    if (!metaRecord) {
        return {
            pagination: null,
            metaExtras: {},
        };
    }

    if (!isPaginationMeta(metaRecord)) {
        return {
            pagination: null,
            metaExtras: metaRecord,
        };
    }

    const metaExtras = Object.fromEntries(
        Object.entries(metaRecord).filter(([key]) => {
            return !PAGINATION_KEYS.includes(key as (typeof PAGINATION_KEYS)[number]);
        }),
    );

    return {
        pagination: {
            current_page: metaRecord.current_page,
            per_page: metaRecord.per_page,
            total: metaRecord.total,
            last_page: metaRecord.last_page,
            from: metaRecord.from,
            to: metaRecord.to,
            has_next: metaRecord.has_next,
        },
        metaExtras,
    };
};

export const getRequestId = (
    meta: unknown,
    headers?: Headers | { get(_name: string): string | null | undefined } | null,
): string | null => {
    const metaRecord = resolveMetaRecord(meta);
    const requestIdFromMeta = metaRecord?.request_id;

    if (typeof requestIdFromMeta === 'string' && requestIdFromMeta !== '') {
        return requestIdFromMeta;
    }

    return resolveHeaders(headers).get('X-Request-Id');
};

export const getFieldErrors = (error: unknown): ApiValidationErrors | null => {
    if (!isValidationApiError(error)) {
        return null;
    }

    return error.fieldErrors;
};

export const isApiClientError = (error: unknown): error is ApiClientError => {
    return error instanceof ApiClientError;
};

export const isValidationApiError = (error: unknown): error is ApiClientError => {
    return isApiClientError(error) && error.messageCode === 'validation.invalid';
};
