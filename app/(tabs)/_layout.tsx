import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/useTheme';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

const isWeb = Platform.OS === 'web';

function MessagesTabIcon({ color }: { color: string }) {
  const { colors } = useTheme();
  const { hasUnread } = useUnreadMessages();

  return (
    <View>
      <IconSymbol size={26} name="bubble.left.fill" color={color} />
      {hasUnread && <View style={[styles.unreadDot, { backgroundColor: colors.error, borderColor: colors.surface }]} />}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        // Sur web : pas de barre d'onglets (navigation via le Header), mais les
        // routes restent actives pour être joignables via router.push.
        tabBarStyle: isWeb
          ? { display: 'none' }
          : { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Annonces',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mes-annonces"
        options={{
          title: 'Mes annonces',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="clipboard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessagesTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="mappin.and.ellipse" color={color} />,
        }}
      />

      {/* Routes accessibles hors barre d'onglets */}
      <Tabs.Screen name="create-annonce" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
