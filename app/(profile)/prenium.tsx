import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform,
  ActivityIndicator, Alert
} from 'react-native'
import { router } from 'expo-router'
import { usePrenium } from '@/hooks/usePrenium'

const AVANTAGES = [
  { emoji: '✅', titre: 'Badge vérifié',            description: 'Un badge affiché sur ton profil et tes annonces' },
  { emoji: '🚀', titre: 'Priorité dans les résultats', description: 'Tes annonces apparaissent en premier dans les recherches' },
]

export default function PremiumScreen() {
  const {
    isPremium, loading, processing, error,
    planChoisi, setPlanChoisi, souscrire, annuler
  } = usePrenium()

  const handleSouscrire = async () => {
    const success = await souscrire(planChoisi)
    if (success) {
      Alert.alert(
        '🎉 Bienvenue dans Premium !',
        `Tu es maintenant abonné au plan ${planChoisi === 'mensuel' ? 'mensuel (4.99€/mois)' : 'annuel (39.99€/an)'}.`,
        [{ text: 'Super !', onPress: () => router.back() }]
      )
    }
  }

  const handleAnnuler = () => {
    Alert.alert(
      'Annuler l\'abonnement',
      'Tu perdras l\'accès aux fonctionnalités premium à la fin de ta période en cours.',
      [
        { text: 'Garder Premium', style: 'cancel' },
        {
          text: 'Annuler quand même',
          style: 'destructive',
          onPress: async () => {
            await annuler()
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E24B4A" />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header foncé */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={function() { router.back() }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Retour</Text>
          </TouchableOpacity>

          <Text style={styles.premiumEmoji}>⭐</Text>
          <Text style={styles.title}>LeBonSport Premium</Text>
          <Text style={styles.subtitle}>
            Profite de toutes les fonctionnalités exclusives
          </Text>

          {isPremium && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>✓ Abonnement actif</Text>
            </View>
          )}
        </View>

        {/* Contenu blanc */}
        <View style={styles.bottomSheet}>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* Avantages */}
          <Text style={styles.sectionTitle}>Ce qui est inclus</Text>

          {AVANTAGES.map(function(avantage, index) {
            return (
              <View key={index} style={styles.avantageRow}>
                <Text style={styles.avantageEmoji}>{avantage.emoji}</Text>
                <View style={styles.avantageTexts}>
                  <Text style={styles.avantageTitre}>{avantage.titre}</Text>
                  <Text style={styles.avantageDescription}>{avantage.description}</Text>
                </View>
              </View>
            )
          })}

          {!isPremium && (
            <>
              {/* Choix du plan */}
              <Text style={styles.sectionTitle}>Choisir un plan</Text>

              <View style={styles.plansRow}>
                {/* Plan mensuel */}
                <TouchableOpacity
                  style={[styles.planCard, planChoisi === 'mensuel' && styles.planCardActive]}
                  onPress={function() { setPlanChoisi('mensuel') }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.planLabel, planChoisi === 'mensuel' && styles.planLabelActive]}>
                    Mensuel
                  </Text>
                  <Text style={[styles.planPrix, planChoisi === 'mensuel' && styles.planPrixActive]}>
                    4.99€
                  </Text>
                  <Text style={[styles.planPeriode, planChoisi === 'mensuel' && styles.planPeriodeActive]}>
                    par mois
                  </Text>
                </TouchableOpacity>

                {/* Plan annuel */}
                <TouchableOpacity
                  style={[styles.planCard, planChoisi === 'annuel' && styles.planCardActive]}
                  onPress={function() { setPlanChoisi('annuel') }}
                  activeOpacity={0.8}
                >
                  <View style={styles.economieBadge}>
                    <Text style={styles.economieBadgeText}>-33%</Text>
                  </View>
                  <Text style={[styles.planLabel, planChoisi === 'annuel' && styles.planLabelActive]}>
                    Annuel
                  </Text>
                  <Text style={[styles.planPrix, planChoisi === 'annuel' && styles.planPrixActive]}>
                    39.99€
                  </Text>
                  <Text style={[styles.planPeriode, planChoisi === 'annuel' && styles.planPeriodeActive]}>
                    par an
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bouton souscrire */}
              <TouchableOpacity
                style={styles.boutonPremium}
                onPress={handleSouscrire}
                disabled={processing}
                activeOpacity={0.85}
              >
                {processing
                  ? <ActivityIndicator color="#1a1a2e" />
                  : <Text style={styles.boutonPremiumText}>
                      {planChoisi === 'mensuel'
                        ? 'Commencer pour 4.99€/mois'
                        : 'Commencer pour 39.99€/an'
                      }
                    </Text>
                }
              </TouchableOpacity>

              <Text style={styles.mentionLegale}>
                Paiement sécurisé. Résiliable à tout moment.{'\n'}
                En production, le paiement sera géré via l'App Store ou Google Play.
              </Text>
            </>
          )}

          {isPremium && (
            <TouchableOpacity
              style={styles.boutonAnnuler}
              onPress={handleAnnuler}
              disabled={processing}
              activeOpacity={0.8}
            >
              {processing
                ? <ActivityIndicator color="#E24B4A" />
                : <Text style={styles.boutonAnnulerText}>Annuler l'abonnement</Text>
              }
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:                 { flex: 1, backgroundColor: '#1a1a2e' },
  loadingContainer:     { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header foncé
  header:               {
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight || 40) + 16
      : 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton:           { alignSelf: 'flex-start', marginBottom: 24 },
  backText:             { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  premiumEmoji:         { fontSize: 48, marginBottom: 12 },
  title:                { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  subtitle:             { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  activeBadge:          { backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 16, borderWidth: 1, borderColor: '#FFD700' },
  activeBadgeText:      { color: '#FFD700', fontWeight: '600', fontSize: 13 },

  // Bloc blanc
  bottomSheet:          { backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 48 },
  sectionTitle:         { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16, marginTop: 8 },

  // Avantages
  avantageRow:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  avantageEmoji:        { fontSize: 22, width: 32 },
  avantageTexts:        { flex: 1 },
  avantageTitre:        { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  avantageDescription:  { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  // Plans
  plansRow:             { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard:             { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, alignItems: 'center', backgroundColor: '#FAFAFA', position: 'relative' },
  planCardActive:       { borderColor: '#1a1a2e', backgroundColor: '#1a1a2e' },
  planLabel:            { fontSize: 13, fontWeight: '500', color: '#6B7280', marginBottom: 8 },
  planLabelActive:      { color: 'rgba(255,255,255,0.8)' },
  planPrix:             { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  planPrixActive:       { color: '#FFD700' },
  planPeriode:          { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  planPeriodeActive:    { color: 'rgba(255,255,255,0.6)' },
  economieBadge:        { position: 'absolute', top: -10, right: -10, backgroundColor: '#E24B4A', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  economieBadgeText:    { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Boutons
  boutonPremium:        { backgroundColor: '#FFD700', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 12 },
  boutonPremiumText:    { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
  boutonAnnuler:        { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#E24B4A', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16 },
  boutonAnnulerText:    { color: '#E24B4A', fontWeight: '600', fontSize: 15 },
  mentionLegale:        { fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 16 },

  // Erreur
  error:                { color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
})