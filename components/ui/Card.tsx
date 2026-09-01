import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Radius, Spacing } from '@/constants/theme'

type Props = {
  children: React.ReactNode
  padding?: keyof typeof Spacing
  style?: StyleProp<ViewStyle>
}

export function Card({ children, padding = 'md', style }: Props) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: Spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
})
