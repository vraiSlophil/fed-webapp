export type Theme = {
    theme_id: string
    owner_id: string
    title: string
    color: string
    created_at?: string
    updated_at?: string
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