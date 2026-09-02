import { Card } from '@/components/ui/Card'
import { Radius, Spacing } from '@/constants/theme'
import { useConfidentialite } from '@/hooks/useConfidentialite'
import { useTheme } from '@/hooks/useTheme'
import { router } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const isWeb = Platform.OS === 'web'

const SECTIONS = [
  {
    title: 'Responsable du traitement',
    body: "LeBonSport (projet étudiant). Pour toute question relative à vos données : contact via l'écran d'aide.",
  },
  {
    title: 'Données collectées',
    body: "Adresse e-mail (authentification), profil (nom, prénom, âge, bio, photo, sports et niveau), annonces publiées, favoris, candidatures, messages échangés et paramètres de notification.",
  },
  {
    title: 'Finalités',
    body: "Faire fonctionner la mise en relation entre sportifs : afficher votre profil et vos annonces, permettre la messagerie et les candidatures, personnaliser les recommandations. Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales.",
  },
  {
    title: 'Base légale',
    body: "Exécution du service auquel vous souscrivez en créant un compte (article 6.1.b du RGPD).",
  },
  {
    title: 'Hébergement & durée',
    body: "Données hébergées chez Supabase (UE). Elles sont conservées tant que votre compte est actif, puis supprimées lors de la suppression du compte.",
  },
  {
    title: 'Sécurité',
    body: "Chaque table est protégée par des règles d'accès (Row Level Security) : vous seul pouvez modifier vos informations, et vos messages ne sont visibles que par les participants d'une conversation.",
  },
  {
    title: 'Vos droits',
    body: "Accès et portabilité (bouton « Exporter mes données » ci-dessous), rectification (écran d'édition du profil), effacement (bouton « Supprimer mon compte » ci-dessous). L'effacement est immédiat et définitif.",
  },
]

export default function ConfidentialiteScreen() {
  const { colors } = useTheme()
  const { loading, exporting, error, deleteAccount, exportData } = useConfidentialite()
  const [exported, setExported] = useState<string | null>(null)

  const handleExport = async () => {
    const json = await exportData()
    if (!json) return
    if (isWeb) {
      setExported(json)
      try {
        await navigator.clipboard.writeText(json)
      } catch {
        /* le bloc affiché reste copiable à la main */
      }
    } else {
      await Share.share({ message: json })
    }
  }

  const handleDelete = () => {
    const run = async () => {
      const ok = await deleteAccount()
      if (ok) router.replace('/(auth)/login')
    }
    if (isWeb) {
      if (window.confirm('Supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible.')) {
        run()
      }
    } else {
      Alert.alert(
        'Supprimer mon compte',
        'Votre compte et toutes vos données (annonces, messages, candidatures) seront définitivement supprimés.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: run },
        ],
      )
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.text, fontSize: 16 }}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Confidentialité</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{s.body}</Text>
          </Card>
        ))}

        {!!error && (
          <Text style={[styles.sectionBody, { color: colors.error }]}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.action, { borderColor: colors.border }]}
          onPress={handleExport}
          disabled={exporting}
          activeOpacity={0.8}
        >
          {exporting ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.actionText, { color: colors.text }]}>Exporter mes données (JSON)</Text>
          )}
        </TouchableOpacity>

        {exported && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vos données (copiées dans le presse-papier)</Text>
            <ScrollView horizontal style={{ marginTop: 6 }}>
              <Text style={[styles.code, { color: colors.textMuted }]}>{exported}</Text>
            </ScrollView>
          </Card>
        )}

        <TouchableOpacity
          style={[styles.action, styles.danger, { borderColor: colors.error }]}
          onPress={handleDelete}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={[styles.actionText, { color: colors.error }]}>Supprimer mon compte</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  sectionBody: { fontSize: 14, lineHeight: 21 },
  action: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  danger: { marginTop: Spacing.sm, marginBottom: Spacing.xl },
  actionText: { fontSize: 15, fontWeight: '700' },
  code: { fontSize: 11, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
})
