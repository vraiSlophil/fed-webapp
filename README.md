# fed-webapp

Front-end d’une application web de gestion de tâches partagées.

## Prérequis

- Docker
- Docker Compose
- Avoir cloné et lancé l’API back-end : [fed-api](https://github.com/vraiSlophil/fed-api) (suivre son README)

## Configuration

Copiez le fichier `.env.example` en `.env` et adaptez les URLs si besoin :

```bash
cp .env.example .env
```

## Démarrage du projet

Lancez l’application en mode développement avec :

```bash
docker-compose up --build
```

L’application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Arrêt du projet

Pour arrêter les conteneurs :

```bash
docker-compose down
```

## Tests end-to-end (Cypress)

Depuis le conteneur déjà lancé (service `nuxt-app`) :

```bash
docker exec -it <nom_du_conteneur_nuxt_app> npm run test:e2e
# ou en headless
docker exec -it <nom_du_conteneur_nuxt_app> npm run test:e2e:headless
```

Remplacez `<nom_du_conteneur_nuxt_app>` par le nom effectif du conteneur (visible via `docker ps`).

## Conventions

- **Commits** : Utilisez le format [Conventional Commit](https://www.conventionalcommits.org/fr/v1.0.0/).
