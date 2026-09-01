import { Radius, Spacing } from '@/constants/theme'
import { Message, useConversation } from '@/hooks/useConversation'
import { useTheme } from '@/hooks/useTheme'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function ConversationScreen() {
  const { colors } = useTheme()
  const { id, annonceTitre, otherName } = useLocalSearchParams<{ id: string; annonceTitre?: string; otherName?: string }>()
  const { messages, loading, error, sending, sendMessage, currentUserId } = useConversation(id)
  const [draft, setDraft] = useState('')

  const handleSend = async () => {
    const content = draft
    setDraft('')
    const ok = await sendMessage(content)
    if (!ok) setDraft(content)
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const mine = item.sender_id === currentUserId
    const time = new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    return (
      <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowOther]}>
        <View
          style={[
            styles.bubble,
            { backgroundColor: mine ? colors.primary : colors.surfaceAlt },
            mine ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          <Text style={{ color: mine ? '#fff' : colors.text, fontSize: 15 }}>{item.content}</Text>
        </View>
        <Text style={[styles.time, { color: colors.textSubtle }, mine && styles.timeMine]}>{time}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
        </TouchableOpacity>
        <View style={styles.topBarTitle}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {otherName ?? 'Conversation'}
          </Text>
          {annonceTitre && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {annonceTitre}
            </Text>
          )}
        </View>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.list}
        />
      )}

      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Écrire un message…"
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt }]}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !draft.trim()}
          style={[styles.sendButton, { backgroundColor: colors.primary, opacity: sending || !draft.trim() ? 0.5 : 1 }]}
        >
          <Text style={styles.sendLabel}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  topBarTitle: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  bubbleRow: { maxWidth: '80%', marginBottom: Spacing.xs },
  bubbleRowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.lg },
  bubbleMine: { borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  time: { fontSize: 11, marginTop: 2, marginHorizontal: 4 },
  timeMine: { textAlign: 'right' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  input: { flex: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendButton: { borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  sendLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
