import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'

type Props = {
  icon: IconSymbolName
  label: string
  color: string
  backgroundColor: string
  iconSize?: number
  style?: StyleProp<ViewStyle>
}

export function Tag({ icon, label, color, backgroundColor, iconSize = 12, style }: Props) {
  return (
    <View style={[styles.tag, { backgroundColor }, style]}>
      <IconSymbol name={icon} size={iconSize} color={color} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  text: { fontSize: 12, fontWeight: '500' },
})
