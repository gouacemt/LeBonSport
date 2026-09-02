import { AccountMenu } from "@/components/AccountMenu";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HeaderProps {
  scrollY: Animated.Value;
}

const NAV_ITEMS = [
  { label: "Accueil", href: "/(tabs)" },
  { label: "Annonces", href: "/(tabs)/explore" },
  { label: "Map", href: "/(tabs)/map" },
];

const AUTH_NAV_ITEMS = [
  { label: "Mes annonces", href: "/(tabs)/mes-annonces" },
  { label: "Messages", href: "/(tabs)/messages" },
];

export default function Header({ scrollY }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { session } = useAuth();
  const { hasUnread } = useUnreadMessages();
  const [menuOpen, setMenuOpen] = useState(false);

  const shadowOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0.06, 0.15],
    extrapolate: "clamp",
  });

  const initial = session?.user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <Animated.View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          shadowOpacity,
          ...(Platform.OS === "web" &&
            ({ backdropFilter: "blur(12px)" } as any)),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.logo}
        onPress={() => router.push("/(tabs)")}
        activeOpacity={0.8}
      >
        <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoMarkText}>S</Text>
        </View>
        <Text style={[styles.logoText, { color: colors.text }]}>
          LeBonSport
        </Text>
      </TouchableOpacity>

      {Platform.OS === "web" && (
        <View style={styles.nav}>
          {[...NAV_ITEMS, ...(session ? AUTH_NAV_ITEMS : [])].map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/(tabs)" && pathname === "/");
            return (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.navItem,
                  isActive && { backgroundColor: colors.primary },
                ]}
                onPress={() => router.push(item.href as any)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.navText,
                    { color: isActive ? "#fff" : colors.textMuted },
                    isActive && { fontWeight: "600" },
                  ]}
                >
                  {item.label}
                </Text>
                {item.label === "Messages" && hasUnread && (
                  <View style={[styles.navUnreadDot, { backgroundColor: colors.error }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.right}>
        {session ? (
          <TouchableOpacity onPress={() => setMenuOpen(true)} activeOpacity={0.8}>
            <Avatar name={initial} size={36} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Connexion</Text>
          </TouchableOpacity>
        )}
      </View>

      {menuOpen && <AccountMenu onClose={() => setMenuOpen(false)} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 4,
  },

  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navItem: {
    position: "relative",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navText: {
    fontSize: 15,
    fontWeight: "500",
  },
  navUnreadDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loginBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
