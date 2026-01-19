import { computed, ref } from 'vue';
import { type ApiFetchOptions, useApiFetch } from '~/composables/useApiFetch';
import type { Pagination } from '~/types/pagination';

export type PaginatedFetcherOptions<T, TFilters, TResponse> = {
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
    /**
     * Fonction responsable d'extraire les items et la pagination
     * depuis la réponse brute renvoyée par l'API.
     */
    parseResponse: (response: TResponse) => {
        items: T[];
        pagination: Pagination;
    };
};

export const usePaginatedResource = <
    T,
    TFilters extends Record<string, any> = Record<string, any>,
    TResponse = any,
>(
    options: PaginatedFetcherOptions<T, TFilters, TResponse>,
) => {
    const {
        basePath,
        initialFilters,
        initialPage = 1,
        initialPerPage = 20,
        fetchOptions,
        parseResponse,
    } = options;

    const items = ref<T[]>([]);
    const pagination = ref<Pagination | null>(null);
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

            const response = await useApiFetch(basePath, {
                ...(fetchOptions || {}),
                method: 'GET',
                query,
            } as ApiFetchOptions);

            const { items: newItems, pagination: newPagination } = parseResponse(
                response as TResponse,
            );

            items.value = newItems;
            pagination.value = newPagination;
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
        shouldLoadPage ? await loadPage(1) : null;
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
