export type Playground = {
    playground_id: string
    name: string
    slug?: string | null
    is_default: boolean
    color?: string | null
    background_color?: string | null
    icon?: string | null
    themes_count?: number
    created_at?: string
    updated_at?: string
}

export type CreatePlaygroundPayload = {
    name: string
    slug?: string | null
    icon?: string | null
    color?: string | null
    background_color?: string | null
    is_default?: boolean
}

export type PlaygroundStats = {
    themes: {
        total: number
        private: number
        shared: number
        public: number
    }
    tasks: {
        total: number
        todo: number
        in_progress: number
        done: number
    }
    completion_rate: number
    recent_activity: RecentActivity
}

export type RecentActivity = {
    recent_tasks: Array<Task & {
        theme: Pick<Theme, 'theme_id' | 'title'>
        user: Pick<ThemeMemberUser, 'user_id' | 'username'>
    }>
    recent_themes: Array<Theme & {
        owner: Pick<ThemeMemberUser, 'user_id' | 'username'>
    }>
}

export type PlaygroundCompleteData = {
    playground: Playground
    themes: Array<Theme & {
        tasks: Task[]
        theme_user_permissions?: Array<{
            user: Pick<ThemeMemberUser, 'user_id' | 'username' | 'first_name' | 'last_name'>
        }>
    }>
    stats: {
        themes_count: number
        tasks_count: number
        completed_tasks_count: number
        completion_rate: number
    }
    recent_activity: RecentActivity
}

export type PlaygroundListResponse = {
    playgrounds: Playground[]
}

export type PlaygroundResponse = {
    playground: Playground
}

export type PlaygroundStatsResponse = {
    playground: Playground
    stats: PlaygroundStats
}