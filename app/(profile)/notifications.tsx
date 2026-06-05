import { useNotifications } from '@/hooks/useNotifications'
import { router } from 'expo-router'
import {
    ActivityIndicator,
    Platform,
    StatusBar,
    StyleSheet, Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native'

type NotifItem = {
  emoji:       string
  label:       string
  description: string
  champ:       'messages' | 'seances' | 'candidatures'
}

const items: NotifItem[] = [
  {
    emoji:       '💬',
    label:       'Messages',
    description: 'Recevoir une notif quand quelqu\'un t\'envoie un message',
    champ:       'messages',
  },
  {
    emoji:       '🏃',
    label:       'Séances',
    description: 'Recevoir une notif quand une séance correspond à tes sports',
    champ:       'seances',
  },
  {
    emoji:       '📋',
    label:       'Candidatures',
    description: 'Recevoir une notif quand quelqu\'un postule à ta séance',
    champ:       'candidatures',
  },
]

export default function NotificationsScreen() {
  const { settings, loading, error, FieldSetting } = useNotifications()

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

      {/* Header rouge */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={function() { router.back() }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Choisis les notifications que tu veux recevoir
        </Text>
      </View>

      {/* Bloc blanc */}
      <View style={styles.bottomSheet}>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.card}>
          {items.map(function(item, index) {
            return (
              <View
                key={item.champ}
                style={[
                  styles.row,
                  index < items.length - 1 && styles.rowBorder
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={styles.rowTexts}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={settings[item.champ]}
                  onValueChange={function() { FieldSetting(item.champ) }}
                  trackColor={{ false: '#E5E7EB', true: '#FCA5A5' }}
                  thumbColor={settings[item.champ] ? '#E24B4A' : '#9CA3AF'}
                />
              </View>
            )
          })}
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:             {flex: 1, backgroundColor: '#E24B4A'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  // Header rouge
  header:           {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 16 : 60, paddingBottom: 32, paddingHorizontal: 24},
  backButton:       {marginBottom: 16},
  backText:         {color: 'rgba(255,255,255,0.8)', fontSize: 16},
  title:            {fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8},
  subtitle:         {fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20},

  // Bloc blanc
  bottomSheet:      {flex: 1, backgroundColor: '#F3F4F6', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24},

  // Card
  card:             {backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden'},
  row:              {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16},
  rowBorder:        {borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  rowLeft:          {flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12},
  emoji:            {fontSize: 24, marginRight: 12},
  rowTexts:         {flex: 1 },
  label:            {fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2},
  description:      {fontSize: 12, color: '#6B7280', lineHeight: 16},

  // Erreur
  error:            {color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
})