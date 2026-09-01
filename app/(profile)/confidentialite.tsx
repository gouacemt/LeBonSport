import { Card } from '@/components/ui/Card'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { router } from 'expo-router'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const SECTIONS = [
  {
    title: 'Données collectées',
    body: "Nous collectons votre email, votre profil (nom, âge, bio, sports pratiqués) et les annonces que vous publiez, afin de faire fonctionner la mise en relation entre sportifs.",
  },
  {
    title: 'Utilisation des données',
    body: "Vos données servent uniquement à faire fonctionner l'application : afficher votre profil, vos annonces, et vous recommander du contenu pertinent. Elles ne sont jamais vendues à des tiers.",
  },
  {
    title: 'Stockage',
    body: 'Vos données sont hébergées de manière sécurisée chez Supabase, avec des règles d\'accès garantissant que seul vous pouvez modifier vos propres informations.',
  },
  {
    title: 'Vos droits',
    body: "Vous pouvez modifier ou supprimer vos informations de profil à tout moment depuis l'écran d'édition du profil.",
  },
]

export default function ConfidentialiteScreen() {
  const { colors } = useTheme()
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Confidentialité</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{s.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  title: { fontSize: 17, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  sectionBody: { fontSize: 14, lineHeight: 21 },
})
