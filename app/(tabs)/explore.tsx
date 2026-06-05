import Header from "@/components/Header";
import { supabase } from "@/services/supabase";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const GREEN = "#16A06A";
const GREEN_LIGHT = "#F0FBF5";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_MUTED = "#9CA3AF";
const TEXT_SUB = "#6B7280";
const BG = "#F3F4F6";
const WHITE = "#FFFFFF";

const TYPE_LABELS: Record<string, string> = {
  club_recrute: "Club qui recrute",
  equipe_joueurs: "Équipe cherche joueurs",
  cherche_club: "Cherche un club",
  cherche_equipe: "Cherche une équipe",
  partie_ouverte: "Partie ouverte",
};


const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  club_recrute: { bg: "#EAF0FF", text: "#3B5BDB" },
  equipe_joueurs: { bg: "#F5EAF5", text: "#9B59B6" },
  cherche_club: { bg: "#E8F5F0", text: "#1A8C5B" },
  cherche_equipe: { bg: "#FFF8E1", text: "#F39C12" },
  partie_ouverte: { bg: "#FFF0E6", text: "#E67E22" },
};

const SPORT_FILTERS = [
  "Tous",
  "Football",
  "Padel",
  "Tennis",
  "Basketball",
  "Running",
  "Volleyball",
  "Natation",
  "Cyclisme",
];

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
  const typeColor = TYPE_COLORS[annonce.type] ?? {
    bg: GREEN_LIGHT,
    text: GREEN,
  };
  const date = new Date(annonce.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
          <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>
            {TYPE_LABELS[annonce.type] ?? annonce.type}
          </Text>
        </View>
        <Text style={styles.cardDate}>{date}</Text>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {annonce.titre}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={3}>
        {annonce.description}
      </Text>

      <View style={styles.cardTags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>⚽ {annonce.sport}</Text>
        </View>
        {annonce.niveau && annonce.niveau !== "Tous niveaux acceptés" && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>📊 {annonce.niveau}</Text>
          </View>
        )}
        <View style={styles.tag}>
          <Text style={styles.tagText}>📍 {annonce.ville}</Text>
        </View>
        {annonce.places && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              👤 {annonce.places} place{annonce.places > 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("Tous");

  const fetchAnnonces = useCallback(async () => {
    let query = supabase
      .from("annonces")
      .select("*")
      .order("created_at", { ascending: false });
    if (sportFilter !== "Tous") query = query.eq("sport", sportFilter);
    if (search.trim()) query = query.ilike("titre", `%${search.trim()}%`);
    const { data, error } = await query;
    if (!error && data) setAnnonces(data);
    setLoading(false);
    setRefreshing(false);
  }, [sportFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchAnnonces();
  }, [fetchAnnonces]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnonces();
  };

  return (
    <SafeAreaView style={styles.safe}>
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
              tintColor={GREEN}
            />
          }
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Explorer les annonces</Text>
            <Text style={styles.heroSub}>
              Trouvez votre prochain partenaire sportif
            </Text>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une annonce..."
                placeholderTextColor={TEXT_MUTED}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text style={{ color: TEXT_MUTED, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filtres */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {SPORT_FILTERS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterChip,
                  sportFilter === s && styles.filterChipActive,
                ]}
                onPress={() => setSportFilter(s)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sportFilter === s && styles.filterChipTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Résultats */}
          <View style={styles.results}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={GREEN}
                style={{ marginTop: 60 }}
              />
            ) : annonces.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🏃</Text>
                <Text style={styles.emptyTitle}>Aucune annonce trouvée</Text>
                <Text style={styles.emptySub}>
                  Soyez le premier à publier !
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push("/create-annonce")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyBtnText}>Créer une annonce</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.resultsCount}>
                  {annonces.length} annonce{annonces.length > 1 ? "s" : ""}
                </Text>
                <View style={styles.grid}>
                  {annonces.map((a) => (
                    <AnnonceCard key={a.id} annonce={a} />
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
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  hero: {
    backgroundColor: WHITE,
    paddingTop: 80,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: isWeb ? "center" : "flex-start",
  },
  heroTitle: {
    fontSize: isWeb ? 32 : 26,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 4,
  },
  heroSub: { fontSize: 15, color: TEXT_SUB, marginBottom: 16 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    width: isWeb ? 600 : "100%",
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: TEXT },

  filtersScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterChip: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  filterChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  filterChipText: { fontSize: 14, fontWeight: "500", color: TEXT_SUB },
  filterChipTextActive: { color: WHITE, fontWeight: "600" },

  results: { paddingHorizontal: 16, paddingTop: 4 },
  resultsCount: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 12,
    marginTop: 4,
  },
  grid: {
    flexDirection: isWeb ? "row" : "column",
    flexWrap: isWeb ? "wrap" : undefined,
    gap: 14,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    width: isWeb ? ("calc(50% - 7px)" as any) : "100%",
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
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeEmoji: { fontSize: 13 },
  typeBadgeText: { fontSize: 12, fontWeight: "600" },
  cardDate: { fontSize: 12, color: TEXT_MUTED },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
    lineHeight: 24,
  },
  cardDesc: { fontSize: 14, color: TEXT_SUB, lineHeight: 20, marginBottom: 12 },

  cardTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: BG,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: TEXT_SUB, fontWeight: "500" },

  empty: { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: TEXT, marginBottom: 8 },
  emptySub: { fontSize: 15, color: TEXT_MUTED, marginBottom: 24 },
  emptyBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyBtnText: { color: WHITE, fontWeight: "700", fontSize: 15 },
});
