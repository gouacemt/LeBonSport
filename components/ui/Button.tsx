import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Radius, Spacing } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'md' | 'sm'

type Props = {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  icon?: React.ComponentProps<typeof IconSymbol>['name']
  style?: StyleProp<ViewStyle>
}

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style }: Props) {
  const { colors } = useTheme()

  const bg: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.primaryLight,
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.error,
  }
  const border: Record<Variant, string | undefined> = {
    primary: undefined,
    secondary: undefined,
    outline: colors.primary,
    ghost: undefined,
    danger: undefined,
  }
  const textColor: Record<Variant, string> = {
    primary: '#fff',
    secondary: colors.primaryDark,
    outline: colors.primary,
    ghost: colors.primary,
    danger: '#fff',
  }

  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        {
          backgroundColor: bg[variant],
          borderWidth: border[variant] ? 1.5 : 0,
          borderColor: border[variant],
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <>
          {icon && <IconSymbol name={icon} size={18} color={textColor[variant]} style={{ marginRight: Spacing.xs }} />}
          <Text style={[styles.label, { color: textColor[variant] }, size === 'sm' && styles.labelSm]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
  },
  sm: { paddingVertical: 10, paddingHorizontal: Spacing.md },
  label: { fontSize: 16, fontWeight: '700' },
  labelSm: { fontSize: 14 },
})
