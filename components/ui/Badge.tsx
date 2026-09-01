import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Radius, Spacing } from '@/constants/theme'

type Variant = 'neutral' | 'success' | 'info' | 'warning'

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: Variant }) {
  const { colors } = useTheme()

  const styleFor: Record<Variant, { bg: string; text: string }> = {
    neutral: { bg: colors.surfaceAlt, text: colors.textMuted },
    success: { bg: colors.primaryLight, text: colors.primaryDark },
    info: { bg: '#EAF0FF', text: '#3B5BDB' },
    warning: { bg: '#FFF8E1', text: '#F39C12' },
  }
  const { bg, text } = styleFor[variant]

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  label: { fontSize: 12, fontWeight: '600' },
})
