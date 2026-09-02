import Header from "@/components/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PressableScale } from "@/components/ui/PressableScale";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { getSportIcon } from "@/constants/sportIcons";
import { Radius, Spacing } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/services/supabase";
import { ANNONCE_TYPE_LABELS, timeAgo } from "@/utils/format";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const isWeb = Platform.OS === "web";

type MyAnnonce = {
  id: string;
  created_at: string;
  type: string;
  sport: string;
  niveau: string | null;
  titre: string;
  ville: string;
  places: number | null;
};

export default function MesAnnoncesScreen() {
  const { colors } = useTheme();
  const { session, sessionLoading } = useRequireAuth();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [annonces, setAnnonces] = useState<MyAnnonce[]>([]);
  const [pendingByAnnonce, setPendingByAnnonce] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMine = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setAnnonces([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const { data } = await supabase
      .from("annonces")
      .select("id, created_at, type, sport, niveau, titre, ville, places")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const list = (data ?? []) as MyAnnonce[];
    setAnnonces(list);

    if (list.length > 0) {
      const { data: cands } = await supabase
        .from("candidatures")
        .select("annonce_id")
        .eq("statut", "en_attente")
        .in("annonce_id", list.map((a) => a.id));
      const counts: Record<string, number> = {};
      for (const c of (cands ?? []) as { annonce_id: string }[]) {
        counts[c.annonce_id] = (counts[c.annonce_id] ?? 0) + 1;
      }
      setPendingByAnnonce(counts);
    } else {
      setPendingByAnnonce({});
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMine();
    }, [fetchMine]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMine();
  };

  const confirmDelete = (annonce: MyAnnonce) => {
    const doDelete = async () => {
      setDeletingId(annonce.id);
      const { error } = await supabase.from("annonces").delete().eq("id", annonce.id);
      setDeletingId(null);
      if (error) {
        if (Platform.OS === "web") window.alert("Suppression impossible : " + error.message);
        else Alert.alert("Erreur", error.message);
        return;
      }
      setAnnonces((prev) => prev.filter((a) => a.id !== annonce.id));
    };

    if (isWeb) {
      if (window.confirm(`Supprimer « ${annonce.titre} » ?`)) doDelete();
    } else {
      Alert.alert("Supprimer l'annonce", `« ${annonce.titre} » sera définitivement supprimée.`, [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  if (sessionLoading || !session) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.root}>
        <Header scrollY={scrollY} />
        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <ScreenHeader
            title="Mes annonces"
            subtitle={
              annonces.length > 0
                ? `Vous avez ${annonces.length} annonce${annonces.length > 1 ? "s" : ""} en ligne.`
                : "Gérez les annonces que vous avez publiées."
            }
          />

          <View style={styles.publishWrap}>
            <Button
              label="Publier une annonce"
              icon="plus.circle.fill"
              onPress={() => router.push("/create-annonce")}
              style={styles.publishBtn}
            />
          </View>

          <View style={styles.body}>
            {loading ? (
              <View style={{ gap: Spacing.md }}>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </View>
            ) : annonces.length === 0 ? (
              <EmptyState
                icon="clipboard.fill"
                title="Aucune annonce publiée"
                subtitle="Publiez votre première annonce pour trouver des partenaires, une équipe ou un club."
                ctaLabel="Publier une annonce"
                onCta={() => router.push("/create-annonce")}
              />
            ) : (
              <View style={{ gap: Spacing.sm }}>
                {annonces.map((a) => {
                const meta = [a.ville, a.niveau, a.places ? `${a.places} place${a.places > 1 ? "s" : ""}` : null]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <PressableScale
                    key={a.id}
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => router.push(`/annonce/${a.id}` as any)}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: colors.primaryLight }]}>
                      <IconSymbol name={getSportIcon(a.sport)} size={20} color={colors.primaryDark} />
                    </View>
                    <View style={styles.cardBody}>
                      <Badge label={ANNONCE_TYPE_LABELS[a.type] ?? a.type} variant="success" />
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {a.titre}
                      </Text>
                      <Text style={[styles.cardMeta, { color: colors.textMuted }]} numberOfLines={1}>
                        {meta}
                      </Text>
                      <Text style={[styles.cardDate, { color: colors.textSubtle }]}>
                        Publiée {timeAgo(a.created_at)}
                      </Text>
                      {pendingByAnnonce[a.id] > 0 && (
                        <View style={[styles.candBadge, { backgroundColor: colors.primaryLight }]}>
                          <IconSymbol name="person.fill" size={12} color={colors.primaryDark} />
                          <Text style={[styles.candBadgeText, { color: colors.primaryDark }]}>
                            {pendingByAnnonce[a.id]} candidature{pendingByAnnonce[a.id] > 1 ? "s" : ""} en attente
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      hitSlop={10}
                      onPress={() => confirmDelete(a)}
                      disabled={deletingId === a.id}
                    >
                      {deletingId === a.id ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <IconSymbol name="trash.fill" size={18} color={colors.textSubtle} />
                      )}
                    </TouchableOpacity>
                  </PressableScale>
                );
              })}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: isWeb ? 82 : 100, paddingBottom: 40 },

  publishWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  publishBtn: { alignSelf: isWeb ? "flex-start" : "stretch" },
  body: { paddingHorizontal: Spacing.lg },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, gap: 4, paddingRight: 24 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardMeta: { fontSize: 12 },
  cardDate: { fontSize: 11, marginTop: 2 },
  candBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
  candBadgeText: { fontSize: 11, fontWeight: "700" },
  deleteBtn: { position: "absolute", top: Spacing.md, right: Spacing.md, padding: 4 },
});
