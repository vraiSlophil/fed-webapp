import type {ThemeMemberPermissions} from "~/types/themeMembers";
import type {PaginatedResponse} from "~/types/pagination";

export type Theme = {
    theme_id: string
    owner_id: string
    playground_id?: string;
    target_playground_id?: string;
    title: string
    color: string
    tasks_count?: number;
    created_at?: string
    updated_at?: string
    permissions?: {
        permission_id: string
        theme_id: string
        user_id: string
        target_playground_id?: string | null;
        invited_at?: string | null
        status: 'active' | 'invited' | 'revoked'
    } & ThemeMemberPermissions
    position?: {
        x: number
        y: number
        width: number
        zIndex: number
    }
    stored?: boolean
    page?: number
}

export type ThemeStats = {
    total: number
    active: number
    archived: number
    todo: number
    doing: number
    done: number
    recently_created: number
    recently_completed: number
    completion_rate: number
    theme?: {
        theme_id: string
        title: string
        color: string
    }
}

export type CreateThemePayload = {
    title: string
    color: string
    playground_id: string
}

// Réponse paginée spécialisée pour les thèmes (si l API suit ce format)
export type PaginatedThemesResponse = PaginatedResponse<Theme>
