import type {Pagination} from "~/types/pagination";

export type User = {
    user_id: string;
    username: string;
    email: string;
    email_verified_at?: string | null;
    avatar_path?: string | null;
    last_name?: string | null;
    first_name?: string | null;
    last_login_at?: string | null;
    last_login_ip?: string | null;
    settings?: Record<string, any> | null;
    role_power: number;
    blocked_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    role?: Role;
}

export type Role = {
    power: number
    name: string
    created_at?: string
    updated_at?: string
}

export type UserResponse = {
    users: User[]
    pagination: Pagination
    roles: Role[]
    stats: UsersMetrics
}

export type SpecificUserMetrics = {
    themes_count: number
    tasks_count: number
    completed_tasks_count: number
    last_activity: string
    account_age_days: number
    themes_as_member: number
}

export type UsersMetrics = {
    total_users: number
    active_users: number
    blocked_users: number
    verified_users: number
    unverified_users: number
    created_last_7_days: number
    verified_last_7_days: number
    blocked_last_7_days: number
}
