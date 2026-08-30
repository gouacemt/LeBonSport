import {validateEmail,validatePassword,signUpService,signInService,signOutService,resetPasswordService} from '../authService'
import { supabase } from '@/services/supabase'

// ─── validateEmail ──────────────────────────────────────────
describe('validateEmail', () => {

  test('retourne true pour un email valide', () => {
    expect(validateEmail('test@gmail.com')).toBe(true)
    expect(validateEmail('anthony@lebonsport.fr')).toBe(true)
    expect(validateEmail('user.name@domain.co')).toBe(true)
  })

  test('retourne false si pas de @', () => {
    expect(validateEmail('emailinvalide')).toBe(false)
  })

  test('retourne false si pas de domaine', () => {
    expect(validateEmail('email@')).toBe(false)
  })

  test('retourne false si pas d\'extension', () => {
    expect(validateEmail('email@gmail')).toBe(false)
  })

  test('retourne false si @ au début', () => {
    expect(validateEmail('@gmail.com')).toBe(false)
  })
})

// ─── validatePassword ───────────────────────────────────────
describe('validatePassword', () => {

  test('retourne true si mot de passe >= 6 caractères', () => {
    expect(validatePassword('password123')).toBe(true)
    expect(validatePassword('123456')).toBe(true)
    expect(validatePassword('abcdef')).toBe(true)
  })

  test('retourne false si mot de passe < 6 caractères', () => {
    expect(validatePassword('123')).toBe(false)
    expect(validatePassword('ab')).toBe(false)
  })

  test('retourne false si mot de passe vide', () => {
    expect(validatePassword('')).toBe(false)
  })
})

// ─── signUpService ──────────────────────────────────────────
describe('signUpService', () => {

  beforeEach(() => { jest.clearAllMocks() })

  test('retourne erreur si email invalide', async () => {
    const result = await signUpService('emailinvalide', 'password123', 'sportif')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Adresse email invalide')
  })

  test('retourne erreur si mot de passe trop court', async () => {
    const result = await signUpService('test@test.com', '123', 'sportif')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Le mot de passe doit contenir au moins 6 caractères')
  })

  test('retourne success si inscription réussie', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    })
    ;(supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null })
    })

    const result = await signUpService('test@test.com', 'password123', 'sportif')
    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
  })

  test('crée le profil avec is_sportif = true', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });(supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert })

    await signUpService('test@test.com', 'password123', 'sportif')

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        is_sportif: true,
        is_coach:   false,
        is_club:    false,
      })
    )
  })

  test('crée le profil avec is_coach = true', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    })
    ;(supabase.from as jest.Mock).mockReturnValue({ upsert: mockUpsert })

    await signUpService('test@test.com', 'password123', 'coach')

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        is_sportif: false,
        is_coach:   true,
        is_club:    false,
      })
    )
  })

  test('retourne erreur si Supabase échoue', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email déjà utilisé' },
    })

    const result = await signUpService('test@test.com', 'password123', 'sportif')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Email déjà utilisé')
  })
})

// ─── signInService ──────────────────────────────────────────
describe('signInService', () => {

  beforeEach(() => { jest.clearAllMocks() })

  test('retourne success si connexion réussie', async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    })

    const result = await signInService('test@test.com', 'password123')
    expect(result.success).toBe(true)
  })

  test('retourne erreur si mauvais mot de passe', async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    const result = await signInService('test@test.com', 'mauvaismdp')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid login credentials')
  })

  test('appelle supabase avec les bons paramètres', async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    })

    await signInService('test@test.com', 'password123')

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email:    'test@test.com',
      password: 'password123',
    })
  })
})

// ─── signOutService ─────────────────────────────────────────
describe('signOutService', () => {

  test('appelle supabase.auth.signOut', async () => {
    ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null })
    await signOutService()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  test('retourne success', async () => {
    ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null })
    const result = await signOutService()
    expect(result.success).toBe(true)
  })
})

// ─── resetPasswordService ───────────────────────────────────
describe('resetPasswordService', () => {

  beforeEach(() => { jest.clearAllMocks() })

  test('retourne success si email envoyé', async () => {
    ;(supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: null,
    })

    const result = await resetPasswordService('test@test.com')
    expect(result.success).toBe(true)
  })

  test('retourne erreur si utilisateur inexistant', async () => {
    ;(supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: { message: 'User not found' },
    })

    const result = await resetPasswordService('inexistant@test.com')
    expect(result.success).toBe(false)
    expect(result.error).toBe('User not found')
  })
})