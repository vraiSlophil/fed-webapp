export type User = {
    user_id: string;
    username: string;
    email: string;
    avatar_path?: string | null;
    last_name?: string | null;
    first_name?: string | null;
    last_login_at?: Date | null;
    last_login_ip?: string | null;
    settings?: Record<string, any> | null;
    role_power: number;
    created_at?: Date | null;
    updated_at?: Date | null;
}