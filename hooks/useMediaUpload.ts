import { supabase } from '@/services/supabase'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'

/**
 * Sélection + upload d'images vers le bucket public `media`.
 * Chemin : `<folder>/<uid>/<timestamp>-<rand>.<ext>` — le 2e segment doit être
 * l'uid pour satisfaire la policy `media_owner_write` (voir 0001_phase1_socle.sql).
 */
export function useMediaUpload(folder: string, max = 5) {
  const [urls, setUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickAndUpload = async () => {
    setError(null)

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError("L'accès à tes photos est nécessaire pour ajouter une image.")
      return
    }

    const remaining = max - urls.length
    if (remaining <= 0) {
      setError(`Maximum ${max} photos.`)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    })
    if (result.canceled || result.assets.length === 0) return

    setUploading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        setError('Utilisateur non connecté.')
        return
      }

      const uploaded: string[] = []
      for (const asset of result.assets.slice(0, remaining)) {
        const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase()
        const contentType = asset.mimeType ?? `image/${ext}`
        const path = `${folder}/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        const arrayBuffer = await (await fetch(asset.uri)).arrayBuffer()
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, arrayBuffer, { contentType, upsert: false })
        if (uploadError) {
          setError(uploadError.message)
          continue
        }
        uploaded.push(supabase.storage.from('media').getPublicUrl(path).data.publicUrl)
      }

      if (uploaded.length > 0) setUrls((prev) => [...prev, ...uploaded])
    } catch (e: any) {
      setError(e?.message ?? "Échec de l'upload.")
    } finally {
      setUploading(false)
    }
  }

  const removeUrl = (url: string) => setUrls((prev) => prev.filter((u) => u !== url))
  const reset = () => setUrls([])

  return { urls, uploading, error, pickAndUpload, removeUrl, reset, canAddMore: urls.length < max }
}
