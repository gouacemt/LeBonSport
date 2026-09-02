import { supabase } from '@/services/supabase'
import { useCallback, useEffect, useState } from 'react'

export type CandidatureStatut = 'en_attente' | 'acceptee' | 'refusee' | 'retiree'

export type Candidature = {
  id: string
  annonce_id: string
  candidat_id: string
  message: string | null
  statut: CandidatureStatut
  created_at: string
  updated_at: string
}

/** Côté candidat : ma candidature à une annonce + actions postuler / retirer. */
export function useCandidature(annonceId: string | undefined, enabled = true) {
  const [mine, setMine] = useState<Candidature | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!annonceId || !enabled) {
      setLoading(false)
      return
    }
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('candidatures')
      .select('*')
      .eq('annonce_id', annonceId)
      .eq('candidat_id', user.id)
      .maybeSingle()
    setMine((data as Candidature) ?? null)
    setLoading(false)
  }, [annonceId, enabled])

  useEffect(() => {
    load()
  }, [load])

  const postuler = async (message: string) => {
    if (!annonceId) return false
    setError(null)
    setSubmitting(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      setError('Utilisateur non connecté')
      setSubmitting(false)
      return false
    }

    // Re-postuler après un retrait : on repasse la ligne en attente.
    const payload = {
      annonce_id: annonceId,
      candidat_id: user.id,
      message: message.trim() || null,
      statut: 'en_attente' as const,
    }
    const { data, error: upsertError } = await supabase
      .from('candidatures')
      .upsert(payload, { onConflict: 'annonce_id,candidat_id' })
      .select('*')
      .single()

    setSubmitting(false)
    if (upsertError) {
      setError(upsertError.message)
      return false
    }
    setMine(data as Candidature)
    return true
  }

  const retirer = async () => {
    if (!mine) return false
    setSubmitting(true)
    const { error: updateError } = await supabase
      .from('candidatures')
      .update({ statut: 'retiree' })
      .eq('id', mine.id)
    setSubmitting(false)
    if (updateError) {
      setError(updateError.message)
      return false
    }
    setMine({ ...mine, statut: 'retiree' })
    return true
  }

  return { mine, loading, submitting, error, postuler, retirer, reload: load }
}
