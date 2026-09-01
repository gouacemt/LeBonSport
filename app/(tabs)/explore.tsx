import Header from "@/components/Header";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PressableScale } from "@/components/ui/PressableScale";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { NIVEAUX } from "@/constants/options";
import { getSportIcon } from "@/constants/sportIcons";
import { Radius, Spacing } from "@/constants/theme";
import { useFavoris } from "@/hooks/useFavoris";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSports } from "@/hooks/useSports";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/services/supabase";
import { router, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const isWeb = Platform.OS === "web";

const TYPE_LABELS: Record<string, string> = {
  club_recrute: "Club qui recrute",
  equipe_joueurs: "Équipe cherche joueurs",
  cherche_club: "Cherche un club",
  cherche_equipe: "Cherche une équipe",
  partie_ouverte: "Partie ouverte",
};

interface Annonce {
  id: string;
  created_at: string;
  type: string;
  sport: string;
  niveau: string;
  titre: string;
  description: string;
  ville: string;
  club: string | null;
  places: number | null;
  telephone: string | null;
}

function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const { colors } = useTheme();
  const { isFavori, toggleFavori } = useFavoris();
  const favori = isFavori(annonce.id);
  const date = new Date(annonce.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <PressableScale
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/annonce/${annonce.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Badge label={TYPE_LABELS[annonce.type] ?? annonce.type} variant="success" />
        <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
          <Text style={[styles.cardDate, { color: colors.textMuted }]}>{date}</Text>
          <TouchableOpacity onPress={() => toggleFavori(annonce.id)} hitSlop={8}>
            <IconSymbol name={favori ? "heart.fill" : "heart"} size={20} color={favori ? colors.error : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {annonce.titre}
      </Text>
      <Text style={[styles.cardDesc, { color: colors.textMuted }]} numberOfLines={3}>
        {annonce.description}
      </Text>

      <View style={styles.cardTags}>
        <Tag icon={getSportIcon(annonce.sport)} label={annonce.sport} color={colors.textMuted} backgroundColor={colors.surfaceAlt} />
        {annonce.niveau && annonce.niveau !== "Tous niveaux acceptés" && (
          <Tag icon="chart.bar.fill" label={annonce.niveau} color={colors.textMuted} backgroundColor={colors.surfaceAlt} />
        )}
        <Tag icon="mappin.and.ellipse" label={annonce.ville} color={colors.textMuted} backgroundColor={colors.surfaceAlt} />
        {annonce.places && (
          <Tag
            icon="person.fill"
            label={`${annonce.places} place${annonce.places > 1 ? "s" : ""}`}
            color={colors.textMuted}
            backgroundColor={colors.surfaceAlt}
          />
        )}
      </View>
    </PressableScale>
  );
}

export default function ExploreScreen() {
  const { colors } = useTheme();
  const routerNav = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { session, sessionLoading } = useRequireAuth();
  const { sports } = useSports();
  const params = useLocalSearchParams<{ sport?: string }>();

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState(params.sport || "Tous");
  const [niveauFilter, setNiveauFilter] = useState("Tous");

  useEffect(() => {
    if (params.sport) setSportFilter(params.sport);
  }, [params.sport]);

  const fetchAnnonces = useCallback(async () => {
    let query = supabase
      .from("annonces")
      .select("*")
      .order("created_at", { ascending: false });
    if (sportFilter !== "Tous") query = query.eq("sport", sportFilter);
    if (search.trim()) {
      const s = search.trim();
      query = query.or(`titre.ilike.%${s}%,description.ilike.%${s}%,ville.ilike.%${s}%`);
    }
    const { data, error } = await query;
    let results = !error && data ? data : [];
    if (niveauFilter !== "Tous") {
      results = results.filter((a) => a.niveau === niveauFilter);
    }
    setAnnonces(results);
    setLoading(false);
    setRefreshing(false);
  }, [sportFilter, niveauFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchAnnonces();
  }, [fetchAnnonces]);

  useFocusEffect(
    useCallback(() => {
      fetchAnnonces();
    }, [fetchAnnonces])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnonces();
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
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={[styles.hero, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Explorer les annonces</Text>
            <Text style={[styles.heroSub, { color: colors.textMuted }]}>
              Trouvez votre prochain partenaire sportif
            </Text>
            <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <IconSymbol name="magnifyingglass" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Rechercher (titre, description, ville)..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {["Tous", ...sports.map((s) => s.nom)].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  sportFilter === s && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setSportFilter(s)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.textMuted },
                    sportFilter === s && { color: "#fff", fontWeight: "600" },
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filtersScroll, { paddingTop: 0 }]}
          >
            {["Tous", ...NIVEAUX].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.filterChipSm,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  niveauFilter === n && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                ]}
                onPress={() => setNiveauFilter(n)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipTextSm,
                    { color: colors.textMuted },
                    niveauFilter === n && { color: colors.primaryDark, fontWeight: "600" },
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.results}>
            {loading ? (
              <View style={styles.grid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.skeletonCardWrap}>
                    <SkeletonCard />
                  </View>
                ))}
              </View>
            ) : annonces.length === 0 ? (
              <EmptyState
                icon="sport.running"
                title="Aucune annonce trouvée"
                subtitle="Soyez le premier à publier !"
                ctaLabel="Créer une annonce"
                onCta={() => routerNav.push("/create-annonce")}
              />
            ) : (
              <>
                <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
                  {annonces.length} annonce{annonces.length > 1 ? "s" : ""}
                </Text>
                <View style={styles.grid}>
                  {annonces.map((a) => (
                    <View key={a.id} style={styles.cardWrap}>
                      <AnnonceCard annonce={a} />
                    </View>
                  ))}
                </View>
              </>
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
  scrollContent: { paddingBottom: 40 },

  hero: {
    paddingTop: 80,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: isWeb ? "center" : "flex-start",
  },
  heroTitle: { fontSize: isWeb ? 32 : 26, fontWeight: "800", marginBottom: 4 },
  heroSub: { fontSize: 15, marginBottom: 16 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    width: isWeb ? 600 : "100%",
  },
  searchInput: { flex: 1, fontSize: 15 },

  filtersScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 14, fontWeight: "500" },
  filterChipSm: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterChipTextSm: { fontSize: 12, fontWeight: "500" },

  results: { paddingHorizontal: 16, paddingTop: 4 },
  resultsCount: { fontSize: 13, marginBottom: 12, marginTop: 4 },
  grid: {
    flexDirection: isWeb ? "row" : "column",
    flexWrap: isWeb ? "wrap" : undefined,
    gap: 14,
  },
  cardWrap: { width: isWeb ? ("calc(50% - 7px)" as any) : "100%" },
  skeletonCardWrap: { width: isWeb ? ("calc(50% - 7px)" as any) : "100%" },

  card: {
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardDate: { fontSize: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8, lineHeight: 24 },
  cardDesc: { fontSize: 14, lineHeight: 20, marginBottom: 12 },

  cardTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
