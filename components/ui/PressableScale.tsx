import * as Haptics from 'expo-haptics'
import { GestureResponderEvent, Platform, StyleProp, TouchableWithoutFeedback, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

type Props = {
  children: React.ReactNode
  onPress?: (e: GestureResponderEvent) => void
  haptics?: boolean
  style?: StyleProp<ViewStyle>
  disabled?: boolean
}

export function PressableScale({ children, onPress, haptics = false, style, disabled }: Props) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const onPressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 })
  }
  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15 })
  }
  const handlePress = (e: GestureResponderEvent) => {
    if (haptics && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.(e)
  }

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut} onPress={handlePress} disabled={disabled}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  )
}
