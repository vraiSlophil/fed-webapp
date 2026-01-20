import { useApiFetch } from '~/composables/useApiFetch';
import { HttpMethods } from '~/utils/httpMethods';
import type { Theme } from '~/types/theme';
import type { Pagination } from '~/types/pagination';

// Types internes pour le cache paginé
export type ThemePageKey = number;

export type ThemePageData = {
    page: number;
    perPage: number;
    items: Theme[];
    pagination?: Pagination;
};

export type ThemesByPage = Record<ThemePageKey, ThemePageData>;
export type ThemePageLookup = Record<string, ThemePageKey>;

export const useThemes = () => {
    const themes = ref<Theme[]>([]);
    const currentTheme = ref<Theme | null>(null);
    const loading = ref(false);

    // Cache paginé
    const themesByPage = ref<ThemesByPage>({});
    const themePageLookup = ref<ThemePageLookup>({});
    const currentPage = ref<number>(1);
    const perPage = ref<number>(20);
    const total = ref<number>(0);
    const totalPages = ref<number>(1);

    const pagedThemes = computed<Theme[]>(() => {
        const pageData = themesByPage.value[currentPage.value];
        return pageData?.items ?? [];
    });

    // Garder "themes" compatible avec l ancienne API en le liant à la page courante
    watchEffect(() => {
        themes.value = pagedThemes.value;
    });

    const applyPaginationMeta = (pagination?: Pagination) => {
        if (!pagination) return;
        total.value = pagination.total;
        perPage.value = pagination.per_page;
        currentPage.value = pagination.current_page;
        totalPages.value = pagination.last_page;
    };

    const hydrateLookupFromPage = (pageData: ThemePageData) => {
        pageData.items.forEach((theme) => {
            themePageLookup.value[theme.theme_id] = pageData.page;
        });
    };

    const fetchThemesPage = async (
        page: number = currentPage.value,
        options?: { force?: boolean },
    ) => {
        if (!options?.force && themesByPage.value[page]) {
            currentPage.value = page;
            return themesByPage.value[page];
        }

        loading.value = true;

        try {
            const response = await useApiFetch(
                `/api/themes?page=${page}&per_page=${perPage.value}`,
                {
                    method: HttpMethods.GET,
                },
            );

            // Format de réponse: { data: { themes: Theme[], pagination: Pagination } } ou { themes, pagination } directement
            const root = response.data;
            const themesArray: Theme[] = root.data?.themes ?? root.themes ?? root.data?.data ?? [];

            const pagination: Pagination | undefined = root.data?.pagination ?? root.pagination;

            const pageData: ThemePageData = {
                page,
                perPage: perPage.value,
                items: themesArray,
                pagination,
            };

            themesByPage.value[page] = pageData;
            hydrateLookupFromPage(pageData);
            applyPaginationMeta(pagination);
            currentPage.value = page;

            return pageData;
        } catch (error: any) {
            console.error(error?.value ?? error);
            throw new Error(
                error?.message || `Erreur lors de la récupération des thèmes (page ${page})`,
            );
        } finally {
            loading.value = false;
        }
    };

    // Helper: retourne la page où se trouve un thème si connu
    const getThemePage = (id: string): number | undefined => {
        const fromLookup = themePageLookup.value[id];
        if (fromLookup) {
            return fromLookup;
        }

        for (const [pageKey, pageData] of Object.entries(themesByPage.value)) {
            const found = pageData.items.find((t) => t.theme_id === id);
            if (found) {
                const numericPage = Number(pageKey);
                themePageLookup.value[id] = numericPage;
                return numericPage;
            }
        }

        return undefined;
    };

    const setPage = async (page: number) => {
        if (page < 1) page = 1;
        if (totalPages.value && page > totalPages.value) page = totalPages.value;
        await fetchThemesPage(page);
    };

    // Optionnel si per_page est vraiment constant, mais dispo si besoin
    const setPerPage = async (value: number) => {
        if (value <= 0) return;
        if (perPage.value === value) return;

        perPage.value = value;
        // Invalidation complète du cache car l'indexation change
        themesByPage.value = {};
        themePageLookup.value = {};
        currentPage.value = 1;
        total.value = 0;
        totalPages.value = 1;

        return fetchThemesPage(1, { force: true });
    };

    // Ancienne API : garder fetchThemes comme alias vers la page 1 pour compat
    const fetchThemes = async () => {
        return fetchThemesPage(1, { force: true });
    };

    const getTheme = async (id: string, options?: { preferCache?: boolean }) => {
        loading.value = true;

        try {
            if (options?.preferCache) {
                const pageKey = getThemePage(id);
                if (pageKey) {
                    const pageData = themesByPage.value[pageKey];
                    const found = pageData?.items.find((t) => t.theme_id === id);
                    if (found) {
                        currentTheme.value = found;
                        return found;
                    }
                }
            }

            const response = await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.GET,
            });
            const theme: Theme = response.data.theme ?? response.data.data?.theme;
            currentTheme.value = theme;
            return theme;
        } catch (error: any) {
            console.error(error?.value ?? error);
            throw new Error(error?.message || `Erreur lors de la récupération du thème ${id}`);
        } finally {
            loading.value = false;
        }
    };

    const createTheme = async (
        themeData: { title: string; color: string; playground_id?: string },
        options?: {
            targetPage?: number;
        },
    ) => {
        loading.value = true;

        try {
            const response = await useApiFetch('/api/themes', {
                method: HttpMethods.POST,
                body: JSON.stringify(themeData),
            });

            const created: Theme = response.data.theme ?? response.data.data?.theme;

            const targetPage = options?.targetPage ?? 1;
            await fetchThemesPage(targetPage, { force: true });

            return created;
        } catch (error: any) {
            console.error(error?.value ?? error);
            throw new Error(error?.message || `Erreur lors de la création du thème`);
        } finally {
            loading.value = false;
        }
    };

    const updateTheme = async (id: string, themeData: { title?: string; color?: string }) => {
        loading.value = true;

        try {
            const response = await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.PATCH,
                body: JSON.stringify(themeData),
            });

            const updated: Theme = response.data.theme ?? response.data.data?.theme;

            const pageKey = getThemePage(id);
            if (pageKey) {
                await fetchThemesPage(pageKey, { force: true });
            } else {
                // Fallback: tentative de mise à jour locale si jamais on ne sait pas où il se trouve
                for (const [key, pageData] of Object.entries(themesByPage.value)) {
                    const index = pageData.items.findIndex((t) => t.theme_id === id);
                    if (index !== -1) {
                        pageData.items[index] = updated;
                        themesByPage.value[Number(key)] = { ...pageData };
                        themePageLookup.value[id] = pageData.page;
                        break;
                    }
                }
            }

            if (currentTheme.value?.theme_id === id) {
                currentTheme.value = updated;
            }

            return updated;
        } catch (error: any) {
            console.error(error?.value ?? error);
            throw new Error(error?.message || `Erreur lors de la mise à jour du thème ${id}`);
        } finally {
            loading.value = false;
        }
    };

    const removeThemeFromCache = (id: string) => {
        const pageKey = themePageLookup.value[id];
        if (!pageKey) return;

        const pageData = themesByPage.value[pageKey];
        if (!pageData) return;

        pageData.items = pageData.items.filter((t) => t.theme_id !== id);
        themesByPage.value[pageKey] = { ...pageData };
        delete themePageLookup.value[id];
    };

    const refetchFromPage = async (startPage: number) => {
        if (!totalPages.value || startPage > totalPages.value) return;
        // On ne refetch que de startPage à totalPages, les pages < startPage ne sont jamais rappelées
        for (let page = startPage; page <= totalPages.value; page++) {
            await fetchThemesPage(page, { force: true });
        }
    };

    const deleteTheme = async (id: string) => {
        loading.value = true;

        // On capture d'abord la page où se trouve ce thème
        const pageKeyBefore = getThemePage(id);

        try {
            await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.DELETE,
            });

            removeThemeFromCache(id);

            if (pageKeyBefore) {
                await refetchFromPage(pageKeyBefore);
            }

            if (currentTheme.value?.theme_id === id) {
                currentTheme.value = null;
            }

            return true;
        } catch (error: any) {
            console.error(error?.value ?? error);
            throw new Error(error?.message || `Erreur lors de la suppression du thème ${id}`);
        } finally {
            loading.value = false;
        }
    };

    const leaveTheme = async (id: string) => {
        loading.value = true;

        const pageKeyBefore = getThemePage(id);

        try {
            await useApiFetch(`/api/themes/${id}/leave`, {
                method: HttpMethods.POST,
            });

            removeThemeFromCache(id);

            if (pageKeyBefore) {
                await refetchFromPage(pageKeyBefore);
            }

            if (currentTheme.value?.theme_id === id) {
                currentTheme.value = null;
            }

            return true;
        } catch (error: any) {
            console.error(error?.value ?? error);
            throw new Error(error?.message || `Erreur lors de la sortie du thème ${id}`);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Déplace un thème vers un autre playground.
     * - Si l'utilisateur est propriétaire du thème : PATCH /api/themes/{id} avec { playground_id }
     * - Si l'utilisateur est membre invité : PATCH /api/themes/{id}/members/{userId}/move-to-playground avec { target_playground_id }
     */
    const moveThemeToPlayground = async (
        themeId: string,
        targetPlaygroundId: string,
        options?: { isOwner?: boolean; userId?: string },
    ) => {
        loading.value = true;

        try {
            if (options?.isOwner) {
                // Propriétaire : mise à jour directe du playground_id
                await useApiFetch(`/api/themes/${themeId}`, {
                    method: HttpMethods.PATCH,
                    body: JSON.stringify({ playground_id: targetPlaygroundId }),
                });
            } else if (options?.userId) {
                // Membre invité : route spécifique pour déplacer
                await useApiFetch(
                    `/api/themes/${themeId}/members/${options.userId}/move-to-playground`,
                    {
                        method: HttpMethods.PATCH,
                        body: JSON.stringify({
                            target_playground_id: targetPlaygroundId,
                        }),
                    },
                );
            } else {
                throw new Error(
                    'Impossible de déterminer le type de déplacement (propriétaire ou membre)',
                );
            }

            // Retirer le thème du cache local après succès
            removeThemeFromCache(themeId);

            if (currentTheme.value?.theme_id === themeId) {
                currentTheme.value = null;
            }

            return true;
        } catch (error: any) {
            console.error(error?.value ?? error);
            throw new Error(
                error?.message || `Erreur lors du déplacement du thème vers le playground`,
            );
        } finally {
            loading.value = false;
        }
    };

    return {
        themes,
        currentTheme,
        loading,
        // pagination et cache
        themesByPage,
        themePageLookup,
        pagedThemes,
        currentPage,
        perPage,
        total,
        totalPages,
        // API
        fetchThemes,
        fetchThemesPage,
        setPage,
        getTheme,
        createTheme,
        updateTheme,
        deleteTheme,
        leaveTheme,
        moveThemeToPlayground,
    };
};
