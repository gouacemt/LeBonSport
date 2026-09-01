import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { MapPreview } from '@/components/ui/MapPreview'
import { Tag } from '@/components/ui/Tag'
import { getSportIcon } from '@/constants/sportIcons'
import { Radius, Spacing } from '@/constants/theme'
import { useAnnonceConversation } from '@/hooks/useAnnonceConversation'
import { useAnnonceDetail } from '@/hooks/useAnnonceDetail'
import { useAuth } from '@/hooks/useAuth'
import { useFavoris } from '@/hooks/useFavoris'
import { useTheme } from '@/hooks/useTheme'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

const TYPE_LABELS: Record<string, string> = {
  club_recrute: 'Club qui recrute',
  equipe_joueurs: 'Équipe cherche joueurs',
  cherche_club: 'Cherche un club',
  cherche_equipe: 'Cherche une équipe',
  partie_ouverte: 'Partie ouverte',
}

export default function AnnonceDetailScreen() {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { annonce, loading, error } = useAnnonceDetail(id)
  const { isFavori, toggleFavori } = useFavoris()
  const { session } = useAuth()
  const canContact = !!annonce && !!annonce.user_id && annonce.user_id !== session?.user.id
  const { sending, sendMessage } = useAnnonceConversation(annonce?.id, canContact ? annonce?.user_id : null)
  const [draft, setDraft] = useState('')

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error || !annonce) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>Annonce introuvable</Text>
        <Button label="Retour" onPress={() => router.back()} variant="outline" style={{ marginTop: Spacing.md }} />
      </View>
    )
  }

  const favori = isFavori(annonce.id)
  const date = new Date(annonce.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const onSend = async () => {
    const content = draft
    setDraft('')
    const ok = await sendMessage(content)
    if (!ok) setDraft(content)
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFavori(annonce.id)} hitSlop={8}>
            <IconSymbol name={favori ? 'heart.fill' : 'heart'} size={22} color={favori ? colors.error : colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <Badge label={TYPE_LABELS[annonce.type] ?? annonce.type} variant="success" />
            <Text style={[styles.date, { color: colors.textMuted }]}>{date}</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{annonce.titre}</Text>

          <View style={styles.tagsRow}>
            <Tag
              icon={getSportIcon(annonce.sport)}
              label={annonce.sport}
              color={colors.textMuted}
              backgroundColor={colors.surfaceAlt}
              iconSize={13}
              style={styles.tag}
            />
            {annonce.niveau && (
              <Tag
                icon="chart.bar.fill"
                label={annonce.niveau}
                color={colors.textMuted}
                backgroundColor={colors.surfaceAlt}
                iconSize={13}
                style={styles.tag}
              />
            )}
            {annonce.places != null && (
              <Tag
                icon="person.fill"
                label={`${annonce.places} place${annonce.places > 1 ? 's' : ''} restante${annonce.places > 1 ? 's' : ''}`}
                color={colors.textMuted}
                backgroundColor={colors.surfaceAlt}
                iconSize={13}
                style={styles.tag}
              />
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{annonce.description}</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Lieu</Text>
          <MapPreview ville={annonce.ville} club={annonce.club} />

          {canContact && (
            <View style={styles.chatInputRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Écrire un message au créateur de l'annonce…"
                placeholderTextColor={colors.textSubtle}
                style={[styles.chatInput, { color: colors.text, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                multiline
              />
              <TouchableOpacity
                onPress={onSend}
                disabled={sending || !draft.trim()}
                style={[styles.chatSendButton, { backgroundColor: colors.primary, opacity: sending || !draft.trim() ? 0.5 : 1 }]}
              >
                <Text style={styles.chatSendLabel}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  content: { padding: Spacing.lg },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  date: { fontSize: 12 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: Spacing.md, lineHeight: 30 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  tag: { gap: 5, paddingVertical: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.sm, marginTop: Spacing.md },
  description: { fontSize: 15, lineHeight: 22 },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginTop: Spacing.lg },
  chatInput: { flex: 1, borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: 16, fontSize: 15, maxHeight: 100 },
  chatSendButton: { borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 16 },
  chatSendLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
