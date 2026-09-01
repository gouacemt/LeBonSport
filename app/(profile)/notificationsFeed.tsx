import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { Spacing } from '@/constants/theme'
import { useNotificationsFeed } from '@/hooks/useNotificationsFeed'
import { useTheme } from '@/hooks/useTheme'
import { router } from 'expo-router'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function NotificationsFeedScreen() {
  const { colors } = useTheme()
  const { data, loading } = useNotificationsFeed()

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={() => router.push('/(profile)/notifications')} hitSlop={8}>
          <IconSymbol name="gearshape.fill" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        {loading ? (
          <View style={{ gap: Spacing.sm }}>
            <SkeletonRow /><SkeletonRow /><SkeletonRow />
          </View>
        ) : data.length === 0 ? (
          <EmptyState icon="bell.fill" title="Aucune notification" subtitle="Vous êtes à jour !" />
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {data.map((n) => (
              <Card key={n.id}>
                <View style={styles.row}>
                  <IconSymbol name={n.icon} size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifTitle, { color: colors.text }]}>{n.titre}</Text>
                    <Text style={[styles.notifText, { color: colors.textMuted }]}>{n.texte}</Text>
                    <Text style={[styles.notifQuand, { color: colors.textSubtle }]}>{n.quand}</Text>
                  </View>
                </View>
              </Card>
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
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  notifText: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifQuand: { fontSize: 11 },
})
