// services/__mocks__/supabase.ts
export const supabase = {
  auth: {
    signUp:                jest.fn(),
    signInWithPassword:    jest.fn(),
    signInWithIdToken:     jest.fn(),
    resetPasswordForEmail: jest.fn(),
    signOut:               jest.fn(),
    getUser:               jest.fn(),
    updateUser:            jest.fn(),
    onAuthStateChange:     jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
  },
  from: jest.fn(() => ({
    select:  jest.fn().mockReturnThis(),
    insert:  jest.fn().mockReturnThis(),
    update:  jest.fn().mockReturnThis(),
    upsert:  jest.fn().mockReturnThis(),
    delete:  jest.fn().mockReturnThis(),
    eq:      jest.fn().mockReturnThis(),
    single:  jest.fn(),
  })),
}