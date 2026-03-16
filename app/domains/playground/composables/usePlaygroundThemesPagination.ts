import { usePaginatedResource } from '~/domains/shared/composables/usePaginatedResource';
import type { Theme } from '~/types/theme';
import type { Pagination } from '~/types/pagination';
import { useApiFetch } from '~/composables/useApiFetch';

type PlaygroundThemesIndexResponse = {
    success: boolean;
    status: number;
    data: {
        themes: Theme[];
        pagination: Pagination;
    };
};

export const usePlaygroundThemesPagination = (playgroundId: string) => {
    // map page -> liste des thèmes pour cette page
    const state = reactive<{
        pages: Record<number, Theme[]>;
    }>({
        pages: {},
    });

    const {
        items,
        pagination,
        page,
        perPage,
        isLoading,
        error,
        hasNextPage,
        goToPage,
        nextPage,
        refreshCurrentPage,
        setPerPage,
    } = usePaginatedResource<Theme, Record<string, any>, PlaygroundThemesIndexResponse>({
        basePath: `/api/playgrounds/${playgroundId}/themes`,
        initialPage: 1,
        initialPerPage: 20,
        initialFilters: {},
        parseResponse: (response) => {
            const { themes, pagination } = response.data;
            return {
                items: themes,
                pagination,
            };
        },
    });

    // à chaque chargement de page via usePaginatedResource, on mémorise
    const memorizePage = () => {
        if (pagination.value) {
            state.pages[page.value] = [...items.value];
        }
    };

    const loadFirstPage = async () => {
        await goToPage(1);
        memorizePage();
    };

    const loadSpecificPage = async (targetPage: number) => {
        await goToPage(targetPage);
        memorizePage();
    };

    const preloadAllPages = async () => {
        if (!pagination.value) return;
        const last = pagination.value.last_page;
        for (let p = 2; p <= last; p++) {
            // charge silencieusement chaque page et la mémorise
            const res = (await useApiFetch(`/api/playgrounds/${playgroundId}/themes`, {
                method: 'GET',
                query: {
                    page: p,
                    per_page: perPage.value,
                },
            })) as PlaygroundThemesIndexResponse;

            state.pages[p] = [...res.data.themes];
        }
    };

    const allThemes = computed<Theme[]>(() => {
        const pagesNumbers = Object.keys(state.pages)
            .map((n) => Number(n))
            .sort((a, b) => a - b);

        const result: Theme[] = [];
        for (const p of pagesNumbers) {
            result.push(...(state.pages[p] ?? []));
        }
        return result;
    });

    const clearAll = () => {
        state.pages = {};
    };

    const reloadFromPage = async (startPage: number) => {
        if (!pagination.value) return;

        const last = pagination.value.last_page;
        for (let p = startPage; p <= last; p++) {
            const res = (await useApiFetch(`/api/playgrounds/${playgroundId}/themes`, {
                method: 'GET',
                query: {
                    page: p,
                    per_page: perPage.value,
                },
            })) as PlaygroundThemesIndexResponse;

            state.pages[p] = [...res.data.themes];
        }
    };

    return {
        // état brut de la pagination
        items,
        pagination,
        page,
        perPage,
        isLoading,
        error,
        hasNextPage,

        // cache pages -> thèmes
        pages: state.pages,
        allThemes,

        // actions
        loadFirstPage,
        loadSpecificPage,
        preloadAllPages,
        reloadFromPage,
        clearAll,

        // helpers existants
        goToPage,
        nextPage,
        refreshCurrentPage,
        setPerPage,
    };
};
