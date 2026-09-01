import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { PressableScale } from '@/components/ui/PressableScale'
import { getSportIcon } from '@/constants/sportIcons'
import { Spacing } from '@/constants/theme'
import { useFavoris } from '@/hooks/useFavoris'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/services/supabase'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const TYPE_LABELS: Record<string, string> = {
  club_recrute: 'Club qui recrute',
  equipe_joueurs: 'Équipe cherche joueurs',
  cherche_club: 'Cherche un club',
  cherche_equipe: 'Cherche une équipe',
  partie_ouverte: 'Partie ouverte',
}

type Annonce = { id: string; type: string; sport: string; titre: string; description: string; ville: string }

export default function FavorisScreen() {
  const { colors } = useTheme()
  const { favoris, loading: favorisLoading, toggleFavori } = useFavoris()
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favorisLoading) return
    if (favoris.length === 0) {
      setAnnonces([])
      setLoading(false)
      return
    }
    supabase
      .from('annonces')
      .select('id, type, sport, titre, description, ville')
      .in('id', favoris)
      .then(({ data }) => {
        setAnnonces(data ?? [])
        setLoading(false)
      })
  }, [favoris, favorisLoading])

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Mes favoris</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : annonces.length === 0 ? (
          <EmptyState
            icon="star.fill"
            title="Aucun favori pour l'instant"
            subtitle="Appuyez sur le cœur d'une annonce pour la retrouver ici"
            ctaLabel="Explorer les annonces"
            onCta={() => router.push('/(tabs)/explore')}
          />
        ) : (
          <View style={{ gap: Spacing.md }}>
            {annonces.map((a) => (
              <PressableScale key={a.id} onPress={() => router.push(`/annonce/${a.id}` as any)}>
                <Card>
                  <View style={styles.cardHeader}>
                    <Badge label={TYPE_LABELS[a.type] ?? a.type} variant="success" />
                    <TouchableOpacity onPress={() => toggleFavori(a.id)} hitSlop={8}>
                      <IconSymbol name="heart.fill" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{a.titre}</Text>
                  <View style={styles.cardSubRow}>
                    <IconSymbol name={getSportIcon(a.sport)} size={12} color={colors.textMuted} />
                    <Text style={[styles.cardSub, { color: colors.textMuted }]}>{a.sport}</Text>
                    <Text style={[styles.cardSub, { color: colors.textMuted, marginHorizontal: 2 }]}>·</Text>
                    <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textMuted} />
                    <Text style={[styles.cardSub, { color: colors.textMuted }]}>{a.ville}</Text>
                  </View>
                </Card>
              </PressableScale>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  title: { fontSize: 17, fontWeight: '700' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardSub: { fontSize: 13 },
})
