import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/hooks/useTheme'
import { Radius, Spacing } from '@/constants/theme'

type Props = {
  width?: number | `${number}%`
  height?: number
  radius?: number
}

export function Skeleton({ width = '100%', height = 16, radius = Radius.sm }: Props) {
  const { colors } = useTheme()
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })), -1, true)
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.surfaceAlt }, animatedStyle]}
    />
  )
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={120} radius={Radius.lg} />
      <View style={{ height: Spacing.sm }} />
      <Skeleton width="70%" height={16} />
      <View style={{ height: Spacing.xs }} />
      <Skeleton width="40%" height={12} />
    </View>
  )
}

export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={44} height={44} radius={22} />
      <View style={{ flex: 1, gap: Spacing.xs }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
})
