import { supabase } from '@/services/supabase'
import { useState } from 'react'

/** Droits RGPD : export et suppression des données personnelles. */
export function useConfidentialite() {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteAccount = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.rpc('delete_user')
    if (error) {
      setError('Impossible de supprimer le compte. Réessaie plus tard ou contacte le support.')
      setLoading(false)
      return false
    }

    await supabase.auth.signOut()
    setLoading(false)
    return true
  }

  /** Rassemble toutes les données de l'utilisateur en un objet JSON. */
  const exportData = async (): Promise<string | null> => {
    setExporting(true)
    setError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        setError('Utilisateur non connecté')
        return null
      }

      const [profile, sports, annonces, favoris, candidatures, notifications, settings] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_sports').select('sport_id, sports(nom)').eq('user_id', user.id),
        supabase.from('annonces').select('*').eq('user_id', user.id),
        supabase.from('favoris').select('*').eq('user_id', user.id),
        supabase.from('candidatures').select('*').eq('candidat_id', user.id),
        supabase.from('notifications').select('*').eq('user_id', user.id),
        supabase.from('notification_settings').select('*').eq('user_id', user.id).maybeSingle(),
      ])

      const payload = {
        exported_at: new Date().toISOString(),
        compte: { id: user.id, email: user.email, cree_le: user.created_at },
        profil: profile.data ?? null,
        sports: sports.data ?? [],
        annonces: annonces.data ?? [],
        favoris: favoris.data ?? [],
        candidatures: candidatures.data ?? [],
        notifications: notifications.data ?? [],
        parametres_notifications: settings.data ?? null,
      }
      return JSON.stringify(payload, null, 2)
    } catch (e: any) {
      setError(e?.message ?? "Échec de l'export")
      return null
    } finally {
      setExporting(false)
    }
  }

  return { loading, exporting, error, deleteAccount, exportData }
}
