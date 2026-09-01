import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
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
  icon:        IconSymbolName
  label:       string
  description: string
  champ:       'messages' | 'seances' | 'candidatures'
}

const items: NotifItem[] = [
  {
    icon:        'bubble.left.fill',
    label:       'Messages',
    description: 'Recevoir une notif quand quelqu\'un t\'envoie un message',
    champ:       'messages',
  },
  {
    icon:        'sport.running',
    label:       'Séances',
    description: 'Recevoir une notif quand une séance correspond à tes sports',
    champ:       'seances',
  },
  {
    icon:        'clipboard.fill',
    label:       'Candidatures',
    description: 'Recevoir une notif quand quelqu\'un postule à ta séance',
    champ:       'candidatures',
  },
]

export default function NotificationsScreen() {
  const { colors } = useTheme()
  const { settings, loading, error, FieldSetting } = useNotifications()

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

      <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>

        {error && <Text style={[styles.error, { color: colors.error, backgroundColor: colors.errorBg }]}>{error}</Text>}

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {items.map(function(item, index) {
            return (
              <View
                key={item.champ}
                style={[
                  styles.row,
                  index < items.length - 1 && [styles.rowBorder, { borderBottomColor: colors.surfaceAlt }],
                ]}
              >
                <View style={styles.rowLeft}>
                  <IconSymbol name={item.icon} size={20} color={colors.primary} />
                  <View style={styles.rowTexts}>
                    <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.description, { color: colors.textMuted }]}>{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={settings[item.champ]}
                  onValueChange={function() { FieldSetting(item.champ) }}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings[item.champ] ? colors.primary : colors.textSubtle}
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
  root:             {flex: 1},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  header:           {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 16 : 60, paddingBottom: 32, paddingHorizontal: 24},
  backButton:       {marginBottom: 16},
  backText:         {color: 'rgba(255,255,255,0.8)', fontSize: 16},
  title:            {fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8},
  subtitle:         {fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20},

  bottomSheet:      {flex: 1, borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24},

  card:             {borderRadius: 16, overflow: 'hidden'},
  row:              {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16},
  rowBorder:        {borderBottomWidth: 1},
  rowLeft:          {flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12, gap: 12},
  rowTexts:         {flex: 1 },
  label:            {fontSize: 15, fontWeight: '600', marginBottom: 2},
  description:      {fontSize: 12, lineHeight: 16},

  error:            {padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
})
