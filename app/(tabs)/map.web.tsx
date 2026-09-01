import Header from '@/components/Header'
import { useMap } from '@/hooks/useMap'
import { usePopularClubs } from '@/hooks/usePopularClubs'
import { useRef } from 'react'
import {
  ActivityIndicator, Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'

// react-native-maps n'a pas de support web : on affiche ici la carte OpenStreetMap
// via son iframe officielle (fiable, sans clé) + la liste des clubs et annonces.
// La carte interactive native est dans app/(tabs)/map.tsx.

const GREEN = '#16A06A'

const SPORTS_EMOJIS: { [key: string]: string } = {
  Football: '⚽', Basketball: '🏀', Tennis: '🎾', Running: '🏃', Cyclisme: '🚴',
  Natation: '🏊', Rugby: '🏉', Volleyball: '🏐', Fitness: '💪', Randonnée: '🥾',
  'Arts martiaux': '🥋', Yoga: '🧘', Padel: '🏓', Surf: '🏄', Ski: '⛷️',
}

export default function MapScreenWeb() {
  const { annonces, position, loading, error, locationDenied, retry } = useMap()
  const clubs = usePopularClubs()
  const scrollY = useRef(new Animated.Value(0)).current

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Header scrollY={scrollY} />
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>Chargement de la carte…</Text>
      </View>
    )
  }

  const dLat = (position.latitudeDelta || 0.15) / 2
  const dLon = (position.longitudeDelta || 0.15) / 2
  const bbox = [
    position.longitude - dLon,
    position.latitude - dLat,
    position.longitude + dLon,
    position.latitude + dLat,
  ].join('%2C')
  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
    `&layer=mapnik&marker=${position.latitude}%2C${position.longitude}`

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Header scrollY={scrollY} />

      <View style={styles.mapWrap}>
        <iframe
          src={mapUrl}
          title="Carte OpenStreetMap"
          loading="lazy"
          style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
        />
        <View style={styles.mapCaption} pointerEvents="none">
          <Text style={styles.mapCaptionText}>📍 Votre zone</Text>
        </View>
        {locationDenied && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Activez la localisation pour centrer la carte sur votre position.
            </Text>
            <TouchableOpacity style={styles.bannerBtn} onPress={retry}>
              <Text style={styles.bannerBtnText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {error && <Text style={styles.error}>{error}</Text>}

        {clubs.data.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Clubs à proximité</Text>
            <View style={styles.grid}>
              {clubs.data.map((club) => (
                <View key={club.id} style={styles.clubCard}>
                  <Text style={styles.emoji}>{SPORTS_EMOJIS[club.sport] || '🏅'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{club.nom}</Text>
                    <Text style={styles.cardMeta}>{club.ville} · {club.membres} membres</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>
          Annonces récentes{annonces.length ? ` · ${annonces.length}` : ''}
        </Text>
        {annonces.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Aucune annonce pour le moment</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {annonces.map((a) => (
              <View key={a.id} style={styles.annonceCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.emoji}>{SPORTS_EMOJIS[a.sport] || '🏃'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{a.titre}</Text>
                    <Text style={styles.cardMeta}>{a.sport}{a.niveau ? ` · ${a.niveau}` : ''}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardVille}>📍 {a.ville}</Text>
                  {a.places != null && (
                    <Text style={styles.cardPlaces}>{a.places} place{a.places > 1 ? 's' : ''}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },

  mapWrap: { height: 340, backgroundColor: '#E8EDE9', justifyContent: 'flex-end' },
  mapCaption: {
    position: 'absolute', top: 70, left: 12,
    backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 4,
  },
  mapCaptionText: { fontSize: 12, fontWeight: '600', color: '#1a1a1a' },
  banner: {
    margin: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  bannerText: { flex: 1, fontSize: 12, color: '#374151' },
  bannerBtn: { backgroundColor: GREEN, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  bannerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  listContent: { padding: 16, gap: 10 },
  error: { color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, fontSize: 13 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 6, marginBottom: 2,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  clubCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 240, flexGrow: 1,
    borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 14, padding: 12, backgroundColor: '#fff',
  },
  annonceCard: {
    minWidth: 240, flexGrow: 1,
    borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 14, padding: 12, backgroundColor: '#fff',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 20 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  cardMeta: { fontSize: 11, color: '#9CA3AF' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cardVille: { fontSize: 12, color: '#9CA3AF' },
  cardPlaces: { fontSize: 12, color: GREEN, fontWeight: '500' },

  empty: { padding: 32, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 30 },
  emptyText: { fontSize: 13, color: '#9CA3AF' },
})
