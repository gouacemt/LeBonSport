export const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'] as const

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const MOMENTS = [
  { key: 'matin', label: 'Matin' },
  { key: 'apres_midi', label: 'Après-midi' },
  { key: 'soir', label: 'Soir' },
]

export const AVAILABILITY_SLOTS = JOURS.flatMap((jour) =>
  MOMENTS.map((moment) => ({
    key: `${jour.toLowerCase()}_${moment.key}`,
    label: `${jour} ${moment.label.toLowerCase()}`,
  }))
)

// Utilisé uniquement si la table `sports` Supabase n'a pas encore été peuplée.
export const FALLBACK_SPORTS = [
  { id: -1, nom: 'Football', emoji: '⚽' },
  { id: -2, nom: 'Basketball', emoji: '🏀' },
  { id: -3, nom: 'Tennis', emoji: '🎾' },
  { id: -4, nom: 'Padel', emoji: '🎾' },
  { id: -5, nom: 'Running', emoji: '🏃' },
  { id: -6, nom: 'Volleyball', emoji: '🏐' },
  { id: -7, nom: 'Natation', emoji: '🏊' },
  { id: -8, nom: 'Cyclisme', emoji: '🚴' },
]
