import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  scrollY: Animated.Value
}

const NAV_ITEMS = [
  { label: 'Accueil',  href: '/(tabs)'          },
  { label: 'Explorer', href: '/(tabs)/explore'   },
  { label: 'Créer',    href: '/create-annonce'            },
]

export default function Header({ scrollY }: HeaderProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const { session, signOut } = useAuth()

  // Background : transparent → blanc au scroll
  const bgColor = scrollY.interpolate({
  inputRange: [0, 120],
  outputRange: ['rgba(255,255,255,1)', 'rgba(255,255,255,0.82)'],
  extrapolate: 'clamp',
})

const shadowOpacity = scrollY.interpolate({
  inputRange: [0, 120],
  outputRange: [0.06, 0.15],
  extrapolate: 'clamp',
})

const logoColor = scrollY.interpolate({
  inputRange: [0, 80],
  outputRange: ['#0F1F17', '#0F1F17'],
  extrapolate: 'clamp',
})

const navColor = scrollY.interpolate({
  inputRange: [0, 80],
  outputRange: ['#374151', '#374151'],
  extrapolate: 'clamp',
})
  

  const initial = session?.user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <Animated.View style={[
      styles.header,
      {
        backgroundColor: bgColor,
        shadowOpacity,
        ...(Platform.OS === 'web' && { backdropFilter: 'blur(12px)' } as any),
      }
    ]}>

      {/* ── Logo ── */}
      <TouchableOpacity style={styles.logo} onPress={() => router.push('/(tabs)')} activeOpacity={0.8}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoIconText}>S</Text>
        </View>
        <Animated.Text style={[styles.logoText, { color: logoColor }]}>
          LeBonSport
        </Animated.Text>
      </TouchableOpacity>

      {/* ── Nav (web uniquement) ── */}
      {Platform.OS === 'web' && (
        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href === '/(tabs)' && pathname === '/')
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(item.href as any)}
                activeOpacity={0.8}
              >
                {isActive
                  ? <Text style={styles.navTextActive}>{item.label}</Text>
                  : <Animated.Text style={[styles.navText, { color: navColor }]}>{item.label}</Animated.Text>
                }
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {/* ── Right ── */}
      <View style={styles.right}>
        {/* Icône recherche */}
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Animated.Text style={[styles.iconText, { color: navColor }]}>🔍</Animated.Text>
        </TouchableOpacity>

        {/* Avatar utilisateur */}
        {session ? (
          <TouchableOpacity style={styles.avatar} onPress={signOut} activeOpacity={0.8}>
            <Text style={styles.avatarText}>{initial}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Connexion</Text>
          </TouchableOpacity>
        )}
      </View>

    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    zIndex:          100,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 24,
    paddingVertical:   14,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowRadius:    12,
    elevation:       4,
  },

  // Logo
  logo: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  logoIcon: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: '#16A06A',
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoIconText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   18,
  },
  logoText: {
    fontSize:   18,
    fontWeight: '700',
  },

  // Nav
  nav: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical:    8,
    borderRadius:      10,
  },
  navItemActive: {
    backgroundColor: '#16A06A',
  },
  navText: {
    fontSize:   15,
    fontWeight: '500',
  },
  navTextActive: {
    fontSize:   15,
    fontWeight: '600',
    color:      '#fff',
  },

  // Right
  right: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  iconBtn: {
    padding: 6,
  },
  iconText: {
    fontSize: 18,
  },
  avatar: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#E8F5F0',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1.5,
    borderColor:     '#16A06A',
  },
  avatarText: {
    color:      '#16A06A',
    fontWeight: '700',
    fontSize:   15,
  },
  loginBtn: {
    backgroundColor:  '#16A06A',
    borderRadius:     10,
    paddingVertical:   8,
    paddingHorizontal: 16,
  },
  loginBtnText: {
    color:      '#fff',
    fontWeight: '600',
    fontSize:   14,
  },
})
