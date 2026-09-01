import { Image, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

type Props = {
  uri?: string | null
  name?: string | null
  size?: number
}

export function Avatar({ uri, name, size = 44 }: Props) {
  const { colors } = useTheme()
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?'

  if (uri) {
    return <Image source={{ uri }} style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]} />
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryLight, borderColor: colors.primary },
      ]}
    >
      <Text style={[styles.initial, { color: colors.primary, fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  fallback: { borderWidth: 1.5 },
  initial: { fontWeight: '700' },
})
