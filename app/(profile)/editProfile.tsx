import { useEditProfile } from '@/hooks/useEditProfile'
import { useSports } from '@/hooks/useSports'
import { useTheme } from '@/hooks/useTheme'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spacing } from '@/constants/theme'
import { router } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function EditProfileScreen() {
  const { colors } = useTheme()
  const { form, loading, saving, error, updateField, saveProfile } = useEditProfile()
  const { sports, selected, SportChoice, saveSports } = useSports()

  const handleSave = async () => {
    const successProfil = await saveProfile()
    if (!successProfil) return

    await saveSports()

    router.back()
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹ Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Modifier le profil</Text>
          </View>

          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>

            {error && <Text style={[styles.error, { color: colors.error, backgroundColor: colors.errorBg }]}>{error}</Text>}

            <View style={styles.avatarSection}>
              <Avatar name={form.prenom || form.nom || '?'} size={90} />
            </View>

            <Text style={[styles.label, { color: colors.textMuted }]}>Prénom</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, color: colors.text }]}
              value={form.prenom}
              onChangeText={function(valeur) {updateField('prenom', valeur)}}
              placeholder="Ton prénom"
              placeholderTextColor={colors.textSubtle}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Nom</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, color: colors.text }]}
              value={form.nom}
              onChangeText={function(valeur) {updateField('nom', valeur)}}
              placeholder="Ton nom"
              placeholderTextColor={colors.textSubtle}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Âge</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, color: colors.text }]}
              value={form.age}
              onChangeText={function(valeur) {updateField('age', valeur)}}
              placeholder="Ton âge"
              placeholderTextColor={colors.textSubtle}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, color: colors.text }]}
              value={form.bio}
              onChangeText={function(valeur) {updateField('bio', valeur)}}
              placeholder="Parle de toi en quelques mots..."
              placeholderTextColor={colors.textSubtle}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tes sports</Text>
            <View style={styles.sportsGrid}>
              {sports.map(function(sport) {
                const isSelected = selected.includes(sport.id)
                return (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.sportCard,
                      { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                      isSelected && { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryLight },
                    ]}
                    onPress={function() { SportChoice(sport.id) }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                    <Text style={[
                      styles.sportNom,
                      { color: colors.textMuted },
                      isSelected && { color: colors.primaryDark, fontWeight: '600' },
                    ]}>
                      {sport.nom}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Button label="Sauvegarder" onPress={handleSave} loading={saving} />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:              {flex: 1},
  loadingContainer:  {flex: 1, justifyContent: 'center', alignItems: 'center'},
  keyboardView:      {flex: 1},
  header:            {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 16 : 60, paddingBottom: 32, paddingHorizontal: 24},
  backButton:        {marginBottom: 16},
  backText:          {color: 'rgba(255,255,255,0.8)', fontSize: 16},
  title:             {fontSize: 26, fontWeight: 'bold', color: '#fff'},
  bottomSheet:       {borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 48},

  avatarSection:     {alignItems: 'center', marginBottom: Spacing.xl},

  label:             {fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input:             {borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16},
  inputMultiline:    {height: 100, textAlignVertical: 'top'},

  sectionTitle:      {fontSize: 15, fontWeight: '600', marginBottom: 14, marginTop: 4},
  sportsGrid:        {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24},
  sportCard:         {width: '30%', aspectRatio: 1, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  sportEmoji:        {fontSize: 24, marginBottom: 4},
  sportNom:          {fontSize: 10, textAlign: 'center'},

  error:             {padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
})
