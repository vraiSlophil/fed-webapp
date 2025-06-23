// SQL

// CREATE TABLE `users` (
//     `id` varbinary(16) NOT NULL,
//     `username` varchar(50) NOT NULL,
//     `email` varchar(255) NOT NULL,
//     `avatar_path` varchar(255) DEFAULT NULL,
//     `last_name` varchar(255) DEFAULT NULL,
//     `first_name` varchar(255) DEFAULT NULL,
//     `last_login_at` timestamp NULL DEFAULT NULL,
//     `last_login_ip` varchar(45) DEFAULT NULL,
//     `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
//     `role_power` smallint(6) NOT NULL DEFAULT 10,
//     `created_at` timestamp NULL DEFAULT NULL,
//     `updated_at` timestamp NULL DEFAULT NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


export type User = {
    id: string; // uuid
    username: string; // varchar(50)
    email: string; // varchar(255)
    avatar_path?: string | null; // varchar(255) DEFAULT NULL
    last_name?: string | null; // varchar(255) DEFAULT NULL
    first_name?: string | null; // varchar(255) DEFAULT NULL
    last_login_at?: Date | null; // timestamp NULL DEFAULT NULL
    last_login_ip?: string | null; // varchar(45) DEFAULT NULL
    settings?: Record<string, any> | null; // longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`))
    role_power: number; // smallint(6) NOT NULL DEFAULT 10
    created_at?: Date | null; // timestamp NULL DEFAULT NULL
    updated_at?: Date | null; // timestamp NULL DEFAULT NULL

}