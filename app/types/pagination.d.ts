export type Pagination = {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number | null
    to: number | null
}

export type PaginatedResponse<T> = {
    data: T[]
    pagination: Pagination
}
