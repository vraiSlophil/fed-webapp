# Tests E2E - Organisation

Cette documentation décrit l'organisation des tests end-to-end (E2E) de l'application.

## Structure

```
cypress/e2e/
├── admin/           # Tests de l'espace administrateur
├── auth/            # Tests d'authentification
├── playground/      # Tests des playgrounds et interactions
├── shared/          # Tests des composants et pages partagés
├── tasks/           # Tests de gestion des tâches
├── themes/          # Tests de gestion des thèmes
└── user/            # Tests de l'espace utilisateur
```

## Liste des tests par domaine

### 🔐 Authentification (`auth/`)

- **auth_login.cy.js** - Connexion utilisateur standard
  - Affichage du formulaire de connexion
  - Connexion réussie vers `/user`
  - Gestion des erreurs d'identifiants
  - Lien vers mot de passe oublié

- **auth_login_admin_access.cy.js** - Connexion administrateur
  - Connexion admin vers `/admin`
  - Refus d'accès non authentifié
  - Gestion des erreurs d'identifiants

- **auth_register.cy.js** - Inscription
  - Affichage du formulaire d'inscription
  - Création de compte réussie
  - Validation des champs

- **auth_password_reset.cy.js** - Réinitialisation de mot de passe
  - Demande de réinitialisation
  - Formulaire avec token valide
  - Gestion des tokens invalides

### 👤 Espace utilisateur (`user/`)

- **user_space.cy.js** - Accès à l'espace utilisateur
  - Redirection si non authentifié
  - Affichage de l'espace utilisateur

- **user_profile.cy.js** - Gestion du profil
  - Affichage des informations
  - Modification du profil
  - Changement de mot de passe

- **user_preferences.cy.js** - Préférences
  - Affichage et modification des préférences
  - Gestion des notifications

### 👑 Administration (`admin/`)

- **admin_dashboard.cy.js** - Tableau de bord
  - Contrôle d'accès
  - Affichage du dashboard admin

- **admin_users.cy.js** - Gestion des utilisateurs
  - Liste des utilisateurs
  - Modification des rôles
  - Activation/désactivation
  - Recherche d'utilisateurs

- **admin_stats.cy.js** - Statistiques
  - Affichage des statistiques globales
  - Graphiques

### 🎨 Thèmes (`themes/`)

- **theme_management.cy.js** - CRUD des thèmes
  - Liste des thèmes
  - Création de thème
  - Modification de thème
  - Suppression de thème

- **theme_members.cy.js** - Gestion des membres
  - Liste des membres d'un thème
  - Ajout de membre avec rôle
  - Modification des permissions
  - Contrôle d'accès aux permissions

- **theme_storage.cy.js** - Stockage et statistiques
  - Statistiques d'utilisation
  - Informations de stockage

### 🎮 Playground (`playground/`)

- **playground_navigation.cy.js** - Navigation
  - Liste des playgrounds
  - Accès à un playground spécifique

- **playground_crud.cy.js** - CRUD
  - Création de playground
  - Modification
  - Suppression
  - Gestion des erreurs 404

- **playground_interactions.cy.js** - Interactions drag & drop
  - Glisser-déposer de thèmes
  - Zones de drop

- **movable_themes.cy.js** - Thèmes déplaçables
  - Affichage des thèmes
  - Déplacement de thème
  - Persistance de la position

- **playground_menu.cy.js** - Menu du playground
  - Affichage du menu
  - Accès aux paramètres
  - Ajout de thème

### ✅ Tâches (`tasks/`)

- **task_management.cy.js** - Gestion des tâches
  - Liste des tâches
  - Ajout de tâche
  - Marquage comme terminée
  - Suppression de tâche

### 🌐 Composants partagés (`shared/`)

- **home_page.cy.js** - Page d'accueil
  - Affichage du contenu
  - Navigation vers login/register

- **navigation.cy.js** - Barre de navigation
  - Affichage de la navbar
  - Liens selon le rôle (user/admin)
  - Déconnexion

- **typewriter.cy.js** - Composant texte animé
  - Affichage du TypewriterText
  - Animation progressive

- **tests_pages.cy.js** - Pages de test internes
  - Page `/tests`
  - Page `/tests/themes`

## Configuration

La configuration Cypress se trouve dans `cypress.config.js` :

```javascript
baseUrl: "http://localhost:3000"
```

## Lancement des tests

### Mode interactif (développement)
```bash
npm run test:e2e
```

### Mode headless (CI/CD)
```bash
npm run test:e2e:headless
```

## Conventions de nommage

- **Fichiers** : `<feature>_<action>.cy.js` (snake_case)
- **Dossiers** : organisés par domaine métier
- **describe()** : `"<Domaine> - <Feature>"`
- **it()** : phrase complète décrivant le comportement attendu

## Sélecteurs

Les tests utilisent des sélecteurs simples :
- `cy.contains("Texte")` pour les textes visibles
- `cy.get('input[type="email"]')` pour les éléments de formulaire
- `cy.get('.class')` pour les classes CSS spécifiques

## Authentification

Les tests nécessitant une authentification utilisent ce pattern :

```javascript
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit("/login");
  cy.get('input[type="email"]').type("user@example.com");
  cy.get('input[type="password"]').type("password");
  cy.get('button[type="submit"]').click();
});
```

## Comptes de test

- **Admin** : `admin@example.com` / `password`
- **User** : `user@example.com` / `password`

## Notes

- Les tests sont isolés via `cy.clearCookies()` et `cy.clearLocalStorage()`
- Les textes exacts peuvent nécessiter des ajustements selon l'UI réelle
- Les sélecteurs CSS génériques (`.draggable`, `.dropzone`) doivent être adaptés à votre implémentation

