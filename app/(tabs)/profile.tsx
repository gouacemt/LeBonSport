import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useTheme } from '@/hooks/useTheme'
import { Avatar } from '@/components/ui/Avatar'
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol'
import { Spacing } from '@/constants/theme'
import Header from '@/components/Header'
import { getSportIcon } from '@/constants/sportIcons'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useRef } from 'react'
import { ActivityIndicator, Animated, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { usePrenium } from '@/hooks/usePrenium'
type MenuItem = {
  icon: IconSymbolName
  label: string
  route?: string
  danger?: boolean
  action?: () => void
}

export default function ProfileScreen() {
  const { colors } = useTheme()
  const { session, sessionLoading } = useRequireAuth()
  const { profile, sports, loadProfile, loading, error } = useProfile()
  const { signOut } = useAuth()
  const stats = useDashboardStats(sports.length)
  const scrollY = useRef(new Animated.Value(0)).current
  const { isPremium } = usePrenium()
  useFocusEffect(useCallback(function() {loadProfile()}, []))

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  const sectionCompte: MenuItem[] = [
    {icon: 'pencil', label: 'Modifier le profil', route: '/(profile)/editProfile'},
    {icon: 'star.fill', label: 'Mes favoris',         route: '/(profile)/favoris'},
    {icon: 'bell.fill', label: 'Notifications',      route: '/(profile)/notificationsFeed'},
  ]

  const sectionAutres: MenuItem[] = [
    {icon: 'lock.fill', label: 'Confidentialité', route: '/(profile)/confidentialite'},
    {icon: 'questionmark.circle.fill', label: 'Aide',            route: '/(profile)/aide'},
  ]

  const renderItem = (item: MenuItem, index: number, total: number) => {
    const handlePress = () => {
      if (item.action) {
        item.action()
      } else if (item.route) {
        router.push(item.route as any)
      }
    }

    return (
      <TouchableOpacity
        key={item.label}
        style={[styles.menuItem, index < total - 1 && [styles.menuItemBorder, { borderBottomColor: colors.surfaceAlt }]]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <IconSymbol name={item.icon} size={20} color={item.danger ? colors.error : colors.textMuted} />
          <Text style={[styles.menuItemLabel, { color: colors.text }, item.danger && { color: colors.error, fontWeight: '600' }]}>
            {item.label}
          </Text>
        </View>
        {!item.danger && <IconSymbol name="chevron.right" size={18} color={colors.textSubtle} />}
      </TouchableOpacity>
    )
  }

  if (sessionLoading || !session || loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Header scrollY={scrollY} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Mon profil</Text>

          <View style={styles.avatarContainer}>
            <Avatar uri={profile?.avatar_url} name={profile?.prenom || profile?.nom} size={90} />
          </View>

          <Text style={styles.name}>
            {[profile?.prenom, profile?.nom].filter(Boolean).join(' ') || 'Mon profil'}
          </Text>

          {profile && profile.age && (
            <Text style={styles.age}>{profile.age} ans</Text>
          )}

          {profile && profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {sports.length > 0 && (
            <View style={styles.sportsRow}>
              {sports.map(function(sport) {
                return (
                  <View key={sport.id} style={styles.sportBadge}>
                    <IconSymbol name={getSportIcon(sport.nom)} size={13} color="#fff" />
                    <Text style={styles.sportBadgeText}>{sport.nom}</Text>
                  </View>
                )
              })}
            </View>
          )}

          <View style={styles.badgesRow}>
            {stats.badges.map((badge) => (
              <View key={badge.label} style={styles.badgeChip}>
                <IconSymbol name={badge.icon} size={13} color="#fff" />
                <Text style={styles.badgeChipText}>{badge.label}</Text>
              </View>
            ))}
          </View>
          {stats.memberSince && (
            <Text style={styles.memberSince}>Membre depuis {stats.memberSince}</Text>
          )}
        </LinearGradient>

        <View style={[styles.menuContainer, { backgroundColor: colors.background }]}>

          {error && (
            <Text style={[styles.error, { color: colors.error, backgroundColor: colors.errorBg }]}>{error}</Text>
          )}

        {/* Bannière premium — affichée uniquement si pas premium */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={function() { router.push('/(profile)/prenium' as any) }}
            activeOpacity={0.85}
          >
            <View style={styles.premiumBannerLeft}>
              <Text style={styles.premiumBannerEmoji}>⭐</Text>
              <View>
                <Text style={styles.premiumBannerTitre}>Passer Premium</Text>
                <Text style={styles.premiumBannerSub}>Badge vérifié · Priorité dans les résultats</Text>
              </View>
            </View>
            <View style={styles.premiumBannerBtn}>
              <Text style={styles.premiumBannerBtnText}>Voir</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Badge premium si déjà abonné */}
        {isPremium && (
          <View style={styles.premiumActif}>
            <Text style={styles.premiumActifText}>⭐ Abonnement Premium actif</Text>
          </View>
        )}

          <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>MON COMPTE</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            {sectionCompte.map(function(item, index) {
              return renderItem(item, index, sectionCompte.length)
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>PRÉFÉRENCES</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            {sectionAutres.map(function(item, index) {
              return renderItem(item, index, sectionAutres.length)
            })}
          </View>

          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={colors.error} />
                <Text style={[styles.menuItemLabel, { color: colors.error, fontWeight: '600' }]}>Se déconnecter</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:              {flex: 1},
  loadingContainer:  {flex: 1, justifyContent: 'center', alignItems: 'center'},

  header:            {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 74 : 118, paddingBottom: 32,paddingHorizontal: 24, alignItems: 'center'},
  headerTitle:       {fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.9)', alignSelf: 'flex-start', marginBottom: 20 },

  avatarContainer:   {marginBottom: 14 },

  name:              {fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4},
  age:               {fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 10},
  bio:               {fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginBottom: 14, paddingHorizontal: 16},

  sportsRow:         {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: Spacing.sm},
  sportBadge:        {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5},
  sportBadgeText:    {fontSize: 12, color: '#fff'},

  badgesRow:         {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: Spacing.sm},
  badgeChip:         {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5},
  badgeChipText:     {fontSize: 12, color: '#fff', fontWeight: '600'},
  memberSince:       {fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: Spacing.sm},

  menuContainer:     {borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40, minHeight: 400},
  sectionTitle:      {fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginTop: 8, paddingLeft: 4},
  menuCard:          {borderRadius: 16, marginBottom: 16, overflow: 'hidden'},
  menuItem:          {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16},
  menuItemBorder:    {borderBottomWidth: 1},
  menuItemLeft:      {flexDirection: 'row', alignItems: 'center', gap: 12},
  menuItemLabel:     {fontSize: 15},


  // Prenium 
  premiumBanner:        {backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  premiumBannerLeft:    {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  premiumBannerEmoji:   {fontSize: 24},
  premiumBannerTitre:   {fontSize: 14, fontWeight: 'bold', color: '#FFD700'},
  premiumBannerSub:     {fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2},
  premiumBannerBtn:     {backgroundColor: '#FFD700', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8},
  premiumBannerBtnText: {color: '#1a1a2e', fontWeight: 'bold', fontSize: 12},
  premiumActif:         {backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: '#FFD700', borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center'},
  premiumActifText:     {color: '#FFD700', fontWeight: '600', fontSize: 14},
  
  error:             {padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
})
