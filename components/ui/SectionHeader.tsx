import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Spacing } from '@/constants/theme'

type Props = {
  title: string
  subtitle?: string
  ctaLabel?: string
  onCta?: () => void
}

export function SectionHeader({ title, subtitle, ctaLabel, onCta }: Props) {
  const { colors } = useTheme()
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
      </View>
      {ctaLabel && onCta && (
        <TouchableOpacity onPress={onCta} activeOpacity={0.7}>
          <Text style={[styles.cta, { color: colors.primary }]}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: Spacing.md },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  cta: { fontSize: 13, fontWeight: '600' },
})
