import Header from "@/components/Header";
import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";
import { PressableScale } from "@/components/ui/PressableScale";
import { Skeleton } from "@/components/ui/Skeleton";
import { getSportIcon } from "@/constants/sportIcons";
import { Radius, Spacing } from "@/constants/theme";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useSports } from "@/hooks/useSports";
import { useTheme } from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const isWeb = Platform.OS === "web";

const STEPS = [
  {
    n: "1",
    title: "Choisissez votre sport",
    desc: "Sélectionnez vos sports et votre niveau pour un fil d'annonces adapté.",
  },
  {
    n: "2",
    title: "Publiez ou répondez",
    desc: "Déposez une annonce en 2 minutes, ou contactez celles qui vous intéressent.",
  },
  {
    n: "3",
    title: "Retrouvez-vous sur le terrain",
    desc: "Échangez par messagerie, fixez un créneau et jouez ensemble.",
  },
];

const FEATURES: { icon: IconSymbolName; title: string; desc: string }[] = [
  { icon: "person.fill", title: "Compléter une équipe", desc: "Trouvez les joueurs qu'il vous manque pour votre match." },
  { icon: "trophy.fill", title: "Rejoindre un club", desc: "Découvrez les clubs qui recrutent près de chez vous." },
  { icon: "calendar", title: "Organiser une partie", desc: "Lancez une partie ouverte et remplissez les places libres." },
  { icon: "bubble.left.fill", title: "Discuter en direct", desc: "Une messagerie intégrée pour convenir des détails." },
];

