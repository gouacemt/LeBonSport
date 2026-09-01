import Header from '@/components/Header'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PressableScale } from '@/components/ui/PressableScale'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { Spacing } from '@/constants/theme'
import { ConversationListItem, useConversations } from '@/hooks/useConversations'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useTheme } from '@/hooks/useTheme'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useRef } from 'react'
import { Animated, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'

function formatTimestamp(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function MessagesScreen() {
  useRequireAuth()
  const { colors } = useTheme()
  const { conversations, loading, error, markAllRead } = useConversations()
  const scrollY = useRef(new Animated.Value(0)).current

  useFocusEffect(
    useCallback(() => {
      markAllRead()
    }, [])
  )

  const openConversation = (item: ConversationListItem) => {
    router.push({
      pathname: '/messages/[id]',
      params: { id: item.id, annonceTitre: item.annonceTitre, otherName: item.otherName },
    } as any)
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <Header scrollY={scrollY} />

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          <Text style={[styles.title, { color: colors.text }]}>Messages</Text>

          {loading ? (
          <View style={{ gap: Spacing.sm }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : error ? (
          <Text style={{ color: colors.error }}>{error}</Text>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon="bubble.left.fill"
            title="Aucune conversation"
            subtitle="Contactez le propriétaire d'une annonce pour démarrer une discussion"
          />
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {conversations.map((item) => (
              <PressableScale key={item.id} onPress={() => openConversation(item)}>
                <Card>
                  <View style={styles.row}>
                    <Avatar uri={item.otherAvatarUrl} name={item.otherName} size={44} />
                    <View style={styles.rowText}>
                      <View style={styles.rowHeader}>
                        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                          {item.otherName}
                        </Text>
                        <Text style={[styles.time, { color: colors.textSubtle }]}>{formatTimestamp(item.lastMessageAt)}</Text>
                      </View>
                      <Text style={[styles.annonce, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.annonceTitre}
                      </Text>
                      {item.lastMessagePreview && (
                        <Text style={[styles.preview, { color: colors.textMuted }]} numberOfLines={1}>
                          {item.lastMessagePreview}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              </PressableScale>
            ))}
          </View>
          )}
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingTop: 80 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowText: { flex: 1, gap: 2 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  time: { fontSize: 12 },
  annonce: { fontSize: 13, fontWeight: '500' },
  preview: { fontSize: 13 },
})
