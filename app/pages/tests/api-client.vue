<script setup lang="ts">
import type { ApiRawMeta, ApiValidationErrors } from '~/types/api';
import type { Pagination } from '~/types/pagination';
import { onMounted, ref } from 'vue';
import { useApiFetch } from '~/composables/useApiFetch';
import { getFieldErrors, isApiClientError, splitApiMeta } from '~/utils/apiEnvelope';
import { useAuthState } from '~/domains/auth/composables/useAuthState';
import { HttpMethods } from '~/utils/httpMethods';

type SuccessPayload = {
    title: string;
    count: number;
};

const { forbidden } = useAuthState();
const isMounted = ref(false);

const successMessageCode = ref<string | null>(null);
const successPayload = ref<SuccessPayload | null>(null);
const successPagination = ref<Pagination | null>(null);
const successMetaExtras = ref<ApiRawMeta>({});
const successError = ref<string | null>(null);

const validationMessageCode = ref<string | null>(null);
const validationFieldErrors = ref<ApiValidationErrors | null>(null);
const validationRequestId = ref<string | null>(null);
const validationError = ref<string | null>(null);

const permissionMessageCode = ref<string | null>(null);
const permissionRequestId = ref<string | null>(null);
const permissionError = ref<string | null>(null);

const deleteCompleted = ref(false);
const deleteWasNoContent = ref(false);
const deleteError = ref<string | null>(null);

onMounted(() => {
    isMounted.value = true;
});

const resetSuccess = () => {
    successMessageCode.value = null;
    successPayload.value = null;
    successPagination.value = null;
    successMetaExtras.value = {};
    successError.value = null;
};

const resetValidation = () => {
    validationMessageCode.value = null;
    validationFieldErrors.value = null;
    validationRequestId.value = null;
    validationError.value = null;
};

const resetPermission = () => {
    permissionMessageCode.value = null;
    permissionRequestId.value = null;
    permissionError.value = null;
};

const resetDelete = () => {
    deleteCompleted.value = false;
    deleteWasNoContent.value = false;
    deleteError.value = null;
};

const loadSuccess = async () => {
    resetSuccess();

    try {
        const response = await useApiFetch<SuccessPayload>('/api/tests/api-client/success', {
            method: HttpMethods.GET,
            redirectOn401: false,
        });

        if (!response) {
            return;
        }

        const { pagination, metaExtras } = splitApiMeta(response.meta);

        successMessageCode.value = response.message_code;
        successPayload.value = response.data;
        successPagination.value = pagination;
        successMetaExtras.value = metaExtras;
    } catch (error: unknown) {
        successError.value = error instanceof Error ? error.message : 'Unknown success error';
    }
};

const loadValidationError = async () => {
    resetValidation();

    try {
        await useApiFetch('/api/tests/api-client/validation', {
            method: HttpMethods.POST,
            body: JSON.stringify({ title: '', color: '' }),
            redirectOn401: false,
        });
    } catch (error: unknown) {
        if (!isApiClientError(error)) {
            validationError.value =
                error instanceof Error ? error.message : 'Unknown validation error';
            return;
        }

        validationMessageCode.value = error.messageCode;
        validationFieldErrors.value = getFieldErrors(error);
        validationRequestId.value = error.requestId;
        validationError.value = error.message;
    }
};

const loadPermissionError = async () => {
    resetPermission();

    try {
        await useApiFetch('/api/tests/api-client/permission', {
            method: HttpMethods.GET,
            redirectOn401: false,
        });
    } catch (error: unknown) {
        if (!isApiClientError(error)) {
            permissionError.value =
                error instanceof Error ? error.message : 'Unknown permission error';
            return;
        }

        permissionMessageCode.value = error.messageCode;
        permissionRequestId.value = error.requestId;
        permissionError.value = error.message;
    }
};

const sendDelete = async () => {
    resetDelete();

    try {
        const response = await useApiFetch('/api/tests/api-client/delete', {
            method: HttpMethods.DELETE,
            redirectOn401: false,
        });

        deleteCompleted.value = true;
        deleteWasNoContent.value = response === null;
    } catch (error: unknown) {
        deleteError.value = error instanceof Error ? error.message : 'Unknown delete error';
    }
};
</script>

