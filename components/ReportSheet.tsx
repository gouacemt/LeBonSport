import { Button } from '@/components/ui/Button'
import { Radius, Spacing } from '@/constants/theme'
import { MOTIFS_SIGNALEMENT, useModeration } from '@/hooks/useModeration'
import { useTheme } from '@/hooks/useTheme'
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

type Props = {
  visible: boolean
  onClose: () => void
  targetType: 'annonce' | 'user'
  targetId: string
  targetLabel?: string
}

export function ReportSheet({ visible, onClose, targetType, targetId, targetLabel }: Props) {
  const { colors } = useTheme()
  const { report } = useModeration()
  const [motif, setMotif] = useState<string>(MOTIFS_SIGNALEMENT[0])
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    const ok = await report({ targetType, targetId, motif, details: details.trim() || undefined })
    setSubmitting(false)
    if (ok) {
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setDetails('')
        onClose()
      }, 1400)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {done ? (
          <Text style={[styles.done, { color: colors.text }]}>
            Merci, votre signalement a été transmis à l&apos;équipe.
          </Text>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.text }]}>
              Signaler {targetType === 'annonce' ? 'cette annonce' : targetLabel ?? 'ce membre'}
            </Text>

            <Text style={[styles.label, { color: colors.textMuted }]}>Motif</Text>
            <View style={styles.motifs}>
              {MOTIFS_SIGNALEMENT.map((m) => {
                const active = m === motif
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMotif(m)}
                    style={[
                      styles.motif,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryLight : 'transparent' },
                    ]}
                  >
                    <Text style={[styles.motifText, { color: active ? colors.primaryDark : colors.textMuted }]}>{m}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Détails (optionnel)…"
              placeholderTextColor={colors.textSubtle}
              multiline
              style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt }]}
            />

            <Button label="Envoyer le signalement" onPress={submit} loading={submitting} style={{ marginTop: Spacing.md }} />
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Annuler</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 8,
    gap: 6,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: Spacing.sm },
  title: { fontSize: 16, fontWeight: '800', marginBottom: Spacing.sm },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  motifs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: Spacing.sm },
  motif: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1.5 },
  motifText: { fontSize: 13, fontWeight: '600' },
  input: { borderRadius: Radius.md, padding: Spacing.md, fontSize: 14, minHeight: 72, marginTop: 6 },
  cancel: { alignItems: 'center', paddingVertical: Spacing.sm, marginTop: 4 },
  done: { fontSize: 15, fontWeight: '600', textAlign: 'center', paddingVertical: Spacing.lg },
})
