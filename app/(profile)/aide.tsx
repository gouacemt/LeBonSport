import { Card } from '@/components/ui/Card'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const FAQ = [
  { q: 'Comment publier une annonce ?', a: 'Depuis l\'onglet "Créer", remplissez le formulaire avec le sport, le niveau, la ville et une description, puis validez.' },
  { q: 'Comment trouver un partenaire sportif ?', a: 'Utilisez l\'onglet "Explorer" pour parcourir les annonces, filtrer par sport ou niveau, et contacter directement l\'organisateur.' },
  { q: 'Comment modifier mes sports pratiqués ?', a: 'Rendez-vous dans "Modifier le profil" depuis votre page profil, puis sélectionnez ou désélectionnez vos sports.' },
  { q: 'Comment supprimer mon compte ?', a: 'Contactez-nous depuis cette page pour le moment, la suppression de compte en libre-service arrive bientôt.' },
]

export default function AideScreen() {
  const { colors } = useTheme()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Aide</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}>
        {FAQ.map((item, i) => {
          const open = openIndex === i
          return (
            <TouchableOpacity key={item.q} activeOpacity={0.8} onPress={() => setOpenIndex(open ? null : i)}>
              <Card>
                <View style={styles.row}>
                  <Text style={[styles.question, { color: colors.text }]}>{item.q}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>{open ? '−' : '+'}</Text>
                </View>
                {open && <Text style={[styles.answer, { color: colors.textMuted }]}>{item.a}</Text>}
              </Card>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  title: { fontSize: 17, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  answer: { fontSize: 14, lineHeight: 21, marginTop: Spacing.sm },
})
