import { useState, useEffect} from 'react'
import {supabase } from '@/services/supabase'
import {Platform} from 'react-native'
import Purchases, {PurchasesPackage,CustomerInfo,LOG_LEVEL} from 'react-native-purchases'

type PlanType = 'mensuel' | 'annuel'

export function usePrenium() {
  const [isPremium, setIsPremium]   = useState(false)
  const [loading, setLoading]       = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [planChoisi, setPlanChoisi] = useState<PlanType>('mensuel')
  const [packages, setPackages] = useState<PurchasesPackage[]>([])

// ─── Configuration RevenueCat ───────────────────────────────
const configurerRevenueCat = async () => {
  if (Platform.OS === 'ios') {
    Purchases.configure({apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!})
  } else {
    Purchases.configure({apiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!})
  }
  Purchases.setLogLevel(LOG_LEVEL.DEBUG)
  await verifierPrenium()
  await chargerOffres()
}

// ─── Charger les offres ─────────────────────────────────────
const chargerOffres = async () => {
  try {
    const offres = await Purchases.getOfferings()
    if (offres.current !== null) {
      setPackages(offres.current.availablePackages)
    }
  } catch (e: any) {
    setError(e.message)
  }
}

  useEffect(function() { configurerRevenueCat() }, [])

  // ─── Vérifier si l'utilisateur est premium ──────────────────
  const verifierPrenium = async () => {
  setLoading(true)
  setError(null)

  try {
    // Vérifie via RevenueCat
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo()
    const premium = customerInfo.entitlements.active['premium'] !== undefined
    setIsPremium(premium)

    // Synchronise avec Supabase
    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user
    if (user !== null) {
      await supabase.from('profiles').update({ is_premium: premium }).eq('id', user.id)
    }

    setLoading(false)
    return premium

  } catch (e: any) {
    // Fallback sur Supabase si RevenueCat échoue
    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) { setLoading(false); return false }

    const { data, error } = await supabase.from('profiles').select('is_premium, premium_until').eq('id', user.id).single()

    if (error) { setError(error.message); setLoading(false); return false }

    if (data !== null) {
      if (data.is_premium && data.premium_until !== null) {
        const maintenant = new Date()
        const expiration = new Date(data.premium_until)
        if (maintenant > expiration) {
          await supabase.from('profiles').update({ is_premium: false }).eq('id', user.id)
          setIsPremium(false)
        } else {
          setIsPremium(true)
        }
      } else {
        setIsPremium(data.is_premium || false)
      }
    }

    setLoading(false)
    return true
  }
}

  // ─── Souscrire à un abonnement ──────────────────────────────
  const souscrire = async (plan: PlanType) => {
    setProcessing(true)
    setError(null)

    try {
      const packageChoisi = packages.find(function(p) {
        if (plan === 'mensuel') return p.packageType === 'MONTHLY'
        return p.packageType === 'ANNUAL'
      })

      if (packageChoisi === undefined) {
        setError('Offre non disponible')
        setProcessing(false)
        return false
      }

      const { customerInfo } = await Purchases.purchasePackage(packageChoisi)
      const premium = customerInfo.entitlements.active['premium'] !== undefined
      setIsPremium(premium)

      // Synchronise avec Supabase
      const reponse = await supabase.auth.getUser()
      const user = reponse.data.user
      if (user !== null) {
        await supabase.from('profiles').update({ is_premium: premium }).eq('id', user.id)
      }

      setProcessing(false)
      return true

    } catch (e: any) {
      if (e.code !== 'PURCHASE_CANCELLED_ERROR') {
        setError(e.message)
      }
      setProcessing(false)
      return false
    }
  }

  // ─── Annuler l'abonnement ───────────────────────────────────
  const annuler = async () => {
    setError('Pour annuler ton abonnement, va dans Réglages → Apple ID → Abonnements')
    return false
  }

  const restaurerAchats = async () => {
    setProcessing(true)
    setError(null)

    try {
      const customerInfo = await Purchases.restorePurchases()
      const premium = customerInfo.entitlements.active['premium'] !== undefined
      setIsPremium(premium)

      const reponse = await supabase.auth.getUser()
      const user = reponse.data.user
      if (user !== null) {
        await supabase.from('profiles').update({ is_premium: premium }).eq('id', user.id)}

      setProcessing(false)
      return premium

    } catch (e: any) {
      setError(e.message)
      setProcessing(false)
      return false
    }
  }

  return {
    isPremium,
    loading,
    processing,
    error,
    planChoisi,
    setPlanChoisi,
    verifierPrenium,
    souscrire,
    annuler,
    restaurerAchats,
  }
}