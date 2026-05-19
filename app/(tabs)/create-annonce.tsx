import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'

// ─── Constantes ────────────────────────────────────────────────────────────────

const GREEN = '#22A96A'
const GREEN_LIGHT = '#F0FBF5'
const BORDER = '#E8E8E8'
const TEXT = '#1A1A1A'
const TEXT_MUTED = '#9CA3AF'
const BG = '#F5F5F5'

const TYPES = [
  { id: 'club_recrute',     emoji: '🏛️', label: 'Je suis un club qui recrute' },
  { id: 'equipe_joueurs',   emoji: '👥', label: 'Notre équipe cherche des joueurs' },
  { id: 'cherche_club',     emoji: '🔍', label: 'Je cherche un club' },
  { id: 'cherche_equipe',   emoji: '🤝', label: 'Je cherche une équipe' },
  { id: 'partie_ouverte',   emoji: '⚡', label: 'Je propose une partie ouverte' },
]

const SPORTS = [
  'Football', 'Padel', 'Tennis', 'Basketball', 'Volleyball',
  'Rugby', 'Handball', 'Natation', 'Cyclisme', 'Running',
  'Badminton', 'Squash', 'Boxe', 'Judo', 'Autre',
]

const NIVEAUX = [
  'Tous niveaux acceptés', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert',
]

// ─── Dropdown simple ───────────────────────────────────────────────────────────

function Dropdown({
  label, placeholder, options, value, onChange,
}: {
  label: string
  placeholder: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value || placeholder}
        </Text>
        <Text style={{ color: TEXT_MUTED }}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.dropdownItem,
                value === opt && styles.dropdownItemActive,
              ]}
              onPress={() => { onChange(opt); setOpen(false) }}
            >
              <Text style={[
                styles.dropdownItemText,
                value === opt && { color: GREEN, fontWeight: '600' },
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Écran principal ───────────────────────────────────────────────────────────

export default function CreateAnnonce() {
  const [type, setType]           = useState<string | null>(null)
  const [sport, setSport]         = useState('')
  const [niveau, setNiveau]       = useState('')
  const [titre, setTitre]         = useState('')
  const [description, setDesc]    = useState('')
  const [ville, setVille]         = useState('')
  const [club, setClub]           = useState('')
  const [places, setPlaces]       = useState('')
  const [telephone, setTelephone] = useState('')

  const canSubmit = type && sport && titre && description && ville

  const handleSubmit = () => {
    if (!canSubmit) return
    // TODO: envoyer à Supabase
    console.log({ type, sport, niveau, titre, description, ville, club, places, telephone })
    router.back()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Créer une annonce</Text>

          {/* ── Type d'annonce ── */}
          <Text style={styles.sectionLabel}>Type Aannonce <Text style={{ color: GREEN }}>*</Text></Text>
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
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )
          })}

          {/* ── Formulaire (visible après sélection) ── */}
          {type && (
            <View style={styles.form}>

              {/* Sport + Niveau */}
              <View style={styles.row}>
                <Dropdown
                  label="Sport *"
                  placeholder="Sélectionner"
                  options={SPORTS}
                  value={sport}
                  onChange={setSport}
                />
                <View style={{ width: 12 }} />
                <Dropdown
                  label="Niveau requis"
                  placeholder="Tous niveaux"
                  options={NIVEAUX}
                  value={niveau}
                  onChange={setNiveau}
                />
              </View>

              {/* Titre */}
              <Text style={styles.label}>Titre Annonce <Text style={{ color: GREEN }}>*</Text></Text>
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
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Lyon"
                    placeholderTextColor={TEXT_MUTED}
                    value={ville}
                    onChangeText={setVille}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nom du club</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: FC Lyon"
                    placeholderTextColor={TEXT_MUTED}
                    value={club}
                    onChangeText={setClub}
                  />
                </View>
              </View>

              {/* Places */}
              <Text style={styles.label}>Places disponibles</Text>
              <TextInput
                style={[styles.input, { width: '48%' }]}
                placeholder="Ex: 2"
                placeholderTextColor={TEXT_MUTED}
                value={places}
                onChangeText={setPlaces}
                keyboardType="numeric"
              />

              {/* Téléphone */}
              <Text style={styles.label}>Téléphone de contact (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 06 12 34 56 78"
                placeholderTextColor={TEXT_MUTED}
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
              />

              {/* Image */}
              <Text style={styles.label}>Image (optionnel)</Text>
              <TouchableOpacity style={styles.imagePicker} activeOpacity={0.7}>
                <Text style={styles.imageIcon}>↑</Text>
                <Text style={styles.imageText}>Cliquez pour ajouter une image</Text>
              </TouchableOpacity>

              {/* Bouton publier */}
              <TouchableOpacity
                style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                activeOpacity={canSubmit ? 0.85 : 1}
              >
                <Text style={styles.submitText}>Publier Annonce</Text>
              </TouchableOpacity>

            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backArrow: {
    fontSize: 20,
    color: TEXT,
  },
  backText: {
    fontSize: 15,
    color: TEXT_MUTED,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 10,
  },

  // ── Type cards ──
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  typeCardSelected: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },
  typeEmoji: {
    fontSize: 22,
  },
  typeLabel: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },
  checkmark: {
    fontSize: 18,
    color: GREEN,
    fontWeight: '700',
  },

  // ── Form ──
  form: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT,
    marginBottom: 4,
  },
  textarea: {
    height: 110,
    paddingTop: 12,
  },

  // ── Dropdown ──
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dropdownValue: {
    fontSize: 15,
    color: TEXT,
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: TEXT_MUTED,
    flex: 1,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    marginTop: -2,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemActive: {
    backgroundColor: GREEN_LIGHT,
  },
  dropdownItemText: {
    fontSize: 14,
    color: TEXT,
  },

  // ── Image picker ──
  imagePicker: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  imageIcon: {
    fontSize: 28,
    color: TEXT_MUTED,
  },
  imageText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },

  // ── Submit ──
  submitBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    backgroundColor: '#F5A5A0',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
