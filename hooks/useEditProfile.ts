import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

type ProfileForm = {
  nom:       string
  prenom:    string
  bio:       string
  age:       string
}

export function useEditProfile() {
  const [form, setForm]       = useState<ProfileForm>({nom: '', prenom: '', bio: '', age: ''})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

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

    const {data, error} = await supabase.from('profiles').select('nom, prenom, bio, age').eq('id', user.id).single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    if (data !== null) {
      // Pré-remplit le formulaire avec les données existantes
      setForm({
        nom:    data.nom    !== null ? data.nom    : '',
        prenom: data.prenom !== null ? data.prenom : '',
        bio:    data.bio    !== null ? data.bio    : '',
        age:    data.age    !== null ? data.age.toString() : '',
      })
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
  }
}