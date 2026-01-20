export type QueryValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | Date
    | (string | number | boolean | null | undefined | Date)[];
export type QueryParams = Record<string, QueryValue>;

const encode = (value: unknown): string => {
    if (value instanceof Date) return encodeURIComponent(value.toISOString());
    return encodeURIComponent(String(value));
};

export const buildQueryString = (params?: QueryParams | null): string => {
    if (!params) return '';

    const parts: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) return;

        const encodedKey = encodeURIComponent(key);

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item === undefined) return;
                if (item === null || item === '') return;
                parts.push(`${encodedKey}[]=${encode(item)}`);
            });
            return;
        }

        if (value === null || value === '') return;

        parts.push(`${encodedKey}=${encode(value)}`);
    });

    if (!parts.length) return '';

    return `?${parts.join('&')}`;
};
