import Header from '@/components/Header'
import { useMap } from '@/hooks/useMap'
import { usePopularClubs } from '@/hooks/usePopularClubs'
import { router } from 'expo-router'
import { useRef } from 'react'
import {
  ActivityIndicator, Animated, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'

const GREEN = '#16A06A'

const SPORTS_EMOJIS: { [key: string]: string } = {
  Football: '⚽', Basketball: '🏀', Tennis: '🎾', Running: '🏃', Cyclisme: '🚴',
  Natation: '🏊', Rugby: '🏉', Volleyball: '🏐', Fitness: '💪', Randonnée: '🥾',
  'Arts martiaux': '🥋', Yoga: '🧘', Padel: '🏓', Surf: '🏄', Ski: '⛷️',
}

export default function MapScreen() {
  const {
    annonces, position, loading, error, locationDenied, retry,
    annonceSelectee, setAnnonceSelectee,
  } = useMap()
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

  const located = annonces.filter((a) => a.latitude != null && a.longitude != null)

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={position}
        showsUserLocation
        showsMyLocationButton
      >
        {located.map((a) => {
          const isSel = annonceSelectee?.id === a.id
          return (
            <Marker
              key={a.id}
              coordinate={{ latitude: a.latitude as number, longitude: a.longitude as number }}
              onPress={() => setAnnonceSelectee(a)}
            >
              <View style={[styles.marker, isSel && styles.markerSelected]}>
                <Text style={styles.markerEmoji}>{SPORTS_EMOJIS[a.sport] || '🏃'}</Text>
              </View>
            </Marker>
          )
        })}
      </MapView>

      <Header scrollY={scrollY} />

      {(locationDenied || error) && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {error ?? 'Activez la localisation pour centrer la carte sur votre position.'}
          </Text>
          <TouchableOpacity style={styles.bannerBtn} onPress={retry}>
            <Text style={styles.bannerBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feuille basse */}
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {clubs.data.length > 0 && (
          <>
            <Text style={styles.sheetLabel}>Clubs à proximité</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {clubs.data.map((club) => (
                <View key={club.id} style={styles.clubChip}>
                  <Text style={styles.clubEmoji}>{SPORTS_EMOJIS[club.sport] || '🏅'}</Text>
                  <View>
                    <Text style={styles.clubName} numberOfLines={1}>{club.nom}</Text>
                    <Text style={styles.clubMeta}>{club.ville} · {club.membres} m.</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sheetLabel}>
          Annonces récentes{annonces.length ? ` · ${annonces.length}` : ''}
        </Text>
        {annonces.length === 0 ? (
          <Text style={styles.empty}>Aucune annonce pour le moment.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {annonces.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/annonce/${a.id}` as any)}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.emoji}>{SPORTS_EMOJIS[a.sport] || '🏃'}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>{a.titre}</Text>
                </View>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {a.sport}{a.niveau ? ` · ${a.niveau}` : ''}
                </Text>
                <View style={styles.cardFoot}>
                  <Text style={styles.cardVille} numberOfLines={1}>📍 {a.ville}</Text>
                  {a.places != null && (
                    <Text style={styles.cardPlaces}>{a.places} pl.</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {annonceSelectee && (
        <TouchableOpacity
          style={styles.detailCard}
          activeOpacity={0.9}
          onPress={() => router.push(`/annonce/${annonceSelectee.id}` as any)}
        >
          <TouchableOpacity style={styles.detailClose} onPress={() => setAnnonceSelectee(null)}>
            <Text style={styles.detailCloseText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitre} numberOfLines={1}>{annonceSelectee.titre}</Text>
          <Text style={styles.detailSport}>
            {SPORTS_EMOJIS[annonceSelectee.sport] || '🏃'} {annonceSelectee.sport}
            {annonceSelectee.niveau ? ` — ${annonceSelectee.niveau}` : ''}
          </Text>
          <Text style={styles.detailDescription} numberOfLines={2}>{annonceSelectee.description}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },

  banner: {
    position: 'absolute', top: Platform.OS === 'ios' ? 104 : 84, left: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  bannerText: { flex: 1, fontSize: 12, color: '#374151' },
  bannerBtn: { backgroundColor: GREEN, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  bannerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingTop: 8, paddingBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 12,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginBottom: 8 },
  sheetLabel: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.4, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6,
  },
  hScroll: { paddingHorizontal: 16, gap: 10 },
  empty: { fontSize: 13, color: '#9CA3AF', paddingHorizontal: 16, paddingBottom: 8 },

  clubChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: '#fff', maxWidth: 200,
  },
  clubEmoji: { fontSize: 18 },
  clubName: { fontSize: 12, fontWeight: '600', color: '#1a1a1a' },
  clubMeta: { fontSize: 10, color: '#9CA3AF' },

  card: {
    width: 210, borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 14, padding: 12, backgroundColor: '#fff', gap: 4,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoji: { fontSize: 18 },
  cardTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  cardMeta: { fontSize: 11, color: '#6B7280' },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardVille: { flex: 1, fontSize: 11, color: '#9CA3AF' },
  cardPlaces: { fontSize: 11, color: GREEN, fontWeight: '600' },

  marker: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 2, borderColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  markerSelected: { backgroundColor: GREEN, borderColor: GREEN },
  markerEmoji: { fontSize: 16 },

  detailCard: {
    position: 'absolute', bottom: 190, left: 12, right: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  detailClose: {
    position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  detailCloseText: { fontSize: 12, color: '#6B7280' },
  detailTitre: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4, paddingRight: 24 },
  detailSport: { fontSize: 13, color: GREEN, fontWeight: '500', marginBottom: 6 },
  detailDescription: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
})
