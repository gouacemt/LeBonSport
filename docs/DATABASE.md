# Schéma de base de données

Postgres géré par Supabase. Toutes les tables applicatives ont la **Row Level
Security (RLS)** activée ; les policies sont définies dans les migrations
[`supabase/migrations/`](../supabase/migrations).

## Diagramme entité-relation

```mermaid
erDiagram
    auth_users ||--|| profiles : "1-1"
    auth_users ||--o{ annonces : publie
    auth_users ||--o{ favoris : ajoute
    auth_users ||--o{ user_sports : pratique
    auth_users ||--o{ messages : envoie
    auth_users ||--|| notification_settings : possede
    sports ||--o{ user_sports : "référencé par"
    annonces ||--o{ favoris : "mis en favori"
    annonces ||--o{ conversations : "sujet de"
    conversations ||--o{ messages : contient

    profiles {
        uuid id PK "= auth.users.id"
        text nom
        text prenom
        text avatar_url
        text bio
        text niveau "Débutant|Intermédiaire|Avancé|Expert"
        jsonb disponibilites "défaut []"
        text_array gallery_urls "défaut {}"
        bool is_sportif
        bool is_coach
        bool is_club
    }

    sports {
        uuid id PK
        text nom
    }

    user_sports {
        uuid user_id FK
        uuid sport_id FK
        %% UNIQUE (user_id, sport_id)
    }

    annonces {
        uuid id PK
        timestamptz created_at
        uuid user_id FK "auth.users"
        text type "club_recrute|equipe_joueurs|cherche_club|cherche_equipe|partie_ouverte"
        text sport
        text niveau
        text titre
        text description
        text ville
        text club "nullable"
        int places "nullable"
        text telephone "nullable"
        text_array photos "défaut {}"
        timestamptz date_evenement "nullable"
    }

    favoris {
        uuid user_id FK
        uuid annonce_id FK
        timestamptz created_at
        %% PK (user_id, annonce_id)
    }

    conversations {
        uuid id PK
        uuid annonce_id FK
        uuid user_a FK "user_a < user_b"
        uuid user_b FK
        timestamptz last_message_at
        text last_message_preview
        timestamptz user_a_last_read_at
        timestamptz user_b_last_read_at
        timestamptz created_at
        %% UNIQUE (annonce_id, user_a, user_b)
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK "auth.users"
        text content "non vide"
        timestamptz created_at
    }

    notification_settings {
        uuid user_id PK
        bool messages
        bool seances
        bool candidatures
    }
```

## Règles d'accès (résumé)

| Table                   | Lecture                                   | Écriture                                        |
| ----------------------- | ---------------------------------------- | ---------------------------------------------- |
| `profiles`              | (selon migration socle)                  | soi-même                                       |
| `annonces`              | publique                                 | `insert` authentifié, `update`/`delete` = auteur (`user_id`) |
| `favoris`               | soi-même                                 | soi-même                                       |
| `conversations`         | participant (`user_a` ou `user_b`)       | `insert` participant ; pas d'`update` direct   |
| `messages`              | participant de la conversation            | `insert` si `sender_id = auth.uid()` et participant |
| `notification_settings` | soi-même                                 | soi-même                                       |
| storage bucket `media`  | publique en lecture                       | écriture/màj/suppression = propriétaire du dossier |

## Fonctions & triggers

| Objet                                   | Rôle                                                                 |
| --------------------------------------- | ------------------------------------------------------------------- |
| `bump_conversation_last_message()` (trigger `after insert on messages`) | met à jour `last_message_at` / `last_message_preview` et cale le `last_read_at` de l'expéditeur |
| `mark_conversations_read()` (RPC)       | marque **toutes** les conversations de l'utilisateur courant comme lues |
| `mark_conversation_read(conv_id uuid)` (RPC) | marque **une** conversation comme lue (utilisé à l'ouverture du fil) |

## Realtime

Publication `supabase_realtime` : tables `conversations` et `messages`
(pour la messagerie temps réel et le badge de messages non lus).

## Migrations

| Fichier                              | Contenu                                                            |
| ------------------------------------ | ---------------------------------------------------------------- |
| `0001_phase1_socle.sql`              | colonnes profil (niveau, dispos, galerie), `annonces` (photos, date), `favoris`, bucket `media` + policies storage |
| `0002_messagerie.sql`                | `conversations`, `messages`, RLS, trigger de bump, publication realtime |
| `0003_lecture_messages.sql`          | colonnes `*_last_read_at`, `mark_conversations_read()`             |
| `0004_lecture_conversation.sql`      | `mark_conversation_read(conv_id)`                                 |
| `0005_candidatures.sql`              | `candidatures`, `notifications`, triggers de notification, `mark_notifications_read()`, realtime |
| `0006_suppression_compte.sql`        | `annonces.user_id` en `on delete cascade`, RPC `delete_user()` (RGPD) |
| `0007_moderation.sql`                | `signalements`, `blocks` + RLS                                    |
| `0008_profil_public_avis.sql`        | `avis` (note 1-5) + RLS (insert réservé aux membres déjà en conversation) |
