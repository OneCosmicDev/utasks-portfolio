# UTasks — Gestion de tâches et messagerie

J’ai développé UTasks dans le cadre du cours GLO-3102 à l’Université Laval. Je suis parti d’une interface de gestion de tâches pour construire une application avec son propre backend, une authentification et une messagerie en temps réel.

**Université Laval · GLO-3102 · Automne 2025**

**Début documenté : 3 novembre 2025** — [repères chronologiques](PROVENANCE.md#repères-chronologiques)

**Technologies : React · TypeScript · Express · MongoDB · Socket.io**

## Ce que fait le projet

UTasks permet d’organiser le travail en tableaux, listes et cartes. Les cartes peuvent être créées, modifiées et déplacées par glisser-déposer, avec des priorités et des échéances. L’application ajoute à cette organisation une gestion des comptes et un chat entre utilisateurs, avec conservation des messages. Le frontend est développé en React et TypeScript ; le backend Express utilise MongoDB pour la persistance et Socket.io pour les échanges en temps réel.

## Ma contribution

J’ai développé les principales parties de l’application au fil des deux livrables.

- J’ai construit les interfaces de gestion des tableaux, listes et cartes, puis intégré le glisser-déposer et les formulaires de modification.
- J’ai créé le backend Express/MongoDB avec ses routes, ses contrôleurs et ses modèles de données.
- J’ai intégré l’authentification JWT et les vérifications d’accès aux tableaux.
- J’ai développé le chat Socket.io, la persistance des messages et les composants de conversation, puis adapté leur disposition aux écrans mobiles.
- J’ai documenté la configuration et le démarrage du frontend et du backend.

Je détaille les fichiers et les références de mon travail dans [CONTRIBUTIONS.md](CONTRIBUTIONS.md).

## Ce que j’ai appris

J’ai appris à faire fonctionner ensemble une interface, une API et une base de données. Les tableaux, listes et cartes m’ont amené à réfléchir aux relations entre les ressources et aux conséquences d’une modification ou d’une suppression sur leurs éléments associés.

La messagerie m’a permis de travailler au-delà du modèle classique requête-réponse : connexion des utilisateurs, événements Socket.io, messages persistés et mise à jour de l’interface. J’ai aussi renforcé ma compréhension de la circulation des JWT et de la différence entre un état de connexion affiché par le frontend et les accès réellement contrôlés par le backend.

## Cadre pédagogique

J’ai réalisé ce travail à partir des consignes et des ressources du cours GLO-3102. Pour le premier livrable, j’ai utilisé l’API fournie par le cours ; pour le second, j’ai développé le backend présent dans ce dépôt.

Mes contributions apparaissent sous les noms JuanAstroDev, The_OnlyJuanDev et [OneCosmicDev](https://github.com/OneCosmicDev), qui correspondent à mon compte GitHub.

## Lancer le projet

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

Pour un démarrage local, je configure mon propre `JWT_SECRET` dans le fichier `.env`. Le code contient encore une valeur de secours et un mode de connexion hérité du premier livrable ; ces mécanismes doivent être revus avant un hébergement public.

## État du projet

Le backend et le frontend compilent. La compilation du frontend signale encore un avertissement de syntaxe CSS. Les parcours complets avec MongoDB et les échanges Socket.io restent à vérifier dans cette version publique.
