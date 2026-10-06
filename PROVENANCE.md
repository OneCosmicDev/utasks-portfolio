# Provenance

- Dépôt pédagogique d’origine : `GLO3102/utasks-a2025-utasks-a2025-team-63`.
- Révision source : `c16cdad68b27e7774ba369ef4f459ad395a13ee7`.
- Copie portfolio préparée le 6 octobre 2026 à la demande de Juan José Castilla Manrique.
- Les anciens noms Git JuanAstroDev et The_OnlyJuanDev correspondent au compte OneCosmicDev.

## Attribution

Les [contributions et crédits](CONTRIBUTIONS.md) décrivent le périmètre de Juan, les membres identifiés et le matériel fourni. L’auteur du commit initial de cette copie est responsable de sa préparation ; il ne revendique pas l’écriture de l’ensemble du code. Les auteurs du travail source conservent leurs crédits.

## Adaptations pour la publication

L’historique privé n’a pas été importé. Les configurations locales d’IDE, remises et documents d’évaluation, archives binaires et anciens workflows de déploiement ne sont pas publiés. Les notices de licence et les mentions d’auteur des sources conservées sont maintenues. Les exemples de configuration n’incluent pas d’identifiants de services réels.

Cette copie n’ajoute pas de licence de réutilisation au travail collectif ni au matériel pédagogique fourni.

## Points d’entrée dans le code

- [backend/src/socket/chatSocket.ts](backend/src/socket/chatSocket.ts)
- [backend/src/controllers/boardController.ts](backend/src/controllers/boardController.ts)
- [frontend/src/components/chat/Chat.tsx](frontend/src/components/chat/Chat.tsx)


## Corrections de préparation

Les lockfiles npm manquants ont été générés. Deux hooks Mongoose de suppression ont été adaptés à l’API asynchrone de Mongoose 9 (fin par résolution de la promesse). Dans le formulaire de connexion React, la valeur utilisateur validée est capturée avant les callbacks différés afin de préserver le typage TypeScript. Ces adaptations de publication sont distinctes des contributions scolaires historiques.
