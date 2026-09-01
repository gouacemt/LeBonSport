import { supabase } from '@/services/supabase'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from 'react'

type ProfileForm = {
  nom:       string
  prenom:    string
  bio:       string
  age:       string
  type:      string
}

export function useEditProfile() {
  const [form, setForm]                       = useState<ProfileForm>({nom: '', prenom: '', bio: '', age: '', type: ''})
  const [loading, setLoading]                 = useState(true)
  const [saving, setSaving]                   = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl]             = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // ─── Charger le profil existant au démarrage ────────────────
  useEffect(() => {loadProfile()}, [])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)

    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return false
    }

    const {data, error} = await supabase.from('profiles').select('nom, prenom, bio, age, avatar_url, is_sportif, is_coach, is_club').eq('id', user.id).single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    const type_profil = data.is_sportif ? 'sportif' : data.is_coach ? 'coach' : data.is_club ? 'club' : ''

    if (data !== null) {
      // Pré-remplit le formulaire avec les données existantes
      setForm({
        nom:    data.nom    !== null ? data.nom    : '',
        prenom: data.prenom !== null ? data.prenom : '',
        bio:    data.bio    !== null ? data.bio    : '',
        age:    data.age    !== null ? data.age.toString() : '',
        type:   type_profil,
      })
      setAvatarUrl(data.avatar_url !== null ? data.avatar_url : null)
    }

    setLoading(false)
    return true
  }

  // ─── Modifier un champ du formulaire ────────────────────────
  const updateField = (champ: keyof ProfileForm, valeur: string) => {
    const nouveauForm = { ...form }
    nouveauForm[champ] = valeur
    setForm(nouveauForm)
  }

   // ─── Changer la photo de profil ─────────────────────────────
  const pickAndUploadAvatar = async () => {
    setError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('L\'accès à tes photos est nécessaire pour changer ta photo de profil')
      return false
    }

    const resultat = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (resultat.canceled || resultat.assets.length === 0) {
      return false
    }

    const image = resultat.assets[0]

    setUploadingAvatar(true)

    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      setUploadingAvatar(false)
      return false
    }

    const extension  = image.uri.split('.').pop()?.toLowerCase() || 'jpg'
    const contentType = image.mimeType !== undefined ? image.mimeType : `image/${extension}`
    const chemin = `${user.id}/avatar-${Date.now()}.${extension}`

    const fichier      = await fetch(image.uri)
    const arrayBuffer  = await fichier.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(chemin, arrayBuffer, { contentType, upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploadingAvatar(false)
      return false
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(chemin)
    const nouvelleUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: nouvelleUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setUploadingAvatar(false)
      return false
    }

    setAvatarUrl(nouvelleUrl)
    setUploadingAvatar(false)
    return true
  }

  // ─── Valider le formulaire ──────────────────────────────────
  const validerForm = () => {
    if (form.age !== '' && isNaN(Number(form.age))) {
      setError('L\'âge doit être un nombre')
      return false
    }
    if (form.age !== '' && Number(form.age) < 0) {
      setError('L\'âge doit être positif')
      return false
    }
    if (form.age !== '' && Number(form.age) > 120) {
      setError('L\'âge semble incorrect')
      return false
    }
    return true
  }

  // ─── Sauvegarder le profil ──────────────────────────────────
  const saveProfile = async () => {
    setError(null)

    // Validation avant envoi
    const valide = validerForm()
    if (!valide) return false

    setSaving(true)

    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      setSaving(false)
      return false
    }

    console.log('Sauvegarde pour user:', user.id)  // ← debug
    console.log('Données à sauvegarder:', form)     // ← debug

    const { error, data } = await supabase
      .from('profiles')
      .upsert({
        id:         user.id,
        nom:        form.nom    !== '' ? form.nom    : null,
        prenom:     form.prenom !== '' ? form.prenom : null,
        bio:        form.bio    !== '' ? form.bio    : null,
        age:        form.age    !== '' ? Number(form.age) : null,
        type:       form.type   !== '' ? form.type : null,
        updated_at: new Date().toISOString(),
      }).select()

console.log('Upsert résultat:', { error, data })

    if (error) {
      setError(error.message)
      setSaving(false)
      return false
    }

    console.log('Résultat:', { error, data })  // ← debug
    setSaving(false)
    return true
  }

  return {
    form,
    loading,
    saving,
    error,
    updateField,
    saveProfile,
    avatarUrl,
    uploadingAvatar,
    pickAndUploadAvatar
  }
}