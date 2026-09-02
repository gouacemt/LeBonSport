import Header from "@/components/Header";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PressableScale } from "@/components/ui/PressableScale";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { NIVEAUX } from "@/constants/options";
import { getSportIcon } from "@/constants/sportIcons";
import { Radius, Spacing } from "@/constants/theme";
import { useFavoris } from "@/hooks/useFavoris";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSports } from "@/hooks/useSports";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/services/supabase";
import { timeAgo } from "@/utils/format";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const isWeb = Platform.OS === "web";

type Annonce = {
  id: string;
  created_at: string;
  type: string;
  sport: string;
  niveau: string | null;
  titre: string;
  description: string;
  ville: string;
  club: string | null;
  places: number | null;
  telephone: string | null;
  user_id: string | null;
};

type AuthorLite = { prenom: string | null; nom: string | null; avatar_url: string | null };

const TYPE_META: Record<string, { label: string; fg: string; bg: string }> = {
  club_recrute: { label: "Club recrute", fg: "#0D7A4F", bg: "#E8F5F0" },
  equipe_joueurs: { label: "Équipe cherche", fg: "#0D7A4F", bg: "#E8F5F0" },
  cherche_club: { label: "Cherche un club", fg: "#3B5BDB", bg: "#EAF0FF" },
  cherche_equipe: { label: "Cherche une équipe", fg: "#3B5BDB", bg: "#EAF0FF" },
  partie_ouverte: { label: "Partie ouverte", fg: "#B26A00", bg: "#FFF4E0" },
};

const TYPE_FILTERS = [
  { key: "Tous", label: "Tous les types" },
  { key: "club_recrute", label: "Club recrute" },
  { key: "equipe_joueurs", label: "Équipe cherche" },
  { key: "cherche_club", label: "Cherche un club" },
  { key: "cherche_equipe", label: "Cherche une équipe" },
  { key: "partie_ouverte", label: "Partie ouverte" },
];

