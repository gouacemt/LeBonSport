import { supabase } from '@/services/supabase'
import { useCallback, useEffect, useState } from 'react'
import type { Candidature, CandidatureStatut } from './useCandidature'

export type CandidatureWithProfile = Candidature & {
  candidat: {
    id: string
    prenom: string | null
    nom: string | null
    avatar_url: string | null
    niveau: string | null
  } | null
}

/** Côté propriétaire d'annonce : liste des candidatures reçues + accepter / refuser. */
export function useAnnonceCandidatures(annonceId: string | undefined) {
  const [candidatures, setCandidatures] = useState<CandidatureWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!annonceId) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('candidatures')
      .select('*')
      .eq('annonce_id', annonceId)
      .neq('statut', 'retiree')
      .order('created_at', { ascending: false })

    const rows = (data ?? []) as Candidature[]
    const ids = Array.from(new Set(rows.map((r) => r.candidat_id)))
    const byId = new Map<string, CandidatureWithProfile['candidat']>()
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, prenom, nom, avatar_url, niveau')
        .in('id', ids)
      for (const p of (profiles ?? []) as NonNullable<CandidatureWithProfile['candidat']>[]) byId.set(p.id, p)
    }

    setCandidatures(rows.map((r) => ({ ...r, candidat: byId.get(r.candidat_id) ?? null })))
    setLoading(false)
  }, [annonceId])

  useEffect(() => {
    load()
  }, [load])

  const setStatut = async (id: string, statut: Extract<CandidatureStatut, 'acceptee' | 'refusee'>) => {
    setActingId(id)
    const { error } = await supabase.from('candidatures').update({ statut }).eq('id', id)
    setActingId(null)
    if (!error) {
      setCandidatures((prev) => prev.map((c) => (c.id === id ? { ...c, statut } : c)))

      // Trouve le candidat pour lui envoyer une notif
      const candidature = candidatures.find(function(c) { return c.id === id })

      if (candidature !== undefined) {
        const { data: settings } = await supabase.from('notification_settings').select('push_token, candidatures').eq('user_id', candidature.candidat_id).single()

        if (settings?.push_token && settings?.candidatures === true) {
          await supabase.functions.invoke('send-notification', {
            body: {
              token:   settings.push_token,
              titre:   statut === 'acceptee' ? 'Candidature acceptée ! 🎉' : 'Candidature refusée',
              message: statut === 'acceptee' ? 'Ta candidature a été acceptée ! Contacte l\'organisateur.' : 'Ta candidature n\'a pas été retenue cette fois.',
            }
          })
        }
      }
    }
    return !error
  }

  const pending = candidatures.filter((c) => c.statut === 'en_attente')

  return {
    candidatures,
    pending,
    pendingCount: pending.length,
    loading,
    actingId,
    accepter: (id: string) => setStatut(id, 'acceptee'),
    refuser: (id: string) => setStatut(id, 'refusee'),
    reload: load,
  }
}
