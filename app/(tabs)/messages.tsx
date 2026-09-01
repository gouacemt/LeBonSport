import Header from "@/components/Header";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Radius, Spacing } from "@/constants/theme";
import { ConversationListItem, useConversations } from "@/hooks/useConversations";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTheme } from "@/hooks/useTheme";
import { timeAgo } from "@/utils/format";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

const isWeb = Platform.OS === "web";

export default function MessagesScreen() {
  useRequireAuth();
  const { colors } = useTheme();
  const { conversations, loading, error, markAllRead } = useConversations();
  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      markAllRead();
    }, []),
  );

  const openConversation = (item: ConversationListItem) => {
    router.push({
      pathname: "/messages/[id]",
      params: { id: item.id, annonceTitre: item.annonceTitre, otherName: item.otherName },
    } as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <Header scrollY={scrollY} />

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          <ScreenHeader
            title="Messages"
            subtitle="Vos échanges avec les autres membres."
          />

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
            ) : (
              <View style={{ gap: Spacing.xs }}>
                {conversations.map((item) => (
                  <PressableScale
                    key={item.id}
                    style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => openConversation(item)}
                  >
                    <Avatar uri={item.otherAvatarUrl} name={item.otherName} size={46} />
                    <View style={styles.rowText}>
                      <View style={styles.rowHeader}>
                        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                          {item.otherName}
                        </Text>
                        <Text style={[styles.time, { color: colors.textSubtle }]}>
                          {timeAgo(item.lastMessageAt)}
                        </Text>
                      </View>
                      <Text style={[styles.annonce, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.annonceTitre}
                      </Text>
                      {item.lastMessagePreview ? (
                        <Text style={[styles.preview, { color: colors.textMuted }]} numberOfLines={1}>
                          {item.lastMessagePreview}
                        </Text>
                      ) : (
                        <Text style={[styles.preview, { color: colors.textSubtle }]} numberOfLines={1}>
                          Démarrez la conversation…
                        </Text>
                      )}
                    </View>
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
  name: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  time: { fontSize: 11 },
  annonce: { fontSize: 13, fontWeight: "500" },
  preview: { fontSize: 13 },
});