const SORTS = [
  { key: "recent", label: "Plus récentes" },
  { key: "places", label: "Plus de places" },
  { key: "alpha", label: "Ordre A→Z" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

function AnnonceRow({
  annonce,
  author,
}: {
  annonce: Annonce;
  author?: AuthorLite;
}) {
  const { colors } = useTheme();
  const { isFavori, toggleFavori } = useFavoris();
  const favori = isFavori(annonce.id);
  const tm = TYPE_META[annonce.type] ?? { label: annonce.type, fg: colors.textMuted, bg: colors.surfaceAlt };
  const isNew = Date.now() - new Date(annonce.created_at).getTime() < 24 * 3600 * 1000;
  const authorName = author ? [author.prenom, author.nom].filter(Boolean).join(" ").trim() : "";

  return (
    <PressableScale
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/annonce/${annonce.id}` as any)}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
        <IconSymbol name={getSportIcon(annonce.sport)} size={22} color={colors.primaryDark} />
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowTagLine}>
          <View style={[styles.typeTag, { backgroundColor: tm.bg }]}>
            <Text style={[styles.typeTagText, { color: tm.fg }]}>{tm.label}</Text>
          </View>
          {isNew && (
            <View style={[styles.newTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.newTagText}>NOUVEAU</Text>
            </View>
          )}
        </View>

        <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
          {annonce.titre}
        </Text>

        <View style={styles.pillRow}>
          <Pill icon="mappin.and.ellipse" text={annonce.ville} colors={colors} />
          <Pill text={annonce.sport} colors={colors} />
          {annonce.niveau && annonce.niveau !== "Tous niveaux acceptés" && (
            <Pill icon="chart.bar.fill" text={annonce.niveau} colors={colors} />
          )}
          {annonce.places != null && (
            <Pill icon="person.fill" text={`${annonce.places} place${annonce.places > 1 ? "s" : ""}`} colors={colors} />
          )}
          {annonce.telephone && <Pill icon="bubble.left.fill" text="Tél." colors={colors} />}
        </View>

        <View style={styles.rowFoot}>
          <View style={styles.authorLine}>
            <Avatar uri={author?.avatar_url} name={authorName || "?"} size={18} />
            <Text style={[styles.authorName, { color: colors.textMuted }]} numberOfLines={1}>
              {authorName || "Un membre"} · {timeAgo(annonce.created_at)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavori(annonce.id)} hitSlop={10}>
            <IconSymbol
              name={favori ? "heart.fill" : "heart"}
              size={19}
              color={favori ? colors.error : colors.textSubtle}
            />
          </TouchableOpacity>
        </View>
      </View>
    </PressableScale>
  );
}

function Pill({
  icon,
  text,
  colors,
}: {
  icon?: React.ComponentProps<typeof IconSymbol>["name"];
  text: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
      {icon && <IconSymbol name={icon} size={11} color={colors.textMuted} />}
      <Text style={[styles.pillText, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { session, sessionLoading } = useRequireAuth();
  const { sports } = useSports();
  const params = useLocalSearchParams<{ sport?: string }>();

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [authors, setAuthors] = useState<Record<string, AuthorLite>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState(params.sport || "Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [niveauFilter, setNiveauFilter] = useState("Tous");
  const [onlyPlaces, setOnlyPlaces] = useState(false);
  const [onlyPhone, setOnlyPhone] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    if (params.sport) setSportFilter(params.sport);
  }, [params.sport]);

  const fetchAnnonces = useCallback(async () => {
    let query = supabase.from("annonces").select("*").order("created_at", { ascending: false });
    if (sportFilter !== "Tous") query = query.eq("sport", sportFilter);
    if (search.trim()) {
      const s = search.trim().replace(/[%,()]/g, " ");
      query = query.or(`titre.ilike.%${s}%,description.ilike.%${s}%,ville.ilike.%${s}%`);
    }
    const { data, error } = await query;
    let results = !error && data ? (data as Annonce[]) : [];

    // Masque les annonces des membres bloqués.
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      const { data: blocksData } = await supabase
        .from("blocks")
        .select("blocked_id")
        .eq("blocker_id", authData.user.id);
      const blocked = new Set((blocksData ?? []).map((b: { blocked_id: string }) => b.blocked_id));
      if (blocked.size > 0) results = results.filter((a) => !a.user_id || !blocked.has(a.user_id));
    }
    setAnnonces(results);

    const ids = Array.from(new Set(results.map((a) => a.user_id).filter(Boolean))) as string[];
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, prenom, nom, avatar_url")
        .in("id", ids);
      const map: Record<string, AuthorLite> = {};
      for (const p of profs ?? []) map[p.id] = { prenom: p.prenom, nom: p.nom, avatar_url: p.avatar_url };
      setAuthors(map);
    } else {
      setAuthors({});
    }

    setLoading(false);
    setRefreshing(false);
  }, [sportFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchAnnonces();
  }, [fetchAnnonces]);

  useFocusEffect(
    useCallback(() => {
      fetchAnnonces();
    }, [fetchAnnonces]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnonces();
  };

  const filtered = useMemo(() => {
    let list = annonces.slice();
    if (typeFilter !== "Tous") list = list.filter((a) => a.type === typeFilter);
    if (niveauFilter !== "Tous") list = list.filter((a) => a.niveau === niveauFilter);
    if (onlyPlaces) list = list.filter((a) => a.places != null && a.places > 0);
    if (onlyPhone) list = list.filter((a) => !!a.telephone);
    if (sort === "places") list.sort((a, b) => (b.places ?? 0) - (a.places ?? 0));
    else if (sort === "alpha") list.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
    else list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return list;
  }, [annonces, typeFilter, niveauFilter, onlyPlaces, onlyPhone, sort]);

  const activeExtra =
    (typeFilter !== "Tous" ? 1 : 0) +
    (niveauFilter !== "Tous" ? 1 : 0) +
    (onlyPlaces ? 1 : 0) +
    (onlyPhone ? 1 : 0);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters((v) => !v);
    setShowSort(false);
  };
  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "";

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
          keyboardShouldPersistTaps="handled"
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Titre */}
          <View style={styles.head}>
            <Text style={[styles.h1, { color: colors.text }]}>Annonces</Text>
          </View>

          {/* Recherche + bouton filtres */}
          <View style={styles.searchWrap}>
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="magnifyingglass" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Sport, ville, mot-clé…"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                  <IconSymbol name="xmark" size={15} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={toggleFilters}
              activeOpacity={0.8}
              style={[
                styles.filterBtn,
                { borderColor: colors.border, backgroundColor: showFilters ? colors.primary : colors.surface },
              ]}
            >
              <IconSymbol name="slider.horizontal.3" size={18} color={showFilters ? "#fff" : colors.text} />
              {activeExtra > 0 && !showFilters && (
                <View style={[styles.filterCount, { backgroundColor: colors.primary }]}>
                  <Text style={styles.filterCountText}>{activeExtra}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Chips sport */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {["Tous", ...sports.map((s) => s.nom)].map((s) => {
              const active = sportFilter === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSportFilter(s)}
                  activeOpacity={0.8}
                  style={[
                    styles.sportChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    active && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {s !== "Tous" && (
                    <IconSymbol
                      name={getSportIcon(s)}
                      size={14}
                      color={active ? "#fff" : colors.textMuted}
                    />
                  )}
                  <Text style={[styles.sportChipText, { color: active ? "#fff" : colors.textMuted }]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Panneau filtres repliable */}
          {showFilters && (
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.panelLabel, { color: colors.textMuted }]}>{"Type d'annonce"}</Text>
              <View style={styles.panelWrap}>
                {TYPE_FILTERS.map((t) => {
                  const active = typeFilter === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => setTypeFilter(t.key)}
                      activeOpacity={0.8}
                      style={[
                        styles.panelChip,
                        { borderColor: colors.border },
                        active && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                    >
                      <Text style={[styles.panelChipText, { color: active ? colors.primaryDark : colors.textMuted }]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.panelLabel, { color: colors.textMuted, marginTop: Spacing.md }]}>Niveau</Text>
              <View style={styles.panelWrap}>
                {["Tous", ...NIVEAUX].map((n) => {
                  const active = niveauFilter === n;
                  return (
                    <TouchableOpacity
                      key={n}
                      onPress={() => setNiveauFilter(n)}
                      activeOpacity={0.8}
                      style={[
                        styles.panelChip,
                        { borderColor: colors.border },
                        active && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                    >
                      <Text style={[styles.panelChipText, { color: active ? colors.primaryDark : colors.textMuted }]}>
                        {n}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.panelWrap}>
                <TouchableOpacity
                  onPress={() => setOnlyPlaces((v) => !v)}
                  activeOpacity={0.8}
                  style={[
                    styles.panelChip,
                    { borderColor: colors.border, marginTop: Spacing.md },
                    onlyPlaces && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  ]}
                >
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={13}
                    color={onlyPlaces ? colors.primaryDark : colors.textSubtle}
                  />
                  <Text style={[styles.panelChipText, { color: onlyPlaces ? colors.primaryDark : colors.textMuted }]}>
                    {"  Places disponibles"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setOnlyPhone((v) => !v)}
                  activeOpacity={0.8}
                  style={[
                    styles.panelChip,
                    { borderColor: colors.border, marginTop: Spacing.md },
                    onlyPhone && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  ]}
                >
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={13}
                    color={onlyPhone ? colors.primaryDark : colors.textSubtle}
                  />
                  <Text style={[styles.panelChipText, { color: onlyPhone ? colors.primaryDark : colors.textMuted }]}>
                    {"  Avec téléphone"}
                  </Text>
                </TouchableOpacity>
              </View>

              {activeExtra > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setTypeFilter("Tous");
                    setNiveauFilter("Tous");
                    setOnlyPlaces(false);
                    setOnlyPhone(false);
                  }}
                  style={styles.panelReset}
                >
                  <Text style={[styles.panelResetText, { color: colors.primary }]}>Réinitialiser les filtres</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Barre résultats + tri */}
          <View style={styles.toolbar}>
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {loading ? "…" : `${filtered.length} annonce${filtered.length > 1 ? "s" : ""}`}
            </Text>
            <View>
              <TouchableOpacity
                style={styles.sortBtn}
                activeOpacity={0.7}
                onPress={() => {
                  setShowSort((v) => !v);
                  setShowFilters(false);
                }}
              >
                <Text style={[styles.sortBtnText, { color: colors.text }]}>Trier : {sortLabel}</Text>
                <IconSymbol name="chevron.right" size={13} color={colors.textMuted} style={styles.sortCaret} />
              </TouchableOpacity>
              {showSort && (
                <View style={[styles.sortMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {SORTS.map((s) => (
                    <TouchableOpacity
                      key={s.key}
                      style={styles.sortItem}
                      onPress={() => {
                        setSort(s.key);
                        setShowSort(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.sortItemText,
                          { color: s.key === sort ? colors.primary : colors.text },
                        ]}
                      >
                        {s.label}
                      </Text>
                      {s.key === sort && (
                        <IconSymbol name="checkmark.circle.fill" size={15} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Liste */}
          <View style={styles.list}>
            {loading ? (
              <View style={{ gap: Spacing.md }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonRow key={i} />
                ))}
              </View>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="magnifyingglass"
                title={
                  annonces.length === 0 ? "Aucune annonce pour le moment" : "Aucune annonce avec ces critères"
                }
                subtitle={
                  annonces.length === 0
                    ? "Soyez le premier à publier dans votre région."
                    : "Élargissez la recherche ou réinitialisez les filtres."
                }
                ctaLabel="Publier une annonce"
                onCta={() => router.push("/create-annonce")}
              />
            ) : (
              <View style={{ gap: Spacing.sm }}>
                {filtered.map((a) => (
                  <AnnonceRow key={a.id} annonce={a} author={a.user_id ? authors[a.user_id] : undefined} />
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: isWeb ? 80 : 98, paddingBottom: 48 },

  head: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  h1: { fontSize: isWeb ? 28 : 24, fontWeight: "800", letterSpacing: -0.5 },

  searchWrap: { flexDirection: "row", gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBtn: {
    width: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCount: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterCountText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  chipsRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: 8 },
  sportChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
  },
  sportChipText: { fontSize: 13, fontWeight: "600" },

  panel: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  panelLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 },
  panelWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  panelChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  panelChipText: { fontSize: 12, fontWeight: "600" },
  panelReset: { marginTop: Spacing.md, alignSelf: "flex-start" },
  panelResetText: { fontSize: 13, fontWeight: "700" },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  count: { fontSize: 13, fontWeight: "600" },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortBtnText: { fontSize: 13, fontWeight: "600" },
  sortCaret: { transform: [{ rotate: "90deg" }] },
  sortMenu: {
    position: "absolute",
    top: 26,
    right: 0,
    minWidth: 180,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sortItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: Spacing.sm,
  },
  sortItemText: { fontSize: 14, fontWeight: "600" },

  list: { paddingHorizontal: Spacing.lg },

  row: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  rowIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, gap: 6 },
  rowTagLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeTag: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  typeTagText: { fontSize: 10.5, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.3 },
  newTag: { borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  newTagText: { color: "#fff", fontSize: 9.5, fontWeight: "800", letterSpacing: 0.4 },
  rowTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: "600" },
  rowFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  authorLine: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  authorName: { fontSize: 12, flexShrink: 1 },
});
