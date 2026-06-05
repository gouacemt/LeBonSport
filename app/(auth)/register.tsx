import { useState } from 'react'
import {View, Text, TextInput, TouchableOpacity,StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar} from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const { signUp, loading, error } = useAuth()

  const handleRegister = async () => {
    if (password !== confirm) return alert('Les mots de passe ne correspondent pas')
    const signUp_sucess = await signUp(email, password)
    if (signUp_sucess) router.replace('/(tabs)')
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#E24B4A" />
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
            <Text style={styles.subtitle}>Rejoins la communauté LeBonSport</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>S'inscrire</Text>
              }
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Déjà un compte ? </Text>
              <Link href="/login" style={styles.registerLink}>
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
  root:          {flex: 1, backgroundColor: '#E24B4A'},
  keyboardView:  {flex: 1},
  scrollContent: {flexGrow: 1, justifyContent: 'flex-end'},
  bottomSheet:   {backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 32},
  title:         {fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4},
  subtitle:      {fontSize: 14, color: '#6B7280', marginBottom: 24},
  label:         {fontSize: 13, fontWeight: '500', color: '#6B7280', marginBottom: 6},
  input:         {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FAFAFA', marginBottom: 16, color: '#1a1a1a'},
  button:        {backgroundColor: '#E24B4A', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16},
  buttonText:    {color: '#fff', fontWeight: '600', fontSize: 16},
  error:         {color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
  registerRow:   {flexDirection: 'row', justifyContent: 'center', marginTop: 8},
  registerText:  {fontSize: 14, color: '#6B7280'},
  registerLink:  {fontSize: 14, color: '#E24B4A', fontWeight: '600'},
})