const timestamp = '2026-01-12T10:00:00.000Z';

export const standardUser = {
    user_id: '11111111-1111-4111-8111-111111111111',
    username: 'standard-user',
    email: 'user@example.com',
    email_verified_at: timestamp,
    avatar_path: null,
    last_name: 'User',
    first_name: 'Standard',
    last_login_at: timestamp,
    last_login_ip: '127.0.0.1',
    settings: null,
    role_power: 10,
    blocked_at: null,
    created_at: timestamp,
    updated_at: timestamp,
    role: {
        power: 10,
        name: 'user',
    },
};

export const adminUser = {
    user_id: '22222222-2222-4222-8222-222222222222',
    username: 'admin-user',
    email: 'admin@example.com',
    email_verified_at: timestamp,
    avatar_path: null,
    last_name: 'Admin',
    first_name: 'Alice',
    last_login_at: timestamp,
    last_login_ip: '127.0.0.1',
    settings: null,
    role_power: 100,
    blocked_at: null,
    created_at: timestamp,
    updated_at: timestamp,
    role: {
        power: 100,
        name: 'admin',
    },
};

export const defaultPlayground = {
    playground_id: '33333333-3333-4333-8333-333333333333',
    name: 'Home',
    slug: 'home',
    is_default: true,
    color: '#3366FF',
    background_color: '#F4F7FF',
    icon: 'home',
    themes_count: 1,
    created_at: timestamp,
    updated_at: timestamp,
};

export const secondaryPlayground = {
    playground_id: '44444444-4444-4444-8444-444444444444',
    name: 'Work',
    slug: 'work',
    is_default: false,
    color: '#11AA88',
    background_color: '#F1FFFA',
    icon: 'work',
    themes_count: 0,
    created_at: timestamp,
    updated_at: timestamp,
};

export const themePermissions = {
    permission_id: '55555555-5555-4555-8555-555555555555',
    theme_id: '66666666-6666-4666-8666-666666666666',
    user_id: standardUser.user_id,
    status: 'active',
    can_view: true,
    can_update_theme: true,
    can_add_task: true,
    can_edit_task: true,
    can_delete_task: true,
    can_validate_task: true,
};

export const playgroundTheme = {
    theme_id: '66666666-6666-4666-8666-666666666666',
    owner_id: standardUser.user_id,
    playground_id: defaultPlayground.playground_id,
    title: 'Theme Alpha',
    color: '#FFAA00',
    tasks_count: 2,
    created_at: timestamp,
    updated_at: timestamp,
    permissions: themePermissions,
    position: {
        x: 32,
        y: 48,
        width: 480,
        zIndex: 2,
    },
    stored: false,
    page: 1,
};

export const themeStats = {
    total: 2,
    active: 2,
    archived: 0,
    todo: 1,
    doing: 1,
    done: 0,
    recently_created: 1,
    recently_completed: 0,
    completion_rate: 0,
    theme: {
        theme_id: playgroundTheme.theme_id,
        title: playgroundTheme.title,
        color: playgroundTheme.color,
    },
};

export const taskPagination = {
    total: 2,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 2,
    has_next: false,
};

export const activeTask = {
    task_id: '77777777-7777-4777-8777-777777777777',
    theme_id: playgroundTheme.theme_id,
    user_id: standardUser.user_id,
    title: 'Write Playwright plan',
    status: 'todo',
    created_at: timestamp,
    updated_at: timestamp,
    archived_at: null,
    validated_at: null,
};

export const inProgressTask = {
    task_id: '88888888-8888-4888-8888-888888888888',
    theme_id: playgroundTheme.theme_id,
    user_id: standardUser.user_id,
    title: 'Stabilize selectors',
    status: 'doing',
    created_at: timestamp,
    updated_at: timestamp,
    archived_at: null,
    validated_at: null,
};

export const ownerMember = {
    user_id: standardUser.user_id,
    username: standardUser.username,
    email: standardUser.email,
    first_name: standardUser.first_name,
    last_name: standardUser.last_name,
    avatar_path: null,
    status: 'owner',
    invited_at: timestamp,
    permissions: {
        can_view: true,
        can_update_theme: true,
        can_add_task: true,
        can_edit_task: true,
        can_delete_task: true,
        can_validate_task: true,
    },
};

export const activeMember = {
    user_id: '99999999-9999-4999-8999-999999999999',
    username: 'existing-member',
    email: 'existing-member@example.com',
    first_name: 'Existing',
    last_name: 'Member',
    avatar_path: null,
    status: 'active',
    invited_at: timestamp,
    permissions: {
        can_view: true,
        can_update_theme: false,
        can_add_task: true,
        can_edit_task: true,
        can_delete_task: false,
        can_validate_task: true,
    },
};

export const searchMemberResult = {
    user_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    username: 'new-member',
    email: 'new-member@example.com',
    first_name: 'New',
    last_name: 'Member',
    avatar_path: null,
};

export const adminRoles = [
    {
        power: 10,
        name: 'user',
    },
    {
        power: 100,
        name: 'admin',
    },
];

export const adminStats = {
    total_users: 2,
    active_users: 2,
    blocked_users: 0,
    verified_users: 2,
    unverified_users: 0,
    created_last_7_days: 1,
    verified_last_7_days: 1,
    blocked_last_7_days: 0,
};

export const adminUserListResponse = {
    users: [standardUser, adminUser],
    pagination: {
        total: 2,
        per_page: 20,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        has_next: false,
    },
    sorting: {
        sort_by: 'created_at',
        sort_direction: 'desc',
        available_sort_fields: ['created_at', 'last_login_at'],
    },
    filters: {
        search: '',
        role: null,
        status: '',
        verified: null,
        roles: [10, 100],
    },
    roles: adminRoles,
    stats: adminStats,
};

export const adminUserDetailsResponse = {
    user: adminUser,
    additional_stats: {
        themes_count: 4,
        tasks_count: 12,
        completed_tasks_count: 8,
        completion_rate_percentage: 66,
        last_activity: timestamp,
        account_age_days: 7,
        account_age_human: '7 days',
        days_since_last_login: 0,
        themes_as_member: 1,
        pending_invitations: 0,
        recent_activity: {
            tasks_last_7_days: 3,
            themes_last_7_days: 1,
            active_days_last_30: 5,
        },
        average_tasks_per_theme: 3,
        archived_tasks_count: 1,
        validated_tasks_count: 8,
        is_blocked: false,
        is_email_verified: true,
        blocked_since: null,
        verified_since: timestamp,
    },
};
