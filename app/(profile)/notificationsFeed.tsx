import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { Spacing } from '@/constants/theme'
import { notificationIcon, useNotificationsFeed } from '@/hooks/useNotificationsFeed'
import { useTheme } from '@/hooks/useTheme'
import { timeAgo } from '@/utils/format'
import { router, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function NotificationsFeedScreen() {
  const { colors } = useTheme()
  const { notifications, loading, unreadCount, markAllRead } = useNotificationsFeed()

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => markAllRead(), 1200)
      return () => clearTimeout(t)
    }, [markAllRead]),
  )

  const openNotif = (data: Record<string, any>) => {
    if (data?.annonce_id) router.push(`/annonce/${data.annonce_id}` as any)
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(profile)/notifications')} hitSlop={8}>
          <IconSymbol name="gearshape.fill" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        {loading ? (
          <View style={{ gap: Spacing.sm }}>
            <SkeletonRow /><SkeletonRow /><SkeletonRow />
          </View>
        ) : notifications.length === 0 ? (
          <EmptyState icon="bell.fill" title="Aucune notification" subtitle="Vous êtes à jour !" />
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {notifications.map((n) => (
              <TouchableOpacity key={n.id} activeOpacity={0.7} onPress={() => openNotif(n.data)}>
                <Card>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: n.read_at ? colors.surfaceAlt : colors.primaryLight },
                      ]}
                    >
                      <IconSymbol
                        name={notificationIcon(n.type)}
                        size={18}
                        color={n.read_at ? colors.textMuted : colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.notifTitle, { color: colors.text }]}>{n.title}</Text>
                      {!!n.body && (
                        <Text style={[styles.notifText, { color: colors.textMuted }]}>{n.body}</Text>
                      )}
                      <Text style={[styles.notifQuand, { color: colors.textSubtle }]}>
                        {timeAgo(n.created_at)}
                      </Text>
                    </View>
                    {!n.read_at && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700' },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  notifText: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifQuand: { fontSize: 11 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
})