<template>
    <div class="min-h-screen px-6 py-10">
        <div class="mx-auto max-w-4xl space-y-8">
            <div>
                <h1 class="text-3xl font-bold">API Client Foundation Harness</h1>
                <p class="mt-2 text-sm opacity-80">
                    Internal page used to validate the shared frontend API foundation.
                </p>
                <p class="mt-2 text-xs opacity-60" data-testid="api-client-mounted">
                    {{ isMounted }}
                </p>
            </div>

            <section class="rounded-xl border p-6 space-y-4">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-semibold">Success envelope</h2>
                        <p class="text-sm opacity-80">
                            Reads canonical data, message code, pagination, and meta extras.
                        </p>
                    </div>
                    <button
                        class="rounded bg-sky-600 px-4 py-2 text-white"
                        data-testid="api-client-success-button"
                        type="button"
                        @click="loadSuccess"
                    >
                        Load success
                    </button>
                </div>
                <dl class="grid gap-3 md:grid-cols-2">
                    <div>
                        <dt class="text-sm opacity-70">Message code</dt>
                        <dd data-testid="api-client-success-message-code">
                            {{ successMessageCode ?? '—' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-70">Title</dt>
                        <dd data-testid="api-client-success-title">
                            {{ successPayload?.title ?? '—' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-70">Count</dt>
                        <dd data-testid="api-client-success-count">
                            {{ successPayload?.count ?? '—' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-70">Has next</dt>
                        <dd data-testid="api-client-success-has-next">
                            {{ successPagination?.has_next ?? '—' }}
                        </dd>
                    </div>
                </dl>
                <pre
                    class="overflow-auto rounded bg-black/10 p-4 text-xs"
                    data-testid="api-client-success-meta-extras"
                    >{{ JSON.stringify(successMetaExtras, null, 2) }}</pre
                >
                <p class="text-sm text-rose-600" data-testid="api-client-success-error">
                    {{ successError ?? '—' }}
                </p>
            </section>

            <section class="rounded-xl border p-6 space-y-4">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-semibold">Validation error</h2>
                        <p class="text-sm opacity-80">
                            Surfaces validation field errors from the backend envelope.
                        </p>
                    </div>
                    <button
                        class="rounded bg-amber-600 px-4 py-2 text-white"
                        data-testid="api-client-validation-button"
                        type="button"
                        @click="loadValidationError"
                    >
                        Trigger validation
                    </button>
                </div>
                <dl class="grid gap-3 md:grid-cols-2">
                    <div>
                        <dt class="text-sm opacity-70">Message code</dt>
                        <dd data-testid="api-client-validation-message-code">
                            {{ validationMessageCode ?? '—' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-70">Request ID</dt>
                        <dd data-testid="api-client-validation-request-id">
                            {{ validationRequestId ?? '—' }}
                        </dd>
                    </div>
                </dl>
                <pre
                    class="overflow-auto rounded bg-black/10 p-4 text-xs"
                    data-testid="api-client-validation-errors"
                    >{{ JSON.stringify(validationFieldErrors, null, 2) }}</pre
                >
                <p class="text-sm text-rose-600" data-testid="api-client-validation-error">
                    {{ validationError ?? '—' }}
                </p>
            </section>

            <section class="rounded-xl border p-6 space-y-4">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-semibold">Permission error</h2>
                        <p class="text-sm opacity-80">
                            Surfaces request id and forbidden state on 403 responses.
                        </p>
                    </div>
                    <button
                        class="rounded bg-rose-600 px-4 py-2 text-white"
                        data-testid="api-client-permission-button"
                        type="button"
                        @click="loadPermissionError"
                    >
                        Trigger permission
                    </button>
                </div>
                <dl class="grid gap-3 md:grid-cols-3">
                    <div>
                        <dt class="text-sm opacity-70">Message code</dt>
                        <dd data-testid="api-client-permission-message-code">
                            {{ permissionMessageCode ?? '—' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-70">Request ID</dt>
                        <dd data-testid="api-client-permission-request-id">
                            {{ permissionRequestId ?? '—' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-70">Forbidden state</dt>
                        <dd data-testid="api-client-permission-forbidden">
                            {{ forbidden }}
                        </dd>
                    </div>
                </dl>
                <p class="text-sm text-rose-600" data-testid="api-client-permission-error">
                    {{ permissionError ?? '—' }}
                </p>
            </section>

            <section class="rounded-xl border p-6 space-y-4">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-semibold">204 delete</h2>
                        <p class="text-sm opacity-80">
                            Confirms the shared client does not parse JSON on empty responses.
                        </p>
                    </div>
                    <button
                        class="rounded bg-emerald-600 px-4 py-2 text-white"
                        data-testid="api-client-delete-button"
                        type="button"
                        @click="sendDelete"
                    >
                        Send delete
                    </button>
                </div>
                <dl class="grid gap-3 md:grid-cols-2">
                    <div>
                        <dt class="text-sm opacity-70">Completed</dt>
                        <dd data-testid="api-client-delete-completed">
                            {{ deleteCompleted }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-70">Returned null</dt>
                        <dd data-testid="api-client-delete-null">
                            {{ deleteWasNoContent }}
                        </dd>
                    </div>
                </dl>
                <p class="text-sm text-rose-600" data-testid="api-client-delete-error">
                    {{ deleteError ?? '—' }}
                </p>
            </section>
        </div>
    </div>
</template>
