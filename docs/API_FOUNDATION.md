# API Foundation

This document describes the shared frontend API foundation introduced for issue `#23`.

It covers the canonical response envelope, shared error handling, pagination metadata, and the dedicated validation harness used by Playwright.

## Scope

This foundation is intentionally shared-layer only.

It does **not** migrate every domain consumer to the new contract yet.
Downstream domains can still contain legacy assumptions until their dedicated issues land.

## Canonical response envelope

The shared frontend layer now expects the backend canonical envelope:

```json
{
    "status": "success|error",
    "message": "Human readable message",
    "message_code": "machine.readable.code",
    "message_params": { "...": "..." },
    "data": { "...": "..." },
    "errors": { "field": ["..."] },
    "meta": { "...": "..." }
}
```

Main shared types now live in `app/types/api.d.ts`.

## `useApiFetch`

`useApiFetch` is the shared HTTP wrapper used by the app.

Current guarantees:

- always sends `Accept: application/json`
- injects `Authorization: Bearer <token>` when a token exists
- never sends cookies (`credentials: 'omit'`)
- returns the **full canonical envelope** on success
- returns `null` only for `204 No Content`
- throws a typed `ApiClientError` on failure

### Error behavior

`ApiClientError` exposes:

- `statusCode`
- `message`
- `messageCode`
- `messageParams`
- `errors`
- `fieldErrors`
- `meta`
- `requestId`
- `headers`

Shared guards:

- `isApiClientError(error)`
- `isValidationApiError(error)`
- `getFieldErrors(error)`

## Pagination and `metaExtras`

Pagination is no longer read from nested payload fields such as `data.pagination`.

The shared layer now reads pagination exclusively from the canonical `meta` fields:

- `current_page`
- `per_page`
- `total`
- `last_page`
- `from`
- `to`
- `has_next`

The helper `splitApiMeta(meta)` returns:

- `pagination`
- `metaExtras`

If one canonical pagination field is missing, `pagination` is treated as `null` and the full `meta` object is kept in `metaExtras`.

## Shared Playwright helpers

The shared Playwright API helpers now emit canonical backend-style payloads only.

Available helpers:

- `successEnvelope`
- `paginatedEnvelope`
- `errorEnvelope`
- `validationErrorEnvelope`
- `permissionDeniedEnvelope`
- `noContentResponse`

The route interception helper was also narrowed to real `/api` paths only, so test mocks do not accidentally intercept unrelated Vite or Nuxt assets.

## Validation harness

An internal harness page exists at `/tests/api-client`.

It is used to validate the shared API foundation without depending on a full domain flow.

Covered scenarios:

- canonical success envelope
- `validation.invalid`
- `permission.denied`
- `204 No Content`

The matching Playwright integration coverage lives in:

- `tests/integration/shared/api-envelope.spec.ts`
- `tests/integration/shared/api-client.spec.ts`

## Important limitations

- This foundation is intentionally breaking.
- No legacy compatibility layer is kept in the shared API helpers.
- Domain consumers still need to be migrated in their own issues.
- The current frontend auth domain still contains legacy endpoint assumptions outside this shared foundation scope.
