import { parsePlaces, validateAnnonceForm } from '../annonce'

const base = {
  type: 'cherche_equipe',
  sport: 'Football',
  titre: 'Cherche équipe de foot à 7',
  description: 'Milieu de terrain, niveau intermédiaire, dispo le week-end sur Lyon.',
  ville: 'Lyon',
}

describe('validateAnnonceForm', () => {
  test('formulaire complet -> valide', () => {
    expect(validateAnnonceForm(base).valid).toBe(true)
  })

  test('type manquant', () => {
    const r = validateAnnonceForm({ ...base, type: null })
    expect(r.valid).toBe(false)
    expect(r.valid === false && r.errors.type).toBeTruthy()
  })

  test('titre trop court', () => {
    const r = validateAnnonceForm({ ...base, titre: 'foot' })
    expect(r.valid).toBe(false)
    expect(r.valid === false && r.errors.titre).toBeTruthy()
  })

  test('description trop courte', () => {
    const r = validateAnnonceForm({ ...base, description: 'trop court' })
    expect(r.valid).toBe(false)
    expect(r.valid === false && r.errors.description).toBeTruthy()
  })

  test('ville vide (espaces)', () => {
    const r = validateAnnonceForm({ ...base, ville: '   ' })
    expect(r.valid).toBe(false)
  })

  test('places invalide', () => {
    expect(validateAnnonceForm({ ...base, places: '0' }).valid).toBe(false)
    expect(validateAnnonceForm({ ...base, places: '-3' }).valid).toBe(false)
    expect(validateAnnonceForm({ ...base, places: 'deux' }).valid).toBe(false)
  })

  test('places valide ou absente', () => {
    expect(validateAnnonceForm({ ...base, places: '4' }).valid).toBe(true)
    expect(validateAnnonceForm({ ...base, places: '' }).valid).toBe(true)
    expect(validateAnnonceForm(base).valid).toBe(true)
  })
})

describe('parsePlaces', () => {
  test('convertit un entier positif', () => {
    expect(parsePlaces('5')).toBe(5)
  })
  test('null pour vide / invalide / négatif', () => {
    expect(parsePlaces('')).toBeNull()
    expect(parsePlaces(null)).toBeNull()
    expect(parsePlaces('abc')).toBeNull()
    expect(parsePlaces('-2')).toBeNull()
    expect(parsePlaces('2.5')).toBeNull()
  })
})
