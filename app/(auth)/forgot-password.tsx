import { useState } from 'react'
import {Text, TextInput, TouchableOpacity,StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, View, StatusBar, ScrollView} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPasswordScreen() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const { resetPassword, loading, error } = useAuth()

  const handleReset = async () => {
    const resetPassword_sucess = await resetPassword(email)
    if (resetPassword_sucess) setSent(true)
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#E24B4A" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.title}>Mot de passe oublié</Text>

            {sent ? (
              <>
                <Text style={styles.registerText}>
                  Un email de réinitialisation a été envoyé à {email}
                </Text>
                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Mot de passse retrouvé ? </Text>
                  <Link href="/login" style={styles.registerLink}>
                    Retour à la connexion
                  </Link>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Entre ton email et on t'envoie un lien de réinitialisation.
                </Text>

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

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleReset}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Envoyer le lien</Text>
                  }
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Mot de passse retrouvé ? </Text>
                  <Link href="/login" style={styles.registerLink}>
                    Retour à la connexion
                  </Link>
                </View>
              </>
            )}
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