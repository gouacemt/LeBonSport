# Notifications push

Chaîne : action → ligne dans `notifications` (déjà en place) → **Database Webhook**
→ Edge Function `send-push` → API push Expo → appareils.

## 1. Base de données

Appliquer `supabase/migrations/0011_push_tokens.sql` (table `push_tokens`).

## 2. Enregistrement du jeton (client)

`hooks/usePushRegistration.ts` est monté dans `app/(tabs)/_layout.tsx` :
au login sur un appareil physique, il demande la permission, récupère le
jeton Expo et l'`upsert` dans `push_tokens`. Nécessite un **development build**
(pas Expo Go pour iOS) et le `projectId` EAS (déjà dans `app.json`).

## 3. Edge Function

```bash
supabase functions deploy send-push --no-verify-jwt
```

Elle lit `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (injectés automatiquement
pour les fonctions du projet). Elle accepte le corps d'un webhook
(`{ record: { user_id, title, body, data } }`) ou un appel direct
(`{ user_id, title, body, data }`).

## 4. Database Webhook

Dashboard → Database → Webhooks → *Create* :

- Table : `public.notifications`
- Events : `INSERT`
- Type : *Supabase Edge Functions* → `send-push`

Chaque notification in-app déclenche alors un push vers les appareils du
destinataire.

## Test rapide

```bash
curl -X POST "https://<projet>.functions.supabase.co/send-push" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<uuid>","title":"Test","body":"Coucou"}'
```
