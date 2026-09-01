import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Radius, Spacing } from '@/constants/theme'

type Props = {
  ville: string
  club?: string | null
  height?: number
}

export function MapPreview({ ville, club, height = 160 }: Props) {
  const { colors } = useTheme()
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    const load = async () => {
      try {
        const query = encodeURIComponent(ville)
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
          headers: { 'Accept-Language': 'fr' },
        })
        const data = await res.json()
        if (cancelled) return
        if (Array.isArray(data) && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) })
          setStatus('ok')
        } else {
          setStatus('error')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [ville])

  if (status === 'loading') {
    return (
      <View style={[styles.box, { height, backgroundColor: colors.surfaceAlt }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (status === 'error' || !coords) {
    return (
      <View style={[styles.box, { height, backgroundColor: colors.surfaceAlt }]}>
        <View style={styles.inlinePin}>
          <IconSymbol name="mappin.and.ellipse" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{club || ville}</Text>
        </View>
      </View>
    )
  }

  const tileUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lon}&zoom=13&size=600x${Math.round(height * 2)}&markers=${coords.lat},${coords.lon},red-pushpin`

  return (
    <View style={[styles.box, { height }]}>
      <Image source={{ uri: tileUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={[styles.caption, { backgroundColor: colors.surface }]}>
        <IconSymbol name="mappin.and.ellipse" size={13} color={colors.text} />
        <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{club || ville}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { borderRadius: Radius.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  inlinePin: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  caption: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
})
