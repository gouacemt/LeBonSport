import { Avatar } from '@/components/ui/Avatar'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Radius, Spacing } from '@/constants/theme'
import { usePublicProfile } from '@/hooks/usePublicProfile'
import { useTheme } from '@/hooks/useTheme'
import { timeAgo } from '@/utils/format'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

function Stars({ value, size = 14, color }: { value: number; size?: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconSymbol key={n} name="star.fill" size={size} color={n <= Math.round(value) ? color : color + '33'} />
      ))}
    </View>
  )
}

function fullName(p: { prenom: string | null; nom: string | null } | null) {
  if (!p) return 'Membre'
  return [p.prenom, p.nom].filter(Boolean).join(' ').trim() || 'Membre'
}

function role(p: { is_club: boolean | null; is_coach: boolean | null; is_sportif: boolean | null } | null) {
  if (!p) return null
  if (p.is_club) return 'Club'
  if (p.is_coach) return 'Coach'
  if (p.is_sportif) return 'Sportif'
  return null
}

export default function PublicProfileScreen() {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    profile,
    sports,
    annoncesCount,
    avis,
    average,
    myAvis,
    canReview,
    isMe,
    loading,
    error,
    submitting,
    submitAvis,
  } = usePublicProfile(id)

  const [note, setNote] = useState(0)
  const [comment, setComment] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (myAvis) {
      setNote(myAvis.note)
      setComment(myAvis.commentaire ?? '')
    }
  }, [myAvis])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error || !profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>{error ?? 'Profil introuvable'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.md }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const submit = async () => {
    if (note < 1) return
    const ok = await submitAvis(note, comment)
    if (ok) setFormOpen(false)
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={22} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 15 }}>Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}>
        <View style={styles.head}>
          <Avatar uri={profile.avatar_url} name={fullName(profile)} size={72} />
          <Text style={[styles.name, { color: colors.text }]}>{fullName(profile)}</Text>
          <View style={styles.metaRow}>
            {role(profile) && (
              <View style={[styles.pill, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.pillText, { color: colors.primaryDark }]}>{role(profile)}</Text>
              </View>
            )}
            {profile.niveau && (
              <View style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.pillText, { color: colors.textMuted }]}>{profile.niveau}</Text>
              </View>
            )}
          </View>
          {average != null ? (
            <View style={styles.ratingRow}>
              <Stars value={average} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.textMuted }]}>
                {average.toFixed(1)} · {avis.length} avis
              </Text>
            </View>
          ) : (
            <Text style={[styles.ratingText, { color: colors.textSubtle }]}>Pas encore d&apos;avis</Text>
          )}
        </View>

        {!!profile.bio && <Text style={[styles.bio, { color: colors.textMuted }]}>{profile.bio}</Text>}

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.text }]}>{annoncesCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>annonces</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.text }]}>{sports.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>sports</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.text }]}>{profile.created_at ? timeAgo(profile.created_at).replace('il y a ', '') : '—'}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>ancienneté</Text>
          </View>
        </View>

        {sports.length > 0 && (
          <View style={styles.chips}>
            {sports.map((s) => (
              <View key={s} style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.chipText, { color: colors.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Avis */}
        <View>
          <View style={styles.avisHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Avis</Text>
            {canReview && !formOpen && (
              <TouchableOpacity onPress={() => setFormOpen(true)}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                  {myAvis ? 'Modifier mon avis' : 'Laisser un avis'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {formOpen && (
            <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.starPick}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity key={n} onPress={() => setNote(n)} hitSlop={4}>
                    <IconSymbol
                      name="star.fill"
                      size={28}
                      color={n <= note ? colors.warning : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Votre commentaire (optionnel)…"
                placeholderTextColor={colors.textSubtle}
                multiline
                style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt }]}
              />
              <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setFormOpen(false)}>
                  <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submit}
                  disabled={note < 1 || submitting}
                  style={[styles.submit, { backgroundColor: colors.primary, opacity: note < 1 || submitting ? 0.5 : 1 }]}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Publier</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {avis.length === 0 && !formOpen ? (
            <Text style={[styles.ratingText, { color: colors.textSubtle, marginTop: 4 }]}>
              {isMe ? "Vos avis reçus apparaîtront ici." : "Soyez le premier à laisser un avis."}
            </Text>
          ) : (
            <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
              {avis.map((a) => (
                <View key={a.id} style={[styles.avisCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.avisTop}>
                    <Avatar uri={a.auteur?.avatar_url} name={fullName(a.auteur ?? null)} size={28} />
                    <Text style={[styles.avisName, { color: colors.text }]}>{fullName(a.auteur ?? null)}</Text>
                    <Text style={[styles.avisDate, { color: colors.textSubtle }]}>{timeAgo(a.created_at)}</Text>
                  </View>
                  <Stars value={a.note} color={colors.warning} />
                  {!!a.commentaire && (
                    <Text style={[styles.avisComment, { color: colors.textMuted }]}>{a.commentaire}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  head: { alignItems: 'center', gap: 8 },
  name: { fontSize: 20, fontWeight: '800' },
  metaRow: { flexDirection: 'row', gap: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill },
  pillText: { fontSize: 12, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  ratingText: { fontSize: 13 },

  bio: { fontSize: 14, lineHeight: 21, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  stat: { flex: 1, borderWidth: 1, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 11 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },

  avisHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },

  form: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm, marginTop: Spacing.sm },
  starPick: { flexDirection: 'row', gap: 6, alignSelf: 'center' },
  input: { borderRadius: Radius.md, padding: Spacing.md, fontSize: 14, minHeight: 64 },
  formActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submit: { paddingHorizontal: Spacing.lg, paddingVertical: 10, borderRadius: Radius.md },
  submitText: { color: '#fff', fontWeight: '700' },

  avisCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: 6 },
  avisTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avisName: { fontSize: 13, fontWeight: '700', flex: 1 },
  avisDate: { fontSize: 11 },
  avisComment: { fontSize: 13, lineHeight: 19 },
})
