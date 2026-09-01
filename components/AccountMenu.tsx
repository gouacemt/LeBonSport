import { Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "./ui/Avatar";
import { IconSymbol, IconSymbolName } from "./ui/icon-symbol";

const ITEMS: { icon: IconSymbolName; label: string; route: string }[] = [
  { icon: "person.fill", label: "Voir mon profil", route: "/(tabs)/profile" },
  { icon: "pencil", label: "Modifier le profil", route: "/(profile)/editProfile" },
  { icon: "clipboard.fill", label: "Mes annonces", route: "/(tabs)/mes-annonces" },
  { icon: "star.fill", label: "Mes favoris", route: "/(profile)/favoris" },
  { icon: "bell.fill", label: "Notifications", route: "/(profile)/notificationsFeed" },
  { icon: "lock.fill", label: "Confidentialité", route: "/(profile)/confidentialite" },
  { icon: "questionmark.circle.fill", label: "Aide", route: "/(profile)/aide" },
];

export function AccountMenu({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const { session, signOut } = useAuth();
  const { profile } = useProfile();

  const width = Math.min(360, Dimensions.get("window").width * 0.92);
  const slide = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
      mass: 0.8,
    }).start();
  }, [slide, width]);

  const close = () => {
    Animated.timing(slide, { toValue: width, duration: 160, useNativeDriver: true }).start(onClose);
  };

  const go = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const doSignOut = async () => {
    onClose();
    await signOut();
    router.replace("/(auth)/login");
  };

  const name = [profile?.prenom, profile?.nom].filter(Boolean).join(" ").trim() || "Mon compte";
  const email = session?.user?.email ?? "";

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Animated.View
          style={[
            styles.card,
            { width, backgroundColor: colors.surface, transform: [{ translateX: slide }] },
          ]}
        >
          {/* Empêche la fermeture au clic dans la carte */}
          <Pressable style={{ flex: 1 }} onPress={() => {}}>
            <View style={[styles.head, { borderBottomColor: colors.border }]}>
              <Avatar uri={profile?.avatar_url} name={name} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {name}
                </Text>
                {!!email && (
                  <Text style={[styles.email, { color: colors.textMuted }]} numberOfLines={1}>
                    {email}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={close} hitSlop={10}>
                <IconSymbol name="xmark" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {ITEMS.map((it) => (
                <TouchableOpacity
                  key={it.label}
                  style={[styles.item, { borderBottomColor: colors.surfaceAlt }]}
                  onPress={() => go(it.route)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name={it.icon} size={19} color={colors.textMuted} />
                  <Text style={[styles.itemLabel, { color: colors.text }]}>{it.label}</Text>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={colors.textSubtle}
                    style={styles.chevron}
                  />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.signout} onPress={doSignOut} activeOpacity={0.7}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={19} color={colors.error} />
                <Text style={[styles.itemLabel, { color: colors.error, fontWeight: "600" }]}>
                  Se déconnecter
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  card: {
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 16,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 28,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  name: { fontSize: 16, fontWeight: "800" },
  email: { fontSize: 13, marginTop: 2 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  chevron: { marginLeft: "auto" },
  itemLabel: { fontSize: 15 },
  signout: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 18,
    marginTop: Spacing.sm,
  },
});
