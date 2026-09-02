# Architecture

## Vue d'ensemble

```mermaid
flowchart TD
    subgraph Client["Client — Expo (iOS / Android / Web)"]
        UI["Écrans (app/, expo-router)"]
        Comp["Composants UI (components/)"]
        Hooks["Hooks de domaine (hooks/)"]
        Utils["Logique pure (utils/, services/)"]
        UI --> Comp
        UI --> Hooks
        Hooks --> Utils
    end

    subgraph Supabase
        Auth["Auth (JWT, email + OAuth)"]
        DB[("Postgres + RLS")]
        RT["Realtime (websocket)"]
        Store["Storage (bucket media)"]
        Fn["Edge Functions"]
    end

    Hooks -->|"@supabase/supabase-js"| Auth
    Hooks -->|"select / insert / rpc"| DB
    Hooks -->|"subscribe"| RT
    Comp -->|"upload / URL publique"| Store
    Hooks -.->|"appels privilégiés"| Fn
    Fn --> DB
    RT --- DB
```

## Principes

- **Un hook par domaine** (`useConversations`, `useFavoris`, `useAnnonceDetail`…).
  Les écrans ne parlent jamais directement à Supabase : ils consomment un hook.
- **RLS d'abord.** La sécurité vit dans Postgres (policies), pas dans le client.
  Les opérations qui doivent contourner RLS passent par une fonction
  `security definer` (RPC) ou une Edge Function.
- **Logique pure extraite.** Tout ce qui est testable sans rendu (validation,
  formatage, regroupement de messages) vit dans `utils/` et est couvert par Jest.
- **Temps réel opportuniste.** La messagerie s'abonne aux `postgres_changes` ;
  l'UI applique un rendu optimiste puis se réconcilie avec la ligne serveur.
- **Design tokens centralisés.** Couleurs / spacing / radius dans
  `constants/theme.ts`, consommés via `useTheme()`.

## Flux : envoi d'un message

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant S as Écran conversation
    participant H as useConversation
    participant DB as Supabase (messages)
    participant RT as Realtime

    U->>S: saisit + envoie
    S->>H: sendMessage(texte)
    H->>S: ajoute une bulle "pending" (optimiste)
    H->>DB: insert message
    alt succès
        DB-->>H: ligne créée
        H->>S: remplace la bulle par la ligne serveur
        DB-->>RT: postgres_changes (INSERT)
        RT-->>H: (dédupliqué par id)
    else échec
        DB-->>H: erreur
        H->>S: bulle "échec — toucher pour réessayer"
    end
```

## Conventions de code

- TypeScript strict, chemins alias `@/*`.
- Fichiers d'écran : un composant par défaut, styles en bas via `StyleSheet.create`.
- Pas de couleur en dur dans les écrans (utiliser `useTheme()`), sauf
  `ErrorBoundary` qui doit survivre à une panne du thème.
