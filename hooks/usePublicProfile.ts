import { supabase } from '@/services/supabase'
import { useCallback, useEffect, useState } from 'react'

export type PublicProfile = {
  id: string
  prenom: string | null
  nom: string | null
  avatar_url: string | null
  bio: string | null
  niveau: string | null
  is_sportif: boolean | null
  is_coach: boolean | null
  is_club: boolean | null
  created_at: string | null
}

export type Avis = {
  id: string
  auteur_id: string
  cible_id: string
  note: number
  commentaire: string | null
  created_at: string
  auteur?: { prenom: string | null; nom: string | null; avatar_url: string | null } | null
}

export function usePublicProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [sports, setSports] = useState<string[]>([])
  const [annoncesCount, setAnnoncesCount] = useState(0)
  const [avis, setAvis] = useState<Avis[]>([])
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [canReview, setCanReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    const { data: userData } = await supabase.auth.getUser()
    const me = userData.user?.id ?? null
    setMyUserId(me)

    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('id, prenom, nom, avatar_url, bio, niveau, is_sportif, is_coach, is_club, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (profErr || !prof) {
      setError('Profil introuvable')
      setLoading(false)
      return
    }
    setProfile(prof as PublicProfile)

    const [{ data: us }, { count }, { data: avisRows }] = await Promise.all([
      supabase.from('user_sports').select('sports(nom)').eq('user_id', userId),
      supabase.from('annonces').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase
        .from('avis')
        .select('*')
        .eq('cible_id', userId)
        .order('created_at', { ascending: false }),
    ])

    setSports(
      (us ?? [])
        .map((r: any) => (Array.isArray(r.sports) ? r.sports[0]?.nom : r.sports?.nom))
        .filter(Boolean),
    )
    setAnnoncesCount(count ?? 0)

    const rows = (avisRows ?? []) as Avis[]
    const auteurIds = Array.from(new Set(rows.map((r) => r.auteur_id)))
    if (auteurIds.length > 0) {
      const { data: auteurs } = await supabase
        .from('profiles')
        .select('id, prenom, nom, avatar_url')
        .in('id', auteurIds)
      const byId = new Map((auteurs ?? []).map((a: any) => [a.id, a]))
      setAvis(rows.map((r) => ({ ...r, auteur: byId.get(r.auteur_id) ?? null })))
    } else {
      setAvis(rows)
    }

    if (me && me !== userId) {
      const { count: convCount } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .or(`and(user_a.eq.${me},user_b.eq.${userId}),and(user_a.eq.${userId},user_b.eq.${me})`)
      setCanReview((convCount ?? 0) > 0)
    } else {
      setCanReview(false)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const myAvis = avis.find((a) => a.auteur_id === myUserId) ?? null
  const average = avis.length > 0 ? avis.reduce((s, a) => s + a.note, 0) / avis.length : null

  const submitAvis = async (note: number, commentaire: string) => {
    if (!userId || !myUserId) return false
    setSubmitting(true)
    const { error: upErr } = await supabase.from('avis').upsert(
      { auteur_id: myUserId, cible_id: userId, note, commentaire: commentaire.trim() || null },
      { onConflict: 'auteur_id,cible_id' },
    )
    setSubmitting(false)
    if (upErr) {
      setError(upErr.message)
      return false
    }
    await load()
    return true
  }

  return {
    profile,
    sports,
    annoncesCount,
    avis,
    average,
    myAvis,
    canReview,
    isMe: myUserId === userId,
    loading,
    error,
    submitting,
    submitAvis,
    reload: load,
  }
}
