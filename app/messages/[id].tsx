import { Avatar } from '@/components/ui/Avatar'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Radius, Spacing } from '@/constants/theme'
import { Message, useConversation } from '@/hooks/useConversation'
import { useTheme } from '@/hooks/useTheme'
import { buildMessageRows, MessageRow } from '@/utils/messageGroups'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

type Row = MessageRow<Message>

export default function ConversationScreen() {
  const { colors } = useTheme()
  const { id, annonceId, annonceTitre, otherName, otherAvatarUrl } = useLocalSearchParams<{
    id: string
    annonceId?: string
    annonceTitre?: string
    otherName?: string
    otherAvatarUrl?: string
  }>()
  const { messages, loading, error, sending, sendMessage, retryMessage, currentUserId, otherLastReadAt } =
    useConversation(id)
  const [draft, setDraft] = useState('')

  const rows = useMemo(() => buildMessageRows(messages, currentUserId).reverse(), [messages, currentUserId])

  const lastMineConfirmedId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.sender_id === currentUserId && !m.clientId) return m.id
    }
    return null
  }, [messages, currentUserId])

  const otherHasRead =
    !!otherLastReadAt &&
    !!lastMineConfirmedId &&
    (() => {
      const m = messages.find((x) => x.id === lastMineConfirmedId)
      return !!m && new Date(otherLastReadAt) >= new Date(m.created_at)
    })()

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || sending) return
    setDraft('')
    const ok = await sendMessage(content)
    if (!ok) setDraft(content)
  }

  const openAnnonce = () => {
    if (annonceId) router.push(`/annonce/${annonceId}` as any)
  }

  const renderRow = ({ item }: { item: Row }) => {
    if (item.type === 'sep') {
      return (
        <View style={styles.sepWrap}>
          <View style={[styles.sepPill, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.sepText, { color: colors.textMuted }]}>{item.label}</Text>
          </View>
        </View>
      )
    }

    const { message, mine, firstOfGroup, lastOfGroup } = item
    const time = new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const failed = message.status === 'failed'
    const pending = message.status === 'pending'
    const isLastMine = mine && message.id === lastMineConfirmedId

    let receipt: string | null = null
    if (mine && lastOfGroup) {
      if (pending) receipt = 'Envoi…'
      else if (failed) receipt = 'Non envoyé — toucher pour réessayer'
      else if (isLastMine) receipt = otherHasRead ? 'Vu' : 'Envoyé'
    }

    const BubbleWrapper: any = failed ? Pressable : View

    return (
      <View
        style={[
          styles.bubbleRow,
          mine ? styles.bubbleRowMine : styles.bubbleRowOther,
          { marginTop: firstOfGroup ? Spacing.md : 2 },
        ]}
      >
        {!mine && (
          <View style={styles.avatarSlot}>
            {lastOfGroup && <Avatar uri={otherAvatarUrl} name={otherName} size={28} />}
          </View>
        )}

        <View style={[styles.bubbleCol, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
          <BubbleWrapper
            onPress={failed ? () => retryMessage(message.clientId!) : undefined}
            style={[
              styles.bubble,
              mine
                ? [styles.bubbleMine, { backgroundColor: failed ? colors.errorBg : colors.primary }]
                : [styles.bubbleOther, { backgroundColor: colors.surface, borderColor: colors.border }],
              firstOfGroup && (mine ? { borderTopRightRadius: Radius.lg } : { borderTopLeftRadius: Radius.lg }),
              lastOfGroup && (mine ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }),
              pending && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.bubbleText, { color: failed ? colors.error : mine ? '#fff' : colors.text }]}>
              {message.content}
            </Text>
          </BubbleWrapper>
          {lastOfGroup && (
            <View style={styles.metaRow}>
              <Text style={[styles.time, { color: colors.textSubtle }]}>{time}</Text>
              {receipt && (
                <Text
                  style={[
                    styles.receipt,
                    { color: failed ? colors.error : otherHasRead && isLastMine ? colors.primary : colors.textSubtle },
                  ]}
                >
                  {receipt}
                </Text>
              )}
            </View>
          )}
        </View>
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
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={26} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topBarMain}
          activeOpacity={annonceId ? 0.6 : 1}
          onPress={openAnnonce}
          disabled={!annonceId}
        >
          <Avatar uri={otherAvatarUrl} name={otherName} size={38} />
          <View style={styles.topBarTitle}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {otherName ?? 'Conversation'}
            </Text>
            {annonceTitre ? (
              <View style={styles.subtitleRow}>
                <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {annonceTitre}
                </Text>
                {annonceId ? <IconSymbol name="chevron.right" size={13} color={colors.textSubtle} /> : null}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && messages.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error}</Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
            <IconSymbol name="bubble.left.fill" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Démarrez la conversation</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Envoyez un premier message à {otherName ?? 'ce membre'} pour organiser votre rencontre.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.key}
          renderItem={renderRow}
          inverted
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
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
          style={[styles.sendButton, { backgroundColor: colors.primary, opacity: sending || !draft.trim() ? 0.4 : 1 }]}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 2 },
  topBarMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  topBarTitle: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 },
  subtitle: { fontSize: 12, flexShrink: 1 },

  list: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },

  sepWrap: { alignItems: 'center', marginVertical: Spacing.md },
  sepPill: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.pill },
  sepText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, maxWidth: '82%' },
  bubbleRowMine: { alignSelf: 'flex-end' },
  bubbleRowOther: { alignSelf: 'flex-start' },
  avatarSlot: { width: 28 },
  bubbleCol: { flexShrink: 1 },

  bubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.lg },
  bubbleMine: { borderTopRightRadius: 4 },
  bubbleOther: { borderTopLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 15, lineHeight: 20 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, marginHorizontal: 4 },
  time: { fontSize: 10.5 },
  receipt: { fontSize: 10.5, fontWeight: '600' },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
})
