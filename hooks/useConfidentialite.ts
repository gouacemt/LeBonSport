import {useState} from 'react'
import {supabase} from '@/services/supabase'

export function useConfidentialite() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Suppresson du compte
  const deleteAccount = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.rpc('delete_user')

    if (error) {
      setError('Impossible de supprimer le compte. Contacte le support.')
      setLoading(false)
      return false
    }

    // Déconnecte l'utilisateur après la suppression du compte
    await supabase.auth.signOut()

    setLoading(false)
    return true
  }

  return {
    loading,
    error,
    deleteAccount,
  }
}