const FOOTER_COLUMNS = [
  {
    title: "Découvrir",
    links: [
      { label: "Les annonces", href: "/(tabs)/explore" },
      { label: "La carte", href: "/(tabs)/map" },
      { label: "Publier une annonce", href: "/create-annonce" },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { label: "Mon profil", href: "/(tabs)/profile" },
      { label: "Mes annonces", href: "/(tabs)/mes-annonces" },
      { label: "Messages", href: "/(tabs)/messages" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Centre d'aide", href: "/(profile)/aide" },
      { label: "Confidentialité", href: "/(profile)/confidentialite" },
    ],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const scrollToTop = () => scrollRef.current?.scrollTo?.({ y: 0, animated: true });

  const { sports } = useSports();
  const stats = usePlatformStats();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header scrollY={scrollY} />

      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroInner}>
            <Image
              source={require("@/assets/images/Login_Sportif.png")}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>Le sport, ensemble.</Text>
            <Text style={styles.heroSubtitle}>
              LeBonSport met en relation les sportifs, les équipes et les clubs.
              Trouvez un partenaire, complétez votre équipe ou rejoignez un club
              près de chez vous.
            </Text>

            <View style={styles.heroButtons}>
              <PressableScale
                style={[styles.btn, styles.btnLight]}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <Text style={[styles.btnLightText, { color: colors.primaryDark }]}>
                  Explorer les annonces
                </Text>
              </PressableScale>
              <PressableScale
                style={[styles.btn, styles.btnOutline]}
                onPress={() => router.push("/create-annonce")}
              >
                <Text style={styles.btnOutlineText}>Publier une annonce</Text>
              </PressableScale>
            </View>

            <View style={styles.heroStats}>
              {stats.loading ? (
                <Skeleton width={220} height={16} />
              ) : (
                <Text style={styles.heroStatsText}>
                  <Text style={styles.heroStatsNum}>{stats.membersCount}</Text> membres
                  {"   ·   "}
                  <Text style={styles.heroStatsNum}>{stats.annoncesCount}</Text> annonces
                  {"   ·   "}
                  <Text style={styles.heroStatsNum}>{sports.length}</Text> sports
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* ── Comment ça marche ── */}
        <View style={styles.section}>
          <View style={styles.sectionInner}>
            <Text style={[styles.kicker, { color: colors.primary }]}>COMMENT ÇA MARCHE</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{"Trois étapes, c'est tout"}</Text>
            <View style={styles.steps}>
              {STEPS.map((step) => (
                <View key={step.n} style={styles.step}>
                  <View style={[styles.stepNum, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.stepNumText, { color: colors.primaryDark }]}>{step.n}</Text>
                  </View>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: colors.textMuted }]}>{step.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Fonctionnalités ── */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionInner}>
            <Text style={[styles.kicker, { color: colors.primary }]}>CE QUE VOUS POUVEZ FAIRE</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Une appli, plusieurs usages</Text>
            <View style={styles.featGrid}>
              {FEATURES.map((f) => (
                <View
                  key={f.title}
                  style={[styles.featCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={[styles.featIcon, { backgroundColor: colors.primaryLight }]}>
                    <IconSymbol name={f.icon} size={20} color={colors.primaryDark} />
                  </View>
                  <Text style={[styles.featTitle, { color: colors.text }]}>{f.title}</Text>
                  <Text style={[styles.featDesc, { color: colors.textMuted }]}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Sports ── */}
        {sports.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionInner}>
              <Text style={[styles.kicker, { color: colors.primary }]}>PAR SPORT</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Parcourez par discipline</Text>
              <View style={styles.chips}>
                {sports.map((sport) => (
                  <PressableScale
                    key={sport.id}
                    style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() =>
                      router.push(`/(tabs)/explore?sport=${encodeURIComponent(sport.nom)}` as any)
                    }
                  >
                    <IconSymbol name={getSportIcon(sport.nom)} size={18} color={colors.primary} />
                    <Text style={[styles.chipLabel, { color: colors.text }]}>{sport.nom}</Text>
                  </PressableScale>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── CTA ── */}
        <View style={styles.section}>
          <View style={styles.sectionInner}>
            <View style={[styles.cta, { backgroundColor: colors.primary }]}>
              <Text style={styles.ctaTitle}>Prêt à trouver votre équipe ?</Text>
              <Text style={styles.ctaText}>
                Rejoignez la communauté et publiez votre première annonce dès maintenant.
              </Text>
              <PressableScale style={styles.ctaButton} onPress={() => router.push("/create-annonce")}>
                <Text style={[styles.ctaButtonText, { color: colors.primaryDark }]}>
                  Publier une annonce
                </Text>
              </PressableScale>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <LinearGradient
          colors={["#123329", "#0B1913"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.footer}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.footerAccent}
          />

          <View style={styles.footerInner}>
            <View style={styles.footerTop}>
              <View style={styles.footerBrand}>
                <View style={styles.footerLogoRow}>
                  <View style={[styles.footerLogoMark, { backgroundColor: colors.primary }]}>
                    <Text style={styles.footerLogoMarkText}>S</Text>
                  </View>
                  <Text style={styles.footerLogoText}>LeBonSport</Text>
                </View>
                <Text style={styles.footerTagline}>
                  La communauté sportive qui vous connecte aux clubs, équipes et joueurs près de chez vous.
                </Text>
                <PressableScale
                  style={[styles.footerCta, { borderColor: colors.gradientStart }]}
                  onPress={() => router.push("/create-annonce")}
                >
                  <IconSymbol name="plus.circle.fill" size={16} color={colors.gradientStart} />
                  <Text style={[styles.footerCtaText, { color: colors.gradientStart }]}>
                    Publier une annonce
                  </Text>
                </PressableScale>
              </View>

              <View style={styles.footerCols}>
                {FOOTER_COLUMNS.map((col) => (
                  <View key={col.title} style={styles.footerCol}>
                    <Text style={styles.footerColTitle}>{col.title}</Text>
                    {col.links.map((link) => (
                      <TouchableOpacity
                        key={link.label}
                        onPress={() => router.push(link.href as any)}
                        activeOpacity={0.6}
                        style={styles.footerLinkRow}
                      >
                        <Text style={styles.footerLink}>{link.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.footerDivider} />

            <View style={styles.footerBottom}>
              <Text style={styles.footerCopy}>
                © {new Date().getFullYear()} LeBonSport · Fait en France 🇫🇷
              </Text>
              <View style={styles.footerBottomLinks}>
                <TouchableOpacity onPress={() => router.push("/(profile)/confidentialite")} activeOpacity={0.6}>
                  <Text style={styles.footerBottomLink}>Confidentialité</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}>·</Text>
                <TouchableOpacity onPress={() => router.push("/(profile)/aide")} activeOpacity={0.6}>
                  <Text style={styles.footerBottomLink}>Aide</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}>·</Text>
                <TouchableOpacity onPress={scrollToTop} activeOpacity={0.6} style={styles.footerTopBtn}>
                  <Text style={styles.footerBottomLink}>Haut de page</Text>
                  <IconSymbol name="chevron.right" size={13} color="rgba(255,255,255,0.6)" style={styles.footerTopBtnIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.ScrollView>
    </View>
  );
}

const CONTENT_MAX = 1040;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  hero: { paddingTop: isWeb ? 110 : 130, paddingBottom: Spacing.xl + 16, paddingHorizontal: Spacing.lg },
  heroInner: { width: "100%", maxWidth: CONTENT_MAX, alignSelf: "center", alignItems: "center" },
  heroLogo: { width: isWeb ? 200 : 150, height: isWeb ? 200 : 150, marginBottom: Spacing.md },
  heroTitle: {
    color: "#fff",
    fontSize: isWeb ? 40 : 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: isWeb ? 46 : 36,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.md,
    maxWidth: 560,
    textAlign: "center",
  },
  heroButtons: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.lg, justifyContent: "center" },
  btn: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: Radius.md },
  btnLight: { backgroundColor: "#fff" },
  btnLightText: { fontWeight: "800", fontSize: 14 },
  btnOutline: { borderWidth: 1.5, borderColor: "rgba(255,255,255,0.6)" },
  btnOutlineText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  heroStats: { marginTop: Spacing.lg },
  heroStatsText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  heroStatsNum: { color: "#fff", fontWeight: "800" },

  section: { paddingVertical: Spacing.xl + 8, paddingHorizontal: Spacing.lg },
  sectionInner: { width: "100%", maxWidth: CONTENT_MAX, alignSelf: "center" },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  sectionTitle: { fontSize: isWeb ? 26 : 22, fontWeight: "800", letterSpacing: -0.3, marginTop: 6, marginBottom: Spacing.lg },

  steps: { flexDirection: isWeb ? "row" : "column", gap: Spacing.lg },
  step: { flex: isWeb ? 1 : undefined },
  stepNum: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  stepNumText: { fontSize: 17, fontWeight: "800" },
  stepTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  stepDesc: { fontSize: 14, lineHeight: 20 },

  featGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  featCard: {
    width: isWeb ? "47%" : "100%",
    flexGrow: 1,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  featIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  featDesc: { fontSize: 13, lineHeight: 19 },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 13, fontWeight: "600" },

  cta: { borderRadius: Radius.lg, padding: Spacing.lg },
  ctaTitle: { color: "#fff", fontSize: 19, fontWeight: "800" },
  ctaText: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: Spacing.md, maxWidth: 460 },
  ctaButton: { backgroundColor: "#fff", alignSelf: "flex-start", paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.md },
  ctaButtonText: { fontWeight: "800", fontSize: 14 },

  footer: {
    paddingTop: Spacing.xl + 6,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  footerAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
  footerInner: { width: "100%", maxWidth: CONTENT_MAX, alignSelf: "center", gap: Spacing.xl },
  footerTop: { flexDirection: isWeb ? "row" : "column", justifyContent: "space-between", gap: Spacing.xl },
  footerBrand: { flex: isWeb ? 1 : undefined, maxWidth: 380, gap: 12 },
  footerLogoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  footerLogoMark: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  footerLogoMarkText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  footerLogoText: { color: "#fff", fontWeight: "800", fontSize: 19, letterSpacing: -0.3 },
  footerTagline: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 20 },
  footerCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  footerCtaText: { fontSize: 13, fontWeight: "700" },

  footerCols: { flexDirection: "row", flexWrap: "wrap", gap: 44 },
  footerCol: { gap: 12, minWidth: 140 },
  footerColTitle: {
    color: "#7FE3B6",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  footerLinkRow: { paddingVertical: 1 },
  footerLink: { color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 20 },

  footerDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)" },

  footerBottom: {
    flexDirection: isWeb ? "row" : "column",
    justifyContent: "space-between",
    alignItems: isWeb ? "center" : "flex-start",
    gap: Spacing.sm,
  },
  footerCopy: { color: "rgba(255,255,255,0.45)", fontSize: 12 },
  footerBottomLinks: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  footerBottomLink: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  footerDot: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  footerTopBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  footerTopBtnIcon: { transform: [{ rotate: "-90deg" }] },
});
