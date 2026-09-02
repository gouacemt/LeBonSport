/** Validation et normalisation du formulaire de création d'annonce (logique pure, testable). */

export type AnnonceFormInput = {
  type: string | null
  sport: string
  titre: string
  description: string
  ville: string
  places?: string
}

export type AnnonceFormResult =
  | { valid: true; errors: Record<string, never> }
  | { valid: false; errors: Partial<Record<'type' | 'sport' | 'titre' | 'description' | 'ville' | 'places', string>> }

const TITRE_MIN = 5
const DESC_MIN = 20

export function validateAnnonceForm(input: AnnonceFormInput): AnnonceFormResult {
  const errors: Record<string, string> = {}

  if (!input.type) errors.type = 'Choisissez un type d’annonce.'
  if (!input.sport) errors.sport = 'Choisissez un sport.'
  if (!input.titre.trim()) errors.titre = 'Le titre est obligatoire.'
  else if (input.titre.trim().length < TITRE_MIN) errors.titre = `Le titre doit faire au moins ${TITRE_MIN} caractères.`
  if (!input.description.trim()) errors.description = 'La description est obligatoire.'
  else if (input.description.trim().length < DESC_MIN)
    errors.description = `Décrivez un peu plus (au moins ${DESC_MIN} caractères).`
  if (!input.ville.trim()) errors.ville = 'Indiquez une ville.'

  if (input.places != null && input.places.trim() !== '') {
    const n = Number(input.places)
    if (!Number.isInteger(n) || n <= 0) errors.places = 'Le nombre de places doit être un entier positif.'
  }

  const valid = Object.keys(errors).length === 0
  return valid ? { valid: true, errors: {} } : { valid: false, errors }
}

/** "3" -> 3 ; "" / "abc" / "-1" -> null */
export function parsePlaces(raw: string | undefined | null): number | null {
  if (raw == null || raw.trim() === '') return null
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}
