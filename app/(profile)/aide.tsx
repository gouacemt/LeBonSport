import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform
} from 'react-native'
import { router } from 'expo-router'

export default function AideScreen() {
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
        <Text style={styles.title}>Aide</Text>
        <Text style={styles.subtitle}>Comment utiliser LeBonSport ?</Text>
      </View>

      <ScrollView style={styles.bottomSheet} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <Text style={styles.intro}>
            Retrouve ici les réponses aux questions les plus fréquentes sur l'utilisation de l'application.
          </Text>

          {/* Premiers pas */}
          <Text style={styles.h2}>🚀 Premiers pas</Text>
          <Text style={styles.p}>
            LeBonSport est une application de mise en relation sportive. Après ton inscription, sélectionne tes sports favoris pour personnaliser ton fil d'annonces.
          </Text>
          <Text style={styles.p}>
            Tu peux ensuite consulter les séances disponibles près de chez toi, postuler pour rejoindre un groupe, ou publier ta propre annonce.
          </Text>

          {/* Publier une annonce */}
          <Text style={styles.h2}>📋 Publier une annonce</Text>
          <Text style={styles.p}>
            Pour publier une annonce, appuie sur l'icône "+" dans la barre de navigation.
          </Text>
          <Text style={styles.p}>
            Remplis les informations de ta séance : sport, niveau, ville, nombre de places disponibles et une description. Ton annonce sera visible par tous les utilisateurs à proximité.
          </Text>

          {/* Postuler */}
          <Text style={styles.h2}>✉️ Postuler à une séance</Text>
          <Text style={styles.p}>
            Consulte les annonces disponibles dans l'onglet Accueil ou sur la Carte.
          </Text>
          <Text style={styles.p}>
            Appuie sur une annonce pour voir ses détails, puis appuie sur "Postuler". L'organisateur recevra ta candidature et pourra l'accepter ou la refuser. Tu seras notifié de la décision.
          </Text>

          {/* Messagerie */}
          <Text style={styles.h2}>💬 La messagerie</Text>
          <Text style={styles.p}>
            Une fois ta candidature acceptée, tu peux échanger des messages avec l'organisateur via la messagerie intégrée.
          </Text>
          <Text style={styles.p}>
            Les messages sont envoyés et reçus en temps réel.
          </Text>

          {/* Carte */}
          <Text style={styles.h2}>🗺️ La carte</Text>
          <Text style={styles.p}>
            L'onglet Carte affiche toutes les séances disponibles autour de toi.
          </Text>
          <Text style={styles.p}>
            Tu peux régler le rayon de recherche (5, 10, 20 ou 50 km) et appuyer sur un marqueur pour voir les détails de l'annonce.
          </Text>

          {/* Profil */}
          <Text style={styles.h2}>👤 Mon profil</Text>
          <Text style={styles.p}>
            Accède à ton profil depuis l'onglet Profil en bas de l'écran.
          </Text>
          <Text style={styles.p}>
            Tu peux modifier tes informations personnelles (prénom, nom, âge, bio) et mettre à jour tes sports favoris depuis la section "Modifier le profil".
          </Text>

          {/* Notifications */}
          <Text style={styles.h2}>🔔 Les notifications</Text>
          <Text style={styles.p}>
            Tu peux gérer tes préférences de notifications depuis Profil → Notifications.
          </Text>
          <Text style={styles.p}>
            Tu peux activer ou désactiver les notifications pour les messages, les nouvelles séances et les candidatures.
          </Text>

          {/* Sécurité */}
          <Text style={styles.h2}>🔒 Sécurité et confidentialité</Text>
          <Text style={styles.p}>
            Tes données sont protégées conformément au RGPD.
          </Text>
          <Text style={styles.p}>
            Tu peux consulter notre politique de confidentialité complète depuis Profil → Confidentialité.
          </Text>

          {/* Contact */}
          <Text style={styles.h2}>📞 Nous contacter</Text>
          <Text style={styles.p}>
            Une question non résolue par ce guide ?
          </Text>
          <Text style={styles.p}>
            Écris-nous à : contact@lebonsport.fr
          </Text>
          <Text style={styles.p}>
            Nous répondons généralement sous 48 heures ouvrées.
          </Text>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:       {flex: 1, backgroundColor: '#16A06A'},
  header:     {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 16 : 60, paddingBottom: 32, paddingHorizontal: 24},
  backButton: {marginBottom: 16},
  backText:   {color: 'rgba(255,255,255,0.8)', fontSize: 16},
  title:      {fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8},
  subtitle:   {fontSize: 14, color: 'rgba(255,255,255,0.8)'},
  bottomSheet:{flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36},
  content:    {padding: 24, paddingBottom: 48},
  intro:      {fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 24},
  h2:         {fontSize: 16, fontWeight: 'bold', color: '#16A06A', marginTop: 24, marginBottom: 8},
  p:          {fontSize: 13, color: '#4B5563', lineHeight: 22, marginBottom: 8},
})