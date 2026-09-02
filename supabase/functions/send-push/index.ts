// Edge Function : envoie une notification push Expo aux appareils d'un utilisateur.
//
// Deux modes d'appel :
//   1. Database Webhook sur INSERT de `notifications`  -> body = { type, record: {...} }
//   2. Appel direct                                     -> body = { user_id, title, body, data }
//
// Déploiement :
//   supabase functions deploy send-push --no-verify-jwt
// Puis créer un Database Webhook (Dashboard > Database > Webhooks) :
//   table public.notifications, event INSERT, type "Supabase Edge Functions",
//   fonction "send-push".

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record ?? payload
    const userId: string | undefined = record.user_id
    const title: string = record.title ?? 'LeBonSport'
    const body: string | null = record.body ?? null
    const data = record.data ?? {}

    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id manquant' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      title,
      body: body ?? '',
      data,
      sound: 'default',
    }))

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    })
    const result = await res.json()

    return new Response(JSON.stringify({ sent: messages.length, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
