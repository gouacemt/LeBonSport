import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/hooks/useAuth'

const { width } = Dimensions.get('window')
const isWeb = Platform.OS === 'web'

const GREEN       = '#16A06A'
const GREEN_LIGHT = '#F0FBF5'
const GREEN_BORDER= '#16A06A'
const BORDER      = '#E5E7EB'
const TEXT        = '#111827'
const TEXT_MUTED  = '#9CA3AF'
const TEXT_SUB    = '#6B7280'
const BG          = '#F3F4F6'
const WHITE       = '#FFFFFF'

const TYPES = [
  { id: 'club_recrute',   emoji: '🏛️', label: 'Je suis un club qui recrute' },
  { id: 'equipe_joueurs', emoji: '👥', label: 'Notre équipe cherche des joueurs' },
  { id: 'cherche_club',   emoji: '🔍', label: 'Je cherche un club' },
  { id: 'cherche_equipe', emoji: '🤝', label: 'Je cherche une équipe' },
  { id: 'partie_ouverte', emoji: '⚡', label: 'Je propose une partie ouverte' },
]

const SPORTS = [
  'Football','Padel','Tennis','Basketball','Running',
  'Volleyball','Natation','Cyclisme','Badminton','Squash',
  'Rugby','Handball','Boxe','Judo','Autre',
]

const NIVEAUX = [
  'Tous niveaux acceptés','Débutant','Intermédiaire','Avancé','Expert',
]

