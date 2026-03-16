import { expect, test } from '@playwright/test';
import {
    activeTask,
    defaultPlayground,
    inProgressTask,
    playgroundTheme,
    themeStats,
} from '../../fixtures/app';
import { jsonResponse, successResponse, type MockApiHandler } from '../../helpers/api';
import { loginThroughUi } from '../../helpers/auth';

const buildPlaygroundThemeResponse = () => {
    return jsonResponse({
        status: 200,
        success: true,
        data: {
            themes: [{ ...playgroundTheme }],
            pagination: {
                total: 1,
                per_page: 20,
                current_page: 1,
                last_page: 1,
                from: 1,
                to: 1,
            },
        },
    });
};

test('creates, updates, completes, and deletes tasks from the opened theme', async ({ page }) => {
    const tasks = [{ ...activeTask }, { ...inProgressTask }];
    let createdTaskTitle = '';

    const handlers: MockApiHandler[] = [
        {
            method: 'GET',
            pathname: '/api/playgrounds',
            handle: (route) => {
                return route.fulfill(successResponse({ playgrounds: [defaultPlayground] }));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${defaultPlayground.playground_id}`,
            handle: (route) => {
                return route.fulfill(successResponse({ playground: defaultPlayground }));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${defaultPlayground.playground_id}/themes`,
            handle: (route) => {
                return route.fulfill(buildPlaygroundThemeResponse());
            },
        },
        {
            method: 'GET',
            pathname: `/api/themes/${playgroundTheme.theme_id}/stats`,
            handle: (route) => {
                return route.fulfill(successResponse({ ...themeStats }));
            },
        },
        {
            method: 'GET',
            pathname: '/api/tasks',
            handle: (route, _request, url) => {
                const search = url.searchParams.get('search') ?? '';
                const filteredTasks = search
                    ? tasks.filter((task) => {
                          return task.title.toLowerCase().includes(search.toLowerCase());
                      })
                    : tasks;

                return route.fulfill(
                    successResponse({
                        pagination: {
                            total: filteredTasks.length,
                            per_page: 15,
                            current_page: 1,
                            last_page: 1,
                            from: filteredTasks.length ? 1 : null,
                            to: filteredTasks.length || null,
                        },
                        tasks: filteredTasks,
                    }),
                );
            },
        },
        {
            method: 'POST',
            pathname: '/api/tasks',
            handle: (route, request) => {
                const payload = request.postDataJSON() as Record<string, string>;
                createdTaskTitle = payload.title;

                tasks.unshift({
                    ...activeTask,
                    task_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
                    title: payload.title,
                });

                return route.fulfill(
                    successResponse({
                        task: tasks[0],
                    }),
                );
            },
        },
        {
            method: 'PATCH',
            pathname: `/api/tasks/${activeTask.task_id}`,
            handle: (route, request) => {
                const payload = request.postDataJSON() as Record<string, string>;
                tasks[1] = {
                    ...tasks[1]!,
                    ...payload,
                };

                return route.fulfill(
                    successResponse({
                        task: tasks[1],
                    }),
                );
            },
        },
        {
            method: 'POST',
            pathname: `/api/tasks/${activeTask.task_id}/complete`,
            handle: (route) => {
                tasks[1] = {
                    ...tasks[1]!,
                    validated_at: '2026-01-12T10:00:00.000Z',
                };

                return route.fulfill(
                    successResponse({
                        task: tasks[1],
                    }),
                );
            },
        },
        {
            method: 'DELETE',
            pathname: `/api/tasks/${activeTask.task_id}`,
            handle: (route) => {
                tasks.splice(
                    tasks.findIndex((task) => {
                        return task.task_id === activeTask.task_id;
                    }),
                    1,
                );

                return route.fulfill({
                    body: '',
                    status: 204,
                });
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/playground');

    await page.getByTestId(`themes-theme-open-${playgroundTheme.theme_id}`).click();
    await expect(page.getByTestId(`tasks-list-item-${activeTask.task_id}`)).toBeVisible();

    await page.getByTestId('tasks-list-search').fill('Playwright');
    await expect(page.getByTestId(`tasks-list-item-${activeTask.task_id}`)).toBeVisible();

    await page.getByTestId('tasks-list-create-input').fill('Document Playwright migration');
    await page.getByTestId('tasks-list-create-submit').click();
    await expect(page.getByText('Document Playwright migration')).toBeVisible();
    await expect
        .poll(() => {
            return createdTaskTitle;
        })
        .toBe('Document Playwright migration');

    await page.getByTestId(`tasks-list-edit-${activeTask.task_id}`).click();
    await page
        .getByTestId(`tasks-list-edit-input-${activeTask.task_id}`)
        .fill('Refine Playwright migration');
    await page.getByTestId(`tasks-list-edit-confirm-${activeTask.task_id}`).click();
    await expect(
        page.getByText('Le titre de la tâche a été mis à jour avec succès.'),
    ).toBeVisible();
    await expect(page.getByText('Refine Playwright migration')).toBeVisible();

    await page.getByTestId(`tasks-list-toggle-complete-${activeTask.task_id}`).click();
    await expect(page.getByTestId(`tasks-list-title-${activeTask.task_id}`)).toHaveClass(
        /line-through/,
    );

    await page.getByTestId(`tasks-list-delete-${activeTask.task_id}`).click();
    await page.getByTestId(`tasks-list-delete-confirm-${activeTask.task_id}`).click();
    await expect(page.getByText('La tâche a été supprimée avec succès.')).toBeVisible();
});
