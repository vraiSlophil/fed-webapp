import { computed, ref } from 'vue';
import type { ApiRawMeta, ApiSuccessEnvelope } from '~/types/api';
import { type ApiFetchOptions, useApiFetch } from '~/composables/useApiFetch';
import type { Pagination } from '~/types/pagination';
import { splitApiMeta } from '~/utils/apiEnvelope';

export type PaginatedFetcherOptions<T, TFilters, TData> = {
    /** URL de base de la ressource, ex: '/api/tasks' */
    basePath: string;
    /** Filtres initiaux (mémorisés et réutilisés à chaque requête) */
    initialFilters?: TFilters;
    /** Page initiale (par défaut 1) */
    initialPage?: number;
    /** Nombre d'items par page (par défaut 15) */
    initialPerPage?: number;
    /** Options additionnelles pour useApiFetch (headers, etc.) */
    fetchOptions?: Omit<ApiFetchOptions, 'method' | 'query'>;
    /** Fonction responsable d'extraire les items depuis envelope.data */
    parseItems: (_data: TData) => T[];
};

export const usePaginatedResource = <
    T,
    TFilters extends Record<string, any> = Record<string, any>,
    TData = unknown,
>(
    options: PaginatedFetcherOptions<T, TFilters, TData>,
) => {
    const {
        basePath,
        initialFilters,
        initialPage = 1,
        initialPerPage = 20,
        fetchOptions,
        parseItems,
    } = options;

    const items = ref<T[]>([]);
    const pagination = ref<Pagination | null>(null);
    const metaExtras = ref<ApiRawMeta>({});
    const page = ref(Math.max(1, initialPage));
    const perPage = ref(initialPerPage > 0 ? initialPerPage : 20);
    const filters = ref<TFilters>(
        (initialFilters ? { ...(initialFilters as any) } : {}) as TFilters,
    );
    const isLoading = ref(false);
    const error = ref<Error | null>(null);

    const hasNextPage = computed(() => {
        if (!pagination.value) return false;
        return pagination.value.current_page < pagination.value.last_page;
    });

    const hasPrevPage = computed(() => {
        if (!pagination.value) return false;
        return pagination.value.current_page > 1;
    });

    const isFirstPage = computed(() => pagination.value?.current_page === 1);
    const isLastPage = computed(() => {
        if (!pagination.value) return false;
        return pagination.value.current_page === pagination.value.last_page;
    });

    const loadPage = async (targetPage: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            page.value = targetPage < 1 ? 1 : targetPage;

            const query: Record<string, any> = {
                page: page.value,
                per_page: perPage.value,
                ...(filters.value as any),
            };

            const envelope = (await useApiFetch<TData>(basePath, {
                ...(fetchOptions || {}),
                method: 'GET',
                query,
            } as ApiFetchOptions)) as ApiSuccessEnvelope<TData> | null;

            if (!envelope) {
                throw new Error('Paginated resources cannot resolve from a 204 response.');
            }

            const { pagination: newPagination, metaExtras: newMetaExtras } = splitApiMeta(
                envelope.meta,
            );

            items.value = parseItems(envelope.data);
            pagination.value = newPagination;
            metaExtras.value = newMetaExtras;
        } catch (e: any) {
            error.value = e;
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    const goToPage = async (targetPage: number) => {
        if (targetPage < 1) targetPage = 1;

        if (pagination.value && targetPage > pagination.value.last_page) {
            targetPage = pagination.value.last_page;
        }

        await loadPage(targetPage);
    };

    const nextPage = async () => {
        if (pagination.value && page.value >= pagination.value.last_page) return;
        const next = page.value + 1;
        await goToPage(next);
    };

    const prevPage = async () => {
        const prev = page.value - 1;
        if (prev < 1) return;
        await goToPage(prev);
    };

    const refreshCurrentPage = async () => {
        await loadPage(page.value);
    };

    const setPerPage = async (value: number, shouldLoadPage: boolean = true) => {
        if (value <= 0) return;
        perPage.value = value;
        page.value = 1;
        if (shouldLoadPage) {
            await loadPage(1);
        }
    };

    const setFilters = async (newFilters: TFilters) => {
        filters.value = { ...(newFilters as any) };
        page.value = 1;
        await loadPage(1);
    };

    const updateFilters = async (partial: Partial<TFilters>) => {
        filters.value = { ...(filters.value as any), ...(partial as any) };
        page.value = 1;
        await loadPage(1);
    };

    return {
        items,
        pagination,
        metaExtras,
        page,
        perPage,
        filters,
        isLoading,
        error,
        hasNextPage,
        hasPrevPage,
        isFirstPage,
        isLastPage,
        goToPage,
        nextPage,
        prevPage,
        refreshCurrentPage,
        setPerPage,
        setFilters,
        updateFilters,
    };
};
