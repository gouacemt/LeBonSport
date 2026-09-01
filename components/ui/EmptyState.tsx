import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Spacing } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol'

type Props = {
  icon?: IconSymbolName
  title: string
  subtitle?: string
  ctaLabel?: string
  onCta?: () => void
}

export function EmptyState({ icon = 'magnifyingglass', title, subtitle, ctaLabel, onCta }: Props) {
  const { colors } = useTheme()
  return (
    <View style={styles.root}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
        <IconSymbol name={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
      {ctaLabel && onCta && <Button label={ctaLabel} onPress={onCta} size="sm" style={{ marginTop: Spacing.md }} />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
})
