import { useSports } from '@/hooks/useSports'
import { router } from 'expo-router'
import { ActivityIndicator, FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function SportsScreen() {
  const {sports, selected, loading, saving, error, SportChoice, saveSports} = useSports()

  const handleSave = async () => {
    const success = await saveSports()
    if (success) router.replace('/(tabs)')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E24B4A" />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#E24B4A" />

      <View style={styles.header}>
        <Text style={styles.step}>Etape 1 sur 1</Text>
        <Text style={styles.title}>Tes sports préférés</Text>
        <Text style={styles.subtitle}>
          Sélectionne les sports qui t'intéressent pour personnaliser ton fil d'annonces
        </Text>
      </View>

      <View style={styles.bottomSheet}>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* Badges des sports sélectionnés */}
        {selected.length > 0 && (
          <View style={styles.selectedBadges}>
            {selected.map(id => {
              const sport = sports.find(s => s.id === id)
              return sport ? (
                <View key={id} style={styles.badge}>
                  <Text style={styles.badgeText}>{sport.emoji} {sport.nom}</Text>
                </View>
              ) : null
            })}
          </View>
        )}

        {/* Grille de sports */}
        <FlatList
          data={sports}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id)
            return (
              <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => SportChoice(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                  {item.nom}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
          keyExtractor={item => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>
                {selected.length > 0
                  ? `Continuer (${selected.length} sport${selected.length > 1 ? 's' : ''})`
                  : 'Continuer →'
                }
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skip}>Passer cette étape</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:             {flex: 1, backgroundColor: '#E24B4A'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header:           {paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 40) + 20 : 60, paddingBottom: 32},
  step:             {fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6},
  title:            {fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8},
  subtitle:         {fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20},
  bottomSheet:      {backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 32},
  bottomSheetTop:   {backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingTop: 20, paddingHorizontal: 20},
  selectedBadges:   {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  badge:            {backgroundColor: '#FEE2E2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6},
  badgeText:        {fontSize: 12, color: '#991B1B', fontWeight: '600'},
  grid:             {backgroundColor: '#fff', paddingHorizontal: 20},
  row:              {justifyContent: 'space-between', marginBottom: 10},
  card:             {width: '31%', aspectRatio: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', position: 'relative'},
  cardSelected:     {borderWidth: 2, borderColor: '#E24B4A', backgroundColor: '#FEE2E2'},
  emoji:            {fontSize: 28, marginBottom: 6},
  cardText:         {fontSize: 11, color: '#6B7280', textAlign: 'center'},
  cardTextSelected: {color: '#991B1B', fontWeight: '600'},
  checkmark:        {position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#E24B4A', alignItems: 'center', justifyContent: 'center'},
  checkmarkText:    {color: '#fff', fontSize: 10, fontWeight: 'bold'},
  footer:           {backgroundColor: '#fff', padding: 20, paddingBottom: 40},
  button:           {backgroundColor: '#E24B4A', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12},
  buttonText:       {color: '#fff', fontWeight: '600', fontSize: 16},
  skip:             {textAlign: 'center', color: '#9CA3AF', fontSize: 14},
  error:            {color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
})