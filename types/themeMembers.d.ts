
export type ThemeMemberUser = {
    user_id: string
    username: string
    email: string
    first_name?: string | null
    last_name?: string | null
    avatar_path?: string | null
}

export type ThemeMemberPermissions = {
    can_view: boolean
    can_update_theme: boolean
    can_add_task: boolean
    can_edit_task: boolean
    can_delete_task: boolean
    can_validate_task: boolean
}

export type ThemeMemberStatus = 'owner' | 'active' | 'invited' | 'revoked'

export type ThemeMember = {
    user_id: string
    username: string
    email: string
    first_name?: string | null
    last_name?: string | null
    avatar_path?: string | null
    status: ThemeMemberStatus
    invited_at?: string | null
    permissions: ThemeMemberPermissions
}

export type PermissionPreset = 'read' | 'edit' | 'full' | 'custom'

export type PermissionPresetConfig = {
    label: string
    icon: string
    permissions: ThemeMemberPermissions
}