import type {ThemeMemberPermissions} from "~/types/themeMembers";

export type Theme = {
    theme_id: string
    owner_id: string
    title: string
    color: string
    created_at?: string
    updated_at?: string
    permissions?: {
        permission_id: string
        theme_id: string
        user_id: string
        invited_at?: string | null
        status: 'active' | 'invited' | 'revoked'
    } & ThemeMemberPermissions
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