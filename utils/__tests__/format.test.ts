import { timeAgo } from '../format'

describe('timeAgo', () => {
  const now = Date.now()
  const ago = (ms: number) => new Date(now - ms).toISOString()

  test('chaîne vide pour null / undefined / invalide', () => {
    expect(timeAgo(null)).toBe('')
    expect(timeAgo(undefined)).toBe('')
    expect(timeAgo('pas une date')).toBe('')
  })

  test('« à l\'instant » pour moins d\'une minute', () => {
    expect(timeAgo(ago(10 * 1000))).toBe("à l'instant")
  })

  test('minutes', () => {
    expect(timeAgo(ago(5 * 60 * 1000))).toBe('il y a 5 min')
  })

  test('heures', () => {
    expect(timeAgo(ago(3 * 3600 * 1000))).toBe('il y a 3 h')
  })

  test('hier puis jours', () => {
    expect(timeAgo(ago(26 * 3600 * 1000))).toBe('hier')
    expect(timeAgo(ago(4 * 86400 * 1000))).toBe('il y a 4 jours')
  })

  test('semaines', () => {
    expect(timeAgo(ago(14 * 86400 * 1000))).toBe('il y a 2 sem.')
  })

  test('date absolue au-delà d\'un mois', () => {
    const out = timeAgo(ago(60 * 86400 * 1000))
    expect(out).toMatch(/\d{4}/) // contient une année
  })
})
