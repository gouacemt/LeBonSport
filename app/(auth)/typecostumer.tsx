import {View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar} from 'react-native'
import { Link, router } from 'expo-router'

export default function TypeProfilScreen() {

  const handleChoix = (type: 'sportif' | 'coach' | 'club') => {
    router.push({
      pathname: '/(auth)/register',
      params: { type },
    })
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#16A06A" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Quel type de compte veux-tu créer ?</Text>

            <TouchableOpacity
              style={styles.card}
              onPress={function() { handleChoix('club') }}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>🏟️</Text>
              <View style={styles.cardTexts}>
                <Text style={styles.cardLabel}>Club de sport</Text>
                <Text style={styles.cardDescription}>Je représente un club et cherche des membres</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={function() { handleChoix('coach') }}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>🏋️</Text>
              <View style={styles.cardTexts}>
                <Text style={styles.cardLabel}>Coach</Text>
                <Text style={styles.cardDescription}>Je propose des séances d'entraînement collectives</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={function() { handleChoix('sportif') }}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>🏃</Text>
              <View style={styles.cardTexts}>
                <Text style={styles.cardLabel}>Sportif</Text>
                <Text style={styles.cardDescription}>Je cherche des partenaires ou des séances</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Déjà un compte ? </Text>
              <Link href="/(auth)/login" style={styles.registerLink}>
                Se connecter
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:            {flex: 1, backgroundColor: '#16A06A'},
  keyboardView:    {flex: 1},
  scrollContent:   {flexGrow: 1, justifyContent: 'flex-end'},
  bottomSheet:     {backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 32},
  title:           {fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4},
  subtitle:        {fontSize: 14, color: '#6B7280', marginBottom: 24},
  card:            {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, marginBottom: 12, gap: 12},
  cardEmoji:       {fontSize: 32},
  cardTexts:       {flex: 1},
  cardLabel:       {fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2},
  cardDescription: {fontSize: 12, color: '#6B7280'},
  cardArrow:       {fontSize: 22, color: '#16A06A'},
  registerRow:     {flexDirection: 'row', justifyContent: 'center', marginTop: 16},
  registerText:    {fontSize: 14, color: '#6B7280'},
  registerLink:    {fontSize: 14, color: '#16A06A', fontWeight: '600'},
})