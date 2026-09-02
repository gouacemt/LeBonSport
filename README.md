# LeBonSport

Application mobile & web qui met en relation les sportifs, les équipes et les clubs :
publier une annonce, trouver un partenaire ou une équipe, échanger par messagerie,
se retrouver sur le terrain.

> Projet Expo (React Native + expo-router) adossé à Supabase (Postgres + Auth + Storage + Realtime).

---

## Stack

| Domaine        | Choix                                                            |
| -------------- | --------------------------------------------------------------- |
| Front          | React Native 0.81 / React 19, Expo SDK 54, expo-router 6        |
| Langage        | TypeScript (strict), typed routes, React Compiler activé       |
| Back-end       | Supabase — Postgres, Auth (email + OAuth), Storage, Realtime   |
| État / données | Hooks maison (`hooks/`) au-dessus du client `@supabase/supabase-js` |
| Tests          | Jest (`jest-expo`), logique pure isolée dans `utils/` / `services/` |
| CI             | GitHub Actions — lint + typecheck + tests (`.github/workflows/ci.yml`) |

---

## Prérequis

- Node 20+
- Un projet Supabase (URL + clé anon)
- Expo Go (test rapide) ou un development build

## Configuration

Créer un fichier `.env` à la racine :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=eyJhbGciOi...            # clé "anon" publique
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...              # optionnel (OAuth Google iOS)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...          # optionnel (OAuth Google Android)
```

## Installation & lancement

```bash
npm install
npm start           # Expo Dev Server (Expo Go)
npm run web         # version web
npm run ios         # build natif iOS (nécessite Xcode)
npm run android     # build natif Android (nécessite Android SDK)
```

## Base de données

Les migrations SQL versionnées sont dans [`supabase/migrations/`](supabase/migrations).
Les appliquer dans l'ordre via le SQL editor Supabase ou la CLI :

```bash
supabase db push
```

Schéma détaillé (tables, relations, RLS, fonctions) : [`docs/DATABASE.md`](docs/DATABASE.md).

## Scripts

| Commande            | Effet                                  |
| ------------------- | -------------------------------------- |
| `npm start`         | Dev server Expo                        |
| `npm run web`       | Dev server web                         |
| `npm run lint`      | ESLint (config `eslint-config-expo`)   |
| `npm test`          | Jest (watch off avec `--ci`)           |
| `npx tsc --noEmit`  | Vérification de types                  |

## Structure

```
app/                 écrans (expo-router, file-based)
  (auth)/            login, register, mot de passe oublié, type de profil
  (onboarding)/      choix des sports
  (tabs)/            accueil, explore, map, créer annonce, mes annonces, messages, profil
  (profile)/         édition profil, favoris, notifications, aide, confidentialité
  annonce/[id]       détail d'une annonce
  messages/[id]      fil de conversation
components/          UI partagée (components/ui/) + Header, AccountMenu, ErrorBoundary
hooks/               accès données + logique d'écran (un hook par domaine)
services/            client Supabase + services d'auth (+ tests)
utils/               logique pure réutilisable et testée (format, validation, grouping…)
constants/           design tokens (couleurs, spacing, radius), icônes de sport
context/             ThemeContext
supabase/migrations/ schéma SQL versionné
docs/                architecture & schéma BDD
```

## Tests

La logique métier testable est extraite dans `utils/` et `services/` pour être
couverte sans rendre de composants :

- `services/authService` — validation email/mot de passe, inscription/connexion
- `utils/format` — dates relatives
- `utils/messageGroups` — regroupement des messages + séparateurs de date
- `utils/annonce` — validation du formulaire d'annonce

```bash
npm test
```

## Déploiement

- **Mobile** : `eas build` (config dans [`eas.json`](eas.json)), puis soumission stores / distribution interne.
- **Web** : `npx expo export --platform web` → dossier `dist/` à héberger (Vercel, Netlify, …).

---

## Feuille de route

Voir [`docs/ROADMAP.md`](docs/ROADMAP.md) pour l'état des fonctionnalités
(faites / en cours / à faire) et les points identifiés pour la soutenance.
