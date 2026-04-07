import { useState } from 'react'
import {View, Text, TextInput, TouchableOpacity,StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image, StatusBar, ScrollView } from 'react-native'			  
import * as AppleAuthentication from 'expo-apple-authentication'
//import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { Link, router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const { signIn, signIn_Apple, /*signIn_Google,*/ loading, error } = useAuth()

  const handleLogin = async () => {
    const login_success = await signIn(email, password)
    if (login_success) router.replace('/(tabs)')
  }

  const handleLoginApple = async () => {
    const loginApple_success = await signIn_Apple()
    if (loginApple_success) router.replace('/(tabs)')
  }

  /*const handleLoginGoogle = async () => {
    const loginGoogle_success = await signIn_Google()
    if (loginGoogle_success) router.replace('/(tabs)')
  }*/

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
									 
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Image source={require('@/assets/images/Login_Sportif.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.appName}>LeBonSport</Text>
            <Text style={styles.appSubtitle}>Trouve ton partenaire sportif</Text>
          </View>
									
          <View style={styles.bottomSheet}>
            <Text style={styles.title}>Bon retour !</Text>
            <Text style={styles.subtitle}>Connecte-toi à ton compte</Text>

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

            <Link href="/forgot-password" style={styles.forgotLink}>
              Mot de passe oublié ?
            </Link>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >			
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={styles.appleButton}
                onPress={handleLoginApple}
              />
            )}

            {/* <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleLoginGoogle}
              disabled={loading}
              style={styles.button}
										  
            /> */}

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <Link href="/register" style={styles.registerLink}>
                S'inscrire
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
  topSection:    {alignItems: 'center', justifyContent: 'center', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 40) + 20 : 80, paddingBottom: 40, minHeight: 300},
  logoContainer: {width: 110, height: 110, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16},
  logoImage:     {width: 80, height: 80},
  appName:       {fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6},
  appSubtitle:   {fontSize: 14, color: 'rgba(255,255,255,0.8)'},
  bottomSheet:   {backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 32},
  title:         {fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4},
  subtitle:      {fontSize: 14, color: '#6B7280', marginBottom: 24},
  label:         {fontSize: 13, fontWeight: '500', color: '#6B7280', marginBottom: 6},
  input:         {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FAFAFA', marginBottom: 16, color: '#1a1a1a'},
  forgotLink:    {textAlign: 'right', color: '#E24B4A', fontSize: 13, fontWeight: '500', marginBottom: 24},
  button:        {backgroundColor: '#E24B4A', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16},
  buttonText:    {color: '#fff', fontWeight: '600', fontSize: 16},
  appleButton:   {width: '100%', height: 52, marginBottom: 16},
  error:         {color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
  registerRow:   {flexDirection: 'row', justifyContent: 'center', marginTop: 8},
  registerText:  {fontSize: 14, color: '#6B7280'},
  registerLink:  {fontSize: 14, color: '#E24B4A', fontWeight: '600'},
})