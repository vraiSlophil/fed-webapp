import { usePaginatedResource } from '~/domains/shared/composables/usePaginatedResource';
import type { Theme } from '~/types/theme';
import type { Pagination } from '~/types/pagination';

type ThemesIndexResponse = {
    status: string;
    message: string;
    data: {
        themes: Theme[];
        pagination: Pagination;
    };
};

// Filtres éventuels pour les thèmes (à étendre si besoin plus tard)
export type ThemeFilters = Record<string, any>;

export const useThemesPagination = () => {
    return usePaginatedResource<Theme, ThemeFilters, ThemesIndexResponse>({
        basePath: '/api/themes',
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
};
