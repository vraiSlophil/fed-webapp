export const requireEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
};

export const getPlaywrightE2eEnv = () => {
    return {
        adminEmail: requireEnv('PLAYWRIGHT_ADMIN_EMAIL'),
        password: process.env.PLAYWRIGHT_E2E_PASSWORD ?? 'password',
        userEmail: requireEnv('PLAYWRIGHT_USER_EMAIL'),
    };
};
