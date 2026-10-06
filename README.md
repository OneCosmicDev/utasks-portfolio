# utasks

Gestion de tâches par tableaux, listes et cartes, avec authentification et messagerie en temps réel.

**React · TypeScript · Express · MongoDB · Socket.io**

Copie portfolio d’un projet scolaire de Juan José Castilla Manrique ([OneCosmicDev](https://github.com/OneCosmicDev)). Les contributions de l’équipe et le matériel fourni par le cours sont crédités ci-dessous.

## Ma contribution — Juan José Castilla Manrique

Mon historique de commits retrace le développement du backend Express/MongoDB, de l'authentification et de la messagerie en temps réel, ainsi que leur intégration à l'interface React/TypeScript.

- **API et persistance** : création du backend Express/MongoDB et des opérations de gestion des tableaux, listes et cartes. [Commit fdfb508](https://github.com/GLO3102/utasks-a2025-utasks-a2025-team-63/commit/fdfb508).
- **Authentification et accès aux tableaux** : intégration des JWT et des vérifications d'accès dans le backend et le frontend. [Commit 10edfa3](https://github.com/GLO3102/utasks-a2025-utasks-a2025-team-63/commit/10edfa3).
- **Messagerie** : ajout du chat Socket.io, de la persistance des messages et des composants d'interface associés, puis amélioration de la gestion des conversations. [Commit 85a2698](https://github.com/GLO3102/utasks-a2025-utasks-a2025-team-63/commit/85a2698), [d0cb6a8](https://github.com/GLO3102/utasks-a2025-utasks-a2025-team-63/commit/d0cb6a8).
- **Affichage mobile** : adaptation de l'interface de messagerie aux petits écrans. [Commit c845a2d](https://github.com/GLO3102/utasks-a2025-utasks-a2025-team-63/commit/c845a2d).
- **Prise en main** : documentation du frontend, du backend et du chat, puis ajout d'un exemple de configuration d'environnement. [Commit 316688e](https://github.com/GLO3102/utasks-a2025-utasks-a2025-team-63/commit/316688e), [c16cdad](https://github.com/GLO3102/utasks-a2025-utasks-a2025-team-63/commit/c16cdad).

## Crédits et cadre pédagogique

[OneCosmicDev](https://github.com/OneCosmicDev) est le seul compte contributeur retourné par GitHub pour ce dépôt. Les anciens noms JuanAstroDev et The_OnlyJuanDev présents dans les commits correspondent à ce même compte. Ce constat porte sur l'historique enregistré et n'exclut pas une aide ou des contributions hors Git.

L'énoncé et l'API utilisée pour le premier livrable proviennent du cours GLO-3102. Le backend personnel présenté ici correspond au deuxième livrable. Ces ressources pédagogiques ne sont pas présentées comme mes créations.


Les références de PR et de commits pointent vers les dépôts pédagogiques d’origine, dont l’accès peut être restreint. La présente copie possède son propre historique de publication.

## Démarrer le projet

Prérequis : Node.js 22.19 ou supérieur, npm et MongoDB local.

Dans `backend/`, copier `env.example` vers `.env`, choisir une valeur personnelle pour `JWT_SECRET`, puis lancer :

```sh
npm ci
npm run dev
```

Dans un second terminal, depuis `frontend/` :

```sh
npm ci
npm run dev
```

L’API écoute par défaut sur `http://localhost:5000`. Vite affiche l’adresse de l’interface dans le terminal. `npm run build` compile chaque application depuis son propre dossier.

Le code conserve des conventions d’authentification du projet scolaire, dont une valeur JWT de secours pour le développement. Configurer un secret personnel et revoir les contrôles avant tout hébergement accessible à d’autres utilisateurs.

## État de cette publication

Cette version présente le travail scolaire et ses limites. Elle ne correspond pas à un service hébergé ni à un engagement de maintenance. Voir [PROVENANCE.md](PROVENANCE.md) pour la source, les adaptations de publication et les références vers le code.

## Vérifications du 6 octobre 2026

Compilations TypeScript du backend et du frontend, puis compilation Vite réussies. La minification CSS signale une accolade inattendue dans les styles existants. Les parcours avec MongoDB et les échanges Socket.io n’ont pas été exécutés.
