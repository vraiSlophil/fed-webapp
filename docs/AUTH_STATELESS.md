# Auth stateless (Sanctum Bearer tokens)

Ce front utilise des Bearer tokens (Sanctum Personal Access Tokens) et **n'envoie aucun cookie**.

## Stockage du token

- Stockage **client-only** dans `localStorage`
- Cle: `auth-token`
- SSR safe: `loadFromStorage()` ne tourne que cote client

## useAuth (singleton)

Expose:

- state: `token`, `user`, `isAuthenticated`, `forbidden` (`isAuthenticated` est base sur la presence du token)
- actions: `login`, `logout`, `setToken`, `loadFromStorage`, `fetchUser`, `initAuth`

Comportement:

- `login()` => `POST /api/login` et met a jour `token` + `user`
- `logout()` => `POST /api/logout` puis purge l'etat local
- `initAuth()` => charge le token depuis le storage puis tente `fetchUser()`

## useApiFetch (wrapper central)

- Ajoute toujours `Accept: application/json`
- Injecte `Authorization: Bearer <token>` si un token existe
- N'envoie aucun cookie (`credentials: 'omit'`)
- Gestion des erreurs:
    - `401`: clear auth + redirect optionnel (par defaut `/login`, override via `redirectOn401`)
    - `403`: conserve le token et met `forbidden` a `true` pour la UI

## Usage

- Toutes les requetes API passent par `useApiFetch`
- Aucun appel a `/sanctum/csrf-cookie`
- Aucun `withCredentials` / `credentials: 'include'`