function Dropdown({ label, placeholder, options, value, onChange }: {
  label: string; placeholder: string; options: string[]
  value: string; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.dropdown, open && styles.dropdownOpen]} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={{ color: TEXT_MUTED, fontSize: 12 }}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                onPress={() => { onChange(opt); setOpen(false) }}
              >
                <Text style={[styles.dropdownItemText, value === opt && { color: GREEN, fontWeight: '600' }]}>
                  {opt}
                </Text>
                {value === opt && <Text style={{ color: GREEN, fontSize: 13 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

export default function CreerAnnonce() {
  const { session } = useAuth()
  const [type, setType]           = useState<string | null>(null)
  const [sport, setSport]         = useState('')
  const [niveau, setNiveau]       = useState('Tous niveaux acceptés')
  const [titre, setTitre]         = useState('')
  const [description, setDesc]    = useState('')
  const [ville, setVille]         = useState('')
  const [club, setClub]           = useState('')
  const [places, setPlaces]       = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading]     = useState(false)

  const canSubmit = type && sport && titre.trim() && description.trim() && ville.trim()

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    const { error } = await supabase.from('annonces').insert({
      type, sport, niveau, titre, description, ville,
      club: club || null,
      places: places ? parseInt(places) : null,
      telephone: telephone || null,
    })
    setLoading(false)
    if (error) { console.error(error); return }
    router.push('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Retour aux annonces</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card principale */}
          <View style={styles.card}>
            <Text style={styles.title}>Créer une annonce</Text>

            {/* Type d'annonce */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Type d'annonce <Text style={{ color: GREEN }}>*</Text>
              </Text>
              {TYPES.map((t) => {
                const selected = type === t.id
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeCard, selected && styles.typeCardSelected]}
                    onPress={() => setType(t.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.typeEmoji}>{t.emoji}</Text>
                    <Text style={[styles.typeLabel, selected && { color: GREEN, fontWeight: '600' }]}>
                      {t.label}
                    </Text>
                    {selected && (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Formulaire */}
            {type && (
              <View style={styles.form}>

                {/* Sport + Niveau */}
                <View style={styles.row}>
                  <Dropdown label="Sport *" placeholder="Sélectionner" options={SPORTS} value={sport} onChange={setSport} />
                  <View style={{ width: 16 }} />
                  <Dropdown label="Niveau requis" placeholder="Tous niveaux" options={NIVEAUX} value={niveau} onChange={setNiveau} />
                </View>

                {/* Titre */}
                <Text style={styles.label}>Titre de l'annonce <Text style={{ color: GREEN }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Cherche gardien pour équipe de foot du dimanche"
                  placeholderTextColor={TEXT_MUTED}
                  value={titre}
                  onChangeText={setTitre}
                />

                {/* Description */}
                <Text style={styles.label}>Description <Text style={{ color: GREEN }}>*</Text></Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Décrivez votre annonce en détail..."
                  placeholderTextColor={TEXT_MUTED}
                  value={description}
                  onChangeText={setDesc}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                {/* Ville + Club */}
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Ville <Text style={{ color: GREEN }}>*</Text></Text>
                    <TextInput style={styles.input} placeholder="Ex: Lyon" placeholderTextColor={TEXT_MUTED} value={ville} onChangeText={setVille} />
                  </View>
                  <View style={{ width: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Nom du club</Text>
                    <TextInput style={styles.input} placeholder="Ex: FC Lyon" placeholderTextColor={TEXT_MUTED} value={club} onChangeText={setClub} />
                  </View>
                </View>

                {/* Places */}
                <Text style={styles.label}>Places disponibles</Text>
                <TextInput
                  style={[styles.input, { maxWidth: isWeb ? 200 : '50%' }]}
                  placeholder="Ex: 2"
                  placeholderTextColor={TEXT_MUTED}
                  value={places}
                  onChangeText={setPlaces}
                  keyboardType="numeric"
                />

                {/* Téléphone */}
                <Text style={styles.label}>Téléphone de contact <Text style={{ color: TEXT_MUTED, fontWeight: '400' }}>(optionnel)</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 06 12 34 56 78"
                  placeholderTextColor={TEXT_MUTED}
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                />

                {/* Image */}
                <Text style={styles.label}>Image <Text style={{ color: TEXT_MUTED, fontWeight: '400' }}>(optionnel)</Text></Text>
                <TouchableOpacity style={styles.imagePicker} activeOpacity={0.7}>
                  <Text style={styles.imageIcon}>↑</Text>
                  <Text style={styles.imageText}>Cliquez pour ajouter une image</Text>
                </TouchableOpacity>

                {/* Bouton publier */}
                <TouchableOpacity
                  style={[styles.submitBtn, (!canSubmit || loading) && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  activeOpacity={canSubmit ? 0.85 : 1}
                >
                  <Text style={styles.submitText}>
                    {loading ? 'Publication...' : 'Publier l\'annonce'}
                  </Text>
                </TouchableOpacity>

              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  topBar: {
    paddingHorizontal: 24, paddingVertical: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow:{ fontSize: 18, color: TEXT_SUB },
  backText: { fontSize: 14, color: TEXT_SUB },

  scroll:        { flex: 1 },
  scrollContent: {
    padding: isWeb ? 32 : 16,
    paddingBottom: 60,
    alignItems: isWeb ? 'center' : 'stretch',
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: isWeb ? 40 : 20,
    width: isWeb ? Math.min(700, width - 64) : '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  title: {
    fontSize: isWeb ? 28 : 24,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 28,
  },

  section:      { marginBottom: 8 },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: TEXT, marginBottom: 12 },

  // Type cards
  typeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 12, borderWidth: 1.5, borderColor: BORDER,
    padding: 16, marginBottom: 10, gap: 14,
  },
  typeCardSelected: { borderColor: GREEN_BORDER, backgroundColor: GREEN_LIGHT },
  typeEmoji:        { fontSize: 22 },
  typeLabel:        { flex: 1, fontSize: 15, color: TEXT },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
  },
  checkIcon: { color: WHITE, fontSize: 13, fontWeight: '700' },

  // Form
  form:  { marginTop: 24 },
  row:   { flexDirection: isWeb ? 'row' : 'column', marginBottom: 4, gap: isWeb ? 0 : 0 },
  label: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 6, marginTop: 14 },

  input: {
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: TEXT,
  },
  textarea: { height: 120, paddingTop: 12 },

  // Dropdown
  dropdown: {
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dropdownOpen:       { borderColor: GREEN },
  dropdownValue:      { fontSize: 15, color: TEXT, flex: 1 },
  dropdownPlaceholder:{ fontSize: 15, color: TEXT_MUTED, flex: 1 },
  dropdownList: {
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 10, marginTop: 4, marginBottom: 8,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    zIndex: 999,
  },
  dropdownItem:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemActive: { backgroundColor: GREEN_LIGHT },
  dropdownItemText:   { fontSize: 14, color: TEXT },

  // Image
  imagePicker: {
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER,
    borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 36, alignItems: 'center', gap: 8, marginBottom: 4,
  },
  imageIcon: { fontSize: 28, color: TEXT_MUTED },
  imageText: { fontSize: 14, color: TEXT_MUTED },

  // Submit
  submitBtn:         { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { backgroundColor: '#A7D9C3' },
  submitText:        { color: WHITE, fontSize: 16, fontWeight: '700' },
})
