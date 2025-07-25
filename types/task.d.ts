export type Task = {
    task_id: string
    theme_id: string
    user_id: string
    title: string
    status: 'todo' | 'doing' | 'done'
    created_at?: string
    updated_at?: string
    archived_at?: string | null
    validated_at?: string | null
}

export type TaskFilters = {
    theme_id?: string
    status?: 'todo' | 'doing' | 'done'
    statuses?: string[]
    archived?: boolean
    validated?: boolean
    search?: string
    sort?: 'asc' | 'desc'
    page?: number
    per_page?: number
}

export type TaskResponse = {
    tasks: Task[]
    pagination: Pagination
}
