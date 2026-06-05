import { useEditProfile } from '@/hooks/useEditProfile'
import { useSports } from '@/hooks/useSports'
import { router } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function EditProfileScreen() {
  const { form, loading, saving, error, updateField, saveProfile } = useEditProfile()
  const { sports, selected, SportChoice, saveSports, loadUserSports } = useSports()

  const handleSave = async () => {
    // Sauvegarde le profil
    const successProfil = await saveProfile()
    if (!successProfil) return

    // Sauvegarde les sports
    await saveSports()

    router.back()
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header rouge */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹ Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Modifier le profil</Text>
          </View>

          {/* Bloc blanc */}
          <View style={styles.bottomSheet}>

            {error && <Text style={styles.error}>{error}</Text>}

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.avatarChange}>Changer la photo</Text>
              </TouchableOpacity>
            </View>

            {/* Prénom */}
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={form.prenom}
              onChangeText={function(valeur) {updateField('prenom', valeur)}}
              placeholder="Ton prénom"
              placeholderTextColor="#9CA3AF"
            />

            {/* Nom */}
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={form.nom}
              onChangeText={function(valeur) {updateField('nom', valeur)}}
              placeholder="Ton nom"
              placeholderTextColor="#9CA3AF"
            />

            {/* Âge */}
            <Text style={styles.label}>Âge</Text>
            <TextInput
              style={styles.input}
              value={form.age}
              onChangeText={function(valeur) {updateField('age', valeur)}}
              placeholder="Ton âge"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            {/* Bio */}
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.bio}
              onChangeText={function(valeur) {updateField('bio', valeur)}}
              placeholder="Parle de toi en quelques mots..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />

            {/* Sports favoris */}
            <Text style={styles.sectionTitle}>Tes sports</Text>
            <View style={styles.sportsGrid}>
              {sports.map(function(sport) {
                const isSelected = selected.includes(sport.id)
                return (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.sportCard,
                      isSelected && styles.sportCardSelected
                    ]}
                    onPress={function() { SportChoice(sport.id) }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                    <Text style={[
                      styles.sportNom,
                      isSelected && styles.sportNomSelected
                    ]}>
                      {sport.nom}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Bouton sauvegarder */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sauvegarder</Text>}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:              {flex: 1, backgroundColor: '#E24B4A'},
  loadingContainer:  {flex: 1, justifyContent: 'center', alignItems: 'center'},
  keyboardView:      {flex: 1},
  header:            {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 16 : 60, paddingBottom: 32, paddingHorizontal: 24},
  backButton:        {marginBottom: 16},
  backText:          {color: 'rgba(255,255,255,0.8)', fontSize: 16},
  title:             {fontSize: 26, fontWeight: 'bold', color: '#fff'},
  bottomSheet:       {backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 48},

  // Avatar
  avatarSection:     {alignItems: 'center', marginBottom: 28},
  avatarPlaceholder: {width: 90, height: 90, borderRadius: 45, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 10},
  avatarEmoji:       {fontSize: 36},
  avatarChange:      {fontSize: 14, color: '#E24B4A', fontWeight: '500'},

  // Champs
  label:             {fontSize: 13, fontWeight: '500', color: '#6B7280', marginBottom: 6 },
  input:             {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FAFAFA', marginBottom: 16, color: '#1a1a1a'},
  inputMultiline:    {height: 100, textAlignVertical: 'top'},

  // Sports
  sectionTitle:      {fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 14, marginTop: 4},
  sportsGrid:        {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24},
  sportCard:         {width: '30%', aspectRatio: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA'},
  sportCardSelected: {borderWidth: 2, borderColor: '#E24B4A', backgroundColor: '#FEE2E2'},
  sportEmoji:        {fontSize: 24, marginBottom: 4},
  sportNom:          {fontSize: 10, color: '#6B7280', textAlign: 'center'},
  sportNomSelected:  {color: '#991B1B', fontWeight: '600'},

  // Bouton
  button:            {backgroundColor: '#E24B4A', borderRadius: 12, padding: 16, alignItems: 'center'},
  buttonText:        {color: '#fff', fontWeight: '600', fontSize: 16},
  error:             {color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
})