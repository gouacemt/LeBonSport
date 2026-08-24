import {View, Text, StyleSheet, ScrollView,TouchableOpacity, StatusBar, Platform, Alert, ActivityIndicator} from 'react-native'
import {router} from 'expo-router'
import {useConfidentialite} from '@/hooks/useConfidentialite'

export default function ConfidentialiteScreen() {
  const {loading, error, deleteAccount} = useConfidentialite()

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes tes données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAccount()
            if (success) {
              router.replace('/(auth)/login')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#16A06A" />

      {/* Header rouge */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={function() { router.back() }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confidentialité</Text>
        <Text style={styles.subtitle}>Politique de confidentialité et CGU</Text>
      </View>

      <ScrollView style={styles.bottomSheet} showsVerticalScrollIndicator={false}>

        {/* CGU */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Conditions Générales d'Utilisation</Text>
          <Text style={styles.sectionDate}>Dernière mise à jour : janvier 2025</Text>

          <Text style={styles.articleTitle}>1. Objet</Text>
          <Text style={styles.articleText}>
            Les présentes CGU régissent l'utilisation de l'application mobile LeBonSport. En utilisant l'application, vous acceptez sans réserve les présentes CGU.
          </Text>

          <Text style={styles.articleTitle}>2. Description du service</Text>
          <Text style={styles.articleText}>
            LeBonSport est une plateforme de mise en relation entre sportifs amateurs, coachs et clubs sportifs permettant la publication et la consultation d'annonces de séances sportives.
          </Text>

          <Text style={styles.articleTitle}>3. Accès au service</Text>
          <Text style={styles.articleText}>
            L'accès à LeBonSport est réservé aux personnes majeures (18 ans ou plus). La création d'un compte est nécessaire pour accéder à l'ensemble des fonctionnalités.
          </Text>

          <Text style={styles.articleTitle}>4. Comportement des utilisateurs</Text>
          <Text style={styles.articleText}>
            L'utilisateur s'engage à utiliser l'application de manière loyale. Sont interdits : la publication de contenus illicites, le harcèlement et toute utilisation commerciale non autorisée.
          </Text>

          <Text style={styles.articleTitle}>5. Responsabilité</Text>
          <Text style={styles.articleText}>
            LeBonSport agit en tant qu'intermédiaire et ne peut être tenu responsable des interactions entre utilisateurs.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Politique de confidentialité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Politique de confidentialité</Text>
          <Text style={styles.sectionDate}>Conforme au RGPD — Règlement (UE) 2016/679</Text>

          <Text style={styles.articleTitle}>1. Données collectées</Text>
          <Text style={styles.articleText}>
            {'• Données d\'identification : email, prénom, nom\n• Données de profil : âge, bio, photo\n• Données sportives : sports favoris, niveau\n• Données de localisation : position GPS (avec consentement)\n• Données de connexion : logs, type d\'appareil'}
          </Text>

          <Text style={styles.articleTitle}>2. Finalités du traitement</Text>
          <Text style={styles.articleText}>
            {'• Créer et gérer votre compte\n• Vous mettre en relation avec d\'autres sportifs\n• Personnaliser votre expérience\n• Assurer la sécurité de la plateforme'}
          </Text>

          <Text style={styles.articleTitle}>3. Conservation des données</Text>
          <Text style={styles.articleText}>
            Vos données sont conservées pendant toute la durée de votre inscription. En cas de suppression de compte, vos données sont effacées sous 30 jours.
          </Text>

          <Text style={styles.articleTitle}>4. Vos droits</Text>
          <Text style={styles.articleText}>
            {'Conformément au RGPD, vous disposez des droits d\'accès, de rectification, d\'effacement, de portabilité et d\'opposition.\n\nContact : contact@lebonsport.fr'}
          </Text>

          <Text style={styles.articleTitle}>5. Hébergement</Text>
          <Text style={styles.articleText}>
            Vos données sont hébergées par Supabase (infrastructure AWS en Europe). Toutes les communications sont chiffrées via HTTPS/TLS.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Suppression du compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Supprimer mon compte</Text>
          <Text style={styles.articleText}>
            La suppression de votre compte entraîne l'effacement définitif de toutes vos données : profil, annonces, messages et candidatures. Cette action est irréversible.
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#16A06A" />
              : <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:             {flex: 1, backgroundColor: '#16A06A'},
  header:           {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 16 : 60, paddingBottom: 32, paddingHorizontal: 24},
  backButton:       {marginBottom: 16},
  backText:         {color: 'rgba(255,255,255,0.8)', fontSize: 16},
  title:            {fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8},
  subtitle:         {fontSize: 14, color: 'rgba(255,255,255,0.8)'},
  bottomSheet:      {flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36},
  section:          {padding: 24},
  sectionTitle:     {fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4},
  sectionDate:      {fontSize: 12, color: '#9CA3AF', marginBottom: 16},
  articleTitle:     {fontSize: 14, fontWeight: '600', color: '#16A06A', marginTop: 16, marginBottom: 6},
  articleText:      {fontSize: 13, color: '#4B5563', lineHeight: 22},
  divider:          {height: 8, backgroundColor: '#F3F4F6'},
  deleteButton:     {backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#16A06A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20},
  deleteButtonText: {color: '#16A06A', fontWeight: '600', fontSize: 15},
  error:            {color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginTop: 12, fontSize: 14},
})