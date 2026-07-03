import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, StatusBar, Platform
} from 'react-native'
import MapView, { Marker, Circle } from 'react-native-maps'
import { useMap } from '@/hooks/useMap'

const RAYONS = [5, 10, 20, 50]

const SPORTS_EMOJIS: { [key: string]: string } = {
  'Football':      '⚽',
  'Basketball':    '🏀',
  'Tennis':        '🎾',
  'Running':       '🏃',
  'Cyclisme':      '🚴',
  'Natation':      '🏊',
  'Rugby':         '🏉',
  'Volleyball':    '🏐',
  'Fitness':       '💪',
  'Randonnée':     '🥾',
  'Arts martiaux': '🥋',
  'Yoga':          '🧘',
  'Padel':         '🏓',
  'Surf':          '🏄',
  'Ski':           '⛷️',
}

export default function MapScreen() {
  const {
    annonces, position, rayon, loading, error,
    annonceSelectee, setAnnonceSelectee,
    changerRayon, filtrerParSport, sportFiltre
  } = useMap()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E24B4A" />
        <Text style={styles.loadingText}>Récupération de ta position...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>

        {/* ─── Panneau gauche — liste des annonces ─── */}
        <View style={styles.leftPanel}>

          {/* Header */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Séances</Text>
            <Text style={styles.panelCount}>{annonces.length} résultat{annonces.length > 1 ? 's' : ''}</Text>
          </View>

          {/* Filtre rayon */}
          <View style={styles.rayonContainer}>
            <Text style={styles.filterLabel}>Rayon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.rayonBadges}>
                {RAYONS.map(function(r) {
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.rayonBadge, rayon === r && styles.rayonBadgeActive]}
                      onPress={function() { changerRayon(r) }}
                    >
                      <Text style={[styles.rayonBadgeText, rayon === r && styles.rayonBadgeTextActive]}>
                        {r} km
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
          </View>

          {/* Liste des annonces */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {annonces.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>Aucune séance dans ce rayon</Text>
              </View>
            ) : (
              annonces.map(function(annonce) {
                const isSelected = annonceSelectee && annonceSelectee.id === annonce.id
                return (
                  <TouchableOpacity
                    key={annonce.id}
                    style={[styles.annonceCard, isSelected && styles.annonceCardSelected]}
                    onPress={function() { setAnnonceSelectee(annonce) }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.annonceHeader}>
                      <Text style={styles.annonceEmoji}>
                        {SPORTS_EMOJIS[annonce.sport] || '🏃'}
                      </Text>
                      <View style={styles.annonceInfo}>
                        <Text style={styles.annonceTitre} numberOfLines={1}>
                          {annonce.titre}
                        </Text>
                        <Text style={styles.annonceSport}>{annonce.sport}</Text>
                      </View>
                    </View>
                    <View style={styles.annonceFooter}>
                      <Text style={styles.annonceVille}>📍 {annonce.ville}</Text>
                      <Text style={styles.annoncePlaces}>
                        {annonce.places} place{annonce.places > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })
            )}
          </ScrollView>
        </View>

        {/* ─── Carte droite ─── */}
        <View style={styles.mapContainer}>
          {position && (
            <MapView
              style={styles.map}
              initialRegion={position}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {/* Cercle du rayon */}
              <Circle
                center={{ latitude: position.latitude, longitude: position.longitude }}
                radius={rayon * 1000}
                fillColor="rgba(226, 75, 74, 0.08)"
                strokeColor="rgba(226, 75, 74, 0.3)"
                strokeWidth={1}
              />

              {/* Marqueurs des annonces */}
              {annonces.map(function(annonce) {
                const isSelected = annonceSelectee && annonceSelectee.id === annonce.id
                return (
                  <Marker
                    key={annonce.id}
                    coordinate={{
                      latitude:  annonce.latitude,
                      longitude: annonce.longitude,
                    }}
                    onPress={function() { setAnnonceSelectee(annonce) }}
                  >
                    <View style={[styles.marker, isSelected && styles.markerSelected]}>
                      <Text style={styles.markerEmoji}>
                        {SPORTS_EMOJIS[annonce.sport] || '🏃'}
                      </Text>
                    </View>
                  </Marker>
                )
              })}
            </MapView>
          )}

          {/* Détail de l'annonce sélectionnée */}
          {annonceSelectee && (
            <View style={styles.detailCard}>
              <TouchableOpacity
                style={styles.detailClose}
                onPress={function() { setAnnonceSelectee(null) }}
              >
                <Text style={styles.detailCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.detailTitre}>{annonceSelectee.titre}</Text>
              <Text style={styles.detailSport}>
                {SPORTS_EMOJIS[annonceSelectee.sport] || '🏃'} {annonceSelectee.sport} — {annonceSelectee.niveau}
              </Text>
              <Text style={styles.detailDescription} numberOfLines={2}>
                {annonceSelectee.description}
              </Text>
              <View style={styles.detailFooter}>
                <Text style={styles.detailVille}>📍 {annonceSelectee.ville}</Text>
                <Text style={styles.detailPlaces}>
                  {annonceSelectee.places} place{annonceSelectee.places > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          )}
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:                  { flex: 1, backgroundColor: '#fff' },
  loadingContainer:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:           { fontSize: 14, color: '#6B7280' },
  errorText:             { fontSize: 14, color: '#E24B4A', textAlign: 'center', padding: 24 },

  container:             { flex: 1, flexDirection: 'row' },

  // Panneau gauche
  leftPanel:             { width: '35%', borderRightWidth: 1, borderRightColor: '#F3F4F6', backgroundColor: '#fff' },
  panelHeader:           { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  panelTitle:            { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  panelCount:            { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Filtre rayon
  rayonContainer:        { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterLabel:           { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 8 },
  rayonBadges:           { flexDirection: 'row', gap: 6 },
  rayonBadge:            { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  rayonBadgeActive:      { backgroundColor: '#E24B4A', borderColor: '#E24B4A' },
  rayonBadgeText:        { fontSize: 12, color: '#6B7280' },
  rayonBadgeTextActive:  { color: '#fff', fontWeight: '600' },

  // Cards annonces
  annonceCard:           { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  annonceCardSelected:   { backgroundColor: '#FEF2F2' },
  annonceHeader:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  annonceEmoji:          { fontSize: 20 },
  annonceInfo:           { flex: 1 },
  annonceTitre:          { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  annonceSport:          { fontSize: 11, color: '#6B7280' },
  annonceFooter:         { flexDirection: 'row', justifyContent: 'space-between' },
  annonceVille:          { fontSize: 11, color: '#9CA3AF' },
  annoncePlaces:         { fontSize: 11, color: '#E24B4A', fontWeight: '500' },

  // Vide
  emptyContainer:        { padding: 24, alignItems: 'center', gap: 8 },
  emptyEmoji:            { fontSize: 32 },
  emptyText:             { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

  // Carte
  mapContainer:          { flex: 1 },
  map:                   { flex: 1 },

  // Marqueurs
  marker:                { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 2, borderColor: '#E24B4A', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  markerSelected:        { backgroundColor: '#E24B4A', borderColor: '#E24B4A' },
  markerEmoji:           { fontSize: 16 },

  // Détail annonce
  detailCard:            { position: 'absolute', bottom: 20, left: 12, right: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  detailClose:           { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  detailCloseText:       { fontSize: 12, color: '#6B7280' },
  detailTitre:           { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4, paddingRight: 24 },
  detailSport:           { fontSize: 13, color: '#E24B4A', fontWeight: '500', marginBottom: 6 },
  detailDescription:     { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 8 },
  detailFooter:          { flexDirection: 'row', justifyContent: 'space-between' },
  detailVille:           { fontSize: 12, color: '#9CA3AF' },
  detailPlaces:          { fontSize: 12, color: '#E24B4A', fontWeight: '500' },
})