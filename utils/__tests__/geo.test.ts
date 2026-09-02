import { formatDistance, hasCoords, haversineKm } from '../geo'

describe('haversineKm', () => {
  test('distance nulle pour le même point', () => {
    expect(haversineKm({ lat: 45.75, lng: 4.85 }, { lat: 45.75, lng: 4.85 })).toBeCloseTo(0, 5)
  })

  test('Lyon <-> Villeurbanne ~4-6 km', () => {
    const d = haversineKm({ lat: 45.7578, lng: 4.832 }, { lat: 45.7719, lng: 4.8902 })
    expect(d).toBeGreaterThan(3)
    expect(d).toBeLessThan(7)
  })

  test('Lyon <-> Paris ~390-400 km', () => {
    const d = haversineKm({ lat: 45.764, lng: 4.8357 }, { lat: 48.8566, lng: 2.3522 })
    expect(d).toBeGreaterThan(385)
    expect(d).toBeLessThan(405)
  })

  test('symétrique', () => {
    const a = { lat: 43.6, lng: 1.44 }
    const b = { lat: 44.84, lng: -0.58 }
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6)
  })
})

describe('formatDistance', () => {
  test('mètres sous 1 km', () => {
    expect(formatDistance(0.42)).toBe('420 m')
  })
  test('1 décimale sous 10 km, virgule française', () => {
    expect(formatDistance(4.23)).toBe('4,2 km')
  })
  test('arrondi au km au-delà de 10', () => {
    expect(formatDistance(37.4)).toBe('37 km')
  })
  test('vide si invalide', () => {
    expect(formatDistance(NaN)).toBe('')
    expect(formatDistance(-3)).toBe('')
  })
})

describe('hasCoords', () => {
  test('true si lat/lng numériques', () => {
    expect(hasCoords({ lat: 1, lng: 2 })).toBe(true)
  })
  test('false sinon', () => {
    expect(hasCoords(null)).toBe(false)
    expect(hasCoords({})).toBe(false)
    expect(hasCoords({ lat: 1 })).toBe(false)
    expect(hasCoords({ lat: NaN, lng: 2 })).toBe(false)
  })
})
