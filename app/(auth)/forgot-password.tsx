import { useState } from 'react'
import {Text, TextInput, TouchableOpacity,StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, View, StatusBar, ScrollView} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

export default function ForgotPasswordScreen() {
  const { colors } = useTheme()
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const { resetPassword, loading, error } = useAuth()

  const handleReset = async () => {
    const resetPassword_sucess = await resetPassword(email)
    if (resetPassword_sucess) setSent(true)
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>Mot de passe oublié</Text>

            {sent ? (
              <>
                <Text style={[styles.registerText, { color: colors.textMuted }]}>
                  Un email de réinitialisation a été envoyé à {email}
                </Text>
                <View style={styles.registerRow}>
                  <Text style={[styles.registerText, { color: colors.textMuted }]}>Mot de passe retrouvé ? </Text>
                  <Link href="/login" style={[styles.registerLink, { color: colors.primary }]}>
                    Retour à la connexion
                  </Link>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Entre ton email et on t’envoie un lien de réinitialisation.
                </Text>

                {error && <Text style={[styles.error, { color: colors.error, backgroundColor: colors.errorBg }]}>{error}</Text>}

                <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSubtle}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleReset}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Envoyer le lien</Text>
                  }
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={[styles.registerText, { color: colors.textMuted }]}>Mot de passe retrouvé ? </Text>
                  <Link href="/login" style={[styles.registerLink, { color: colors.primary }]}>
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
  root:          {flex: 1},
  keyboardView:  {flex: 1},
  scrollContent: {flexGrow: 1, justifyContent: 'flex-end'},
  bottomSheet:   {borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 32},
  title:         {fontSize: 24, fontWeight: 'bold', marginBottom: 4},
  subtitle:      {fontSize: 14, marginBottom: 24},
  label:         {fontSize: 13, fontWeight: '500', marginBottom: 6},
  input:         {borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16},
  button:        {borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16},
  buttonText:    {color: '#fff', fontWeight: '600', fontSize: 16},
  error:         {padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
  registerRow:   {flexDirection: 'row', justifyContent: 'center', marginTop: 8},
  registerText:  {fontSize: 14},
  registerLink:  {fontSize: 14, fontWeight: '600'},
})
