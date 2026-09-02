import Header from "@/components/Header";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PressableScale } from "@/components/ui/PressableScale";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Radius, Spacing } from "@/constants/theme";
import { ConversationListItem, useConversations } from "@/hooks/useConversations";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTheme } from "@/hooks/useTheme";
import { timeAgo } from "@/utils/format";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const isWeb = Platform.OS === "web";

export default function MessagesScreen() {
  useRequireAuth();
  const { colors } = useTheme();
  const { conversations, loading, error, reload, markAllRead, totalUnread } = useConversations();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [query, setQuery] = useState("");

  // On rafraîchit en revenant sur l'écran ; la lecture se fait à l'ouverture
  // de chaque conversation, pas au simple survol de la liste.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const openConversation = (item: ConversationListItem) => {
    router.push({
      pathname: "/messages/[id]",
      params: {
        id: item.id,
        annonceId: item.annonceId,
        annonceTitre: item.annonceTitre,
        otherName: item.otherName,
        otherAvatarUrl: item.otherAvatarUrl ?? "",
      },
    } as any);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.otherName.toLowerCase().includes(q) ||
        c.annonceTitre.toLowerCase().includes(q) ||
        (c.lastMessagePreview ?? "").toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const subtitle =
    totalUnread > 0
      ? `${totalUnread} message${totalUnread > 1 ? "s" : ""} non lu${totalUnread > 1 ? "s" : ""}`
      : "Vos échanges avec les autres membres.";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <Header scrollY={scrollY} />

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          <ScreenHeader
            title="Messages"
            subtitle={subtitle}
            right={
              totalUnread > 0 ? (
                <TouchableOpacity onPress={markAllRead} hitSlop={8}>
                  <Text style={[styles.markRead, { color: colors.primary }]}>Tout marquer lu</Text>
                </TouchableOpacity>
              ) : undefined
            }
          />

          {!loading && !error && conversations.length > 0 && (
            <View style={styles.searchWrap}>
              <View style={[styles.search, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <IconSymbol name="magnifyingglass" size={18} color={colors.textSubtle} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Rechercher une conversation…"
                  placeholderTextColor={colors.textSubtle}
                  style={[styles.searchInput, { color: colors.text }]}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                    <IconSymbol name="xmark" size={16} color={colors.textSubtle} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.list}>
            {loading ? (
              <View style={{ gap: Spacing.md }}>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </View>
            ) : error ? (
              <EmptyState
                icon="bubble.left.fill"
                title="Impossible de charger vos messages"
                subtitle="Vérifiez votre connexion et réessayez dans un instant."
              />
            ) : conversations.length === 0 ? (
              <EmptyState
                icon="bubble.left.fill"
                title="Pas encore de conversation"
                subtitle="Contactez l'auteur d'une annonce qui vous intéresse pour démarrer la discussion."
                ctaLabel="Parcourir les annonces"
                onCta={() => router.push("/(tabs)/explore")}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="magnifyingglass"
                title="Aucun résultat"
                subtitle={`Rien ne correspond à « ${query.trim()} ».`}
              />
            ) : (
              <View style={{ gap: Spacing.xs }}>
                {filtered.map((item) => (
                  <PressableScale
                    key={item.id}
                    style={[
                      styles.row,
                      {
                        backgroundColor: item.unread ? colors.primaryLight : colors.surface,
                        borderColor: item.unread ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => openConversation(item)}
                  >
                    <Avatar uri={item.otherAvatarUrl} name={item.otherName} size={46} />

                    <View style={styles.rowText}>
                      <View style={styles.rowHeader}>
                        <Text
                          style={[styles.name, { color: colors.text }, item.unread && styles.nameUnread]}
                          numberOfLines={1}
                        >
                          {item.otherName}
                        </Text>
                        <Text style={[styles.time, { color: item.unread ? colors.primary : colors.textSubtle }]}>
                          {timeAgo(item.lastMessageAt)}
                        </Text>
                      </View>

                      <Text style={[styles.annonce, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.annonceTitre}
                      </Text>

                      <View style={styles.previewRow}>
                        <Text
                          style={[
                            styles.preview,
                            { color: item.unread ? colors.text : colors.textMuted },
                            item.unread && styles.previewUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {item.lastMessagePreview || "Démarrez la conversation…"}
                        </Text>
                        {item.unreadCount > 0 && (
                          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.badgeText}>{item.unreadCount > 99 ? "99+" : item.unreadCount}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {item.annoncePhoto ? (
                      <Image source={{ uri: item.annoncePhoto }} style={styles.thumb} />
                    ) : null}
                  </PressableScale>
                ))}
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  scrollContent: { paddingTop: isWeb ? 82 : 100, paddingBottom: 40 },

  markRead: { fontSize: 13, fontWeight: "700" },

  searchWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  list: { paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  rowText: { flex: 1, gap: 3 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: Spacing.sm },
  name: { fontSize: 15, fontWeight: "600", flexShrink: 1 },
  nameUnread: { fontWeight: "800" },
  time: { fontSize: 11, fontWeight: "500" },
  annonce: { fontSize: 13, fontWeight: "500" },

  previewRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  preview: { fontSize: 13, flex: 1 },
  previewUnread: { fontWeight: "600" },

  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  thumb: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: "#0001" },
});
