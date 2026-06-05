import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { router, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { ActivityIndicator, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// Type pour les items du menu
type MenuItem = {
  emoji: string
  label: string
  route?: string
  danger?: boolean
  action?: () => void
}

export default function ProfileScreen() {
  const { profile, sports, loadProfile, loading, error } = useProfile()
  const { signOut } = useAuth()
  useFocusEffect(useCallback(function() {loadProfile()}, []))

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }
  
  // ─── Men,u des paramètres du profil ───────────────────────────────────────
  const sectionCompte: MenuItem[] = [
    {emoji: '✏️', label: 'Modifier le profil', route: '/(profile)/editProfile'},
    {emoji: '📋', label: 'Mes annonces',       route: '/(profile)/annonces'},
    {emoji: '🔔', label: 'Notifications',      route: '/(profile)/notifications'},
  ]

  const sectionAutres: MenuItem[] = [
    {emoji: '🔒', label: 'Confidentialité', route: '/(profile)/confidentialite'},
    {emoji: '❓', label: 'Aide',            route: '/(profile)/aide'},
  ]

  // ─── Rendu d'un item de menu ─────────────────────────────────
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
        style={[styles.menuItem, index < total - 1 && styles.menuItemBorder ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
          <Text style={[styles.menuItemLabel, item.danger && styles.menuItemDanger]}>
            {item.label}
          </Text>
        </View>
        {item.danger === true ? null : (
          <Text style={styles.menuItemArrow}>›</Text>
        )}
      </TouchableOpacity>
    )
  }

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ─── Header rouge ────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile && profile.avatar_url ? (
              <Image
                source={{uri: profile.avatar_url}}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
          </View>

          {/* Nom + âge */}
          <Text style={styles.name}>
            {profile && profile.prenom ? profile.prenom : ''}{' '}
            {profile && profile.nom ? profile.nom : ''}
            {(!profile || (!profile.nom && !profile.prenom)) && 'Mon profil'}
          </Text>

          {profile && profile.age && (
            <Text style={styles.age}>{profile.age} ans</Text>
          )}

          {/* Bio */}
          {profile && profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {/* Sports favoris */}
          {sports.length > 0 && (
            <View style={styles.sportsRow}>
              {sports.map(function(sport) {
                return (
                  <View key={sport.id} style={styles.sportBadge}>
                    <Text style={styles.sportBadgeText}>
                      {sport.emoji} {sport.nom}
                    </Text>
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* ─── Bloc gris — menu ────────────────────────────── */}
        <View style={styles.menuContainer}>

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          {/* Section Mon compte */}
          <Text style={styles.sectionTitle}>MON COMPTE</Text>
          <View style={styles.menuCard}>
            {sectionCompte.map(function(item, index) {
              return renderItem(item, index, sectionCompte.length)
            })}
          </View>

          {/* Section Autres */}
          <Text style={styles.sectionTitle}>AUTRES</Text>
          <View style={styles.menuCard}>
            {sectionAutres.map(function(item, index) {
              return renderItem(item, index, sectionAutres.length)
            })}
          </View>

          {/* Déconnexion */}
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemEmoji}>🚪</Text>
                <Text style={styles.menuItemDanger}>Se déconnecter</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:              {flex: 1, backgroundColor: '#E24B4A' },
  loadingContainer:  {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  header:            {paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 16 : 60, paddingBottom: 32,paddingHorizontal: 24, alignItems: 'center'},
  headerTitle:       {fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.9)', alignSelf: 'flex-start', marginBottom: 20 },

  // Avatar
  avatarContainer:   {marginBottom: 14 },
  avatar:            {width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff'},
  avatarPlaceholder: {width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  avatarEmoji:       {fontSize: 36 },

  // Infos profil
  name:              {fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4},
  age:               {fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 10},
  bio:               {fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginBottom: 14, paddingHorizontal: 16},

  // Sports badges
  sportsRow:         {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8},
  sportBadge:        {backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5},
  sportBadgeText:    {fontSize: 12, color: '#fff'},

  // Menu
  menuContainer:     {backgroundColor: '#F3F4F6', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40, minHeight: 400},
  sectionTitle:      {fontSize: 11, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8, marginTop: 8, paddingLeft: 4},
  menuCard:          {backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden'},
  menuItem:          {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16},
  menuItemBorder:    {borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  menuItemLeft:      {flexDirection: 'row', alignItems: 'center', gap: 12},
  menuItemEmoji:     {fontSize: 20 },
  menuItemLabel:     {fontSize: 15, color: '#1a1a1a'},
  menuItemDanger:    {fontSize: 15, color: '#E24B4A', fontWeight: '600'},
  menuItemArrow:     {fontSize: 20, color: '#9CA3AF'},

  // Erreur
  error:             {color: '#991B1B', backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14},
})