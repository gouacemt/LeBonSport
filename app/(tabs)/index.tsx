import Header from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PressableScale } from "@/components/ui/PressableScale";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { Spacing } from "@/constants/theme";
import { getSportIcon } from "@/constants/sportIcons";
import { useNearbyAthletes } from "@/hooks/useNearbyAthletes";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { usePopularClubs } from "@/hooks/usePopularClubs";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useSports } from "@/hooks/useSports";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const HOW_IT_WORKS = [
  {
    title: "Trouvez facilement",
    desc: "Recherchez par sport, niveau et localisation",
    color: "#E8F5F0",
    iconColor: "#1A8C5B",
  },
  {
    title: "Complétez votre équipe",
    desc: "Il vous manque un joueur ? Publiez une annonce",
    color: "#EAF0FF",
    iconColor: "#3B5BDB",
  },
  {
    title: "Rejoignez un club",
    desc: "Trouvez le club parfait près de chez vous",
    color: "#F5EAF5",
    iconColor: "#9B59B6",
  },
  {
    title: "Parties spontanées",
    desc: "Organisez ou rejoignez une partie rapidement",
    color: "#FFF8E1",
    iconColor: "#F39C12",
  },
];

function useAnimatedValue(initialValue: number) {
  return useRef(new Animated.Value(initialValue)).current;
}

export default function HomeScreen() {
  const router = useRouter();

  const scrollY = useRef(new Animated.Value(0)).current;

  const { sports } = useSports();
  const platformStats = usePlatformStats();
  const recommendations = useRecommendations();
  const popularClubs = usePopularClubs();
  const upcomingEvents = useUpcomingEvents();
  const nearbyAthletes = useNearbyAthletes();
  const testimonials = useTestimonials();

  const heroOpacity = useAnimatedValue(0);
  const heroTranslate = useAnimatedValue(30);
  const badgeOpacity = useAnimatedValue(0);
  const badgeTranslate = useAnimatedValue(-10);
  const btnScale = useAnimatedValue(0.9);
  const sportsOpacity = useAnimatedValue(0);
  const howOpacity = useAnimatedValue(0);
  const ctaOpacity = useAnimatedValue(0);
  const ctaTranslate = useAnimatedValue(40);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(badgeTranslate, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(heroTranslate, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(sportsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(howOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(ctaTranslate, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <Header scrollY={scrollY} />

      <Animated.ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <LinearGradient
          colors={["#2ECC8F", "#1AAD6E", "#0D8A52"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Animated.View
            style={[
              styles.badge,
              {
                opacity: badgeOpacity,
                transform: [{ translateY: badgeTranslate }],
              },
            ]}
          >
            <Text style={styles.badgeText}>
              ✦ La communauté sportive qui vous connecte
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: heroOpacity,
              transform: [{ translateY: heroTranslate }],
            }}
          >
            <Text style={styles.heroTitle}>Trouvez vos partenaires</Text>
            <Text style={styles.heroTitleAccent}>de sport idéaux</Text>
            <Text style={styles.heroSubtitle}>
              Que vous cherchiez un club, une équipe ou des joueurs pour
              compléter votre partie, LeBonSport vous connecte avec la
              communauté sportive près de chez vous.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.heroBtns,
              { opacity: btnScale, transform: [{ scale: btnScale }] },
            ]}
          >
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => router.push("/(tabs)/explore")}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>
                Explorer les annonces
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => router.push("/create-annonce")}
              activeOpacity={0.85}
            >
              <Text style={styles.btnSecondaryText}>
                 Publier une annonce
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.wave} />
        </LinearGradient>

        {sports.length > 0 && (
          <Animated.View style={{ opacity: sportsOpacity }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sportsScroll}
            >
              {sports.map((sport) => (
                <PressableScale
                  key={sport.id}
                  style={styles.sportChip}
                  onPress={() => router.push(`/(tabs)/explore?sport=${encodeURIComponent(sport.nom)}` as any)}
                >
                  <IconSymbol name={getSportIcon(sport.nom)} size={26} color="#16A06A" />
                  <Text style={styles.sportLabel}>{sport.nom}</Text>
                </PressableScale>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <View style={styles.statsBanner}>
          {platformStats.loading ? (
            <>
              <Skeleton width={70} height={32} />
              <Skeleton width={70} height={32} />
              <Skeleton width={70} height={32} />
            </>
          ) : (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{platformStats.annoncesCount}</Text>
                <Text style={styles.statLabel}>Annonces</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{platformStats.membersCount}</Text>
                <Text style={styles.statLabel}>Membres</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sports.length}</Text>
                <Text style={styles.statLabel}>Sports</Text>
              </View>
            </>
          )}
        </View>

        {(recommendations.loading || recommendations.data.length > 0) && (
          <View style={styles.section}>
            <SectionHeader
              title="Recommandé pour vous"
              subtitle="Selon les sports que vous pratiquez"
              ctaLabel="Voir tout"
              onCta={() => router.push("/(tabs)/explore")}
            />
            {recommendations.loading ? (
              <View style={{ gap: Spacing.sm }}>
                <SkeletonRow /><SkeletonRow /><SkeletonRow />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
                {recommendations.data.map((a) => (
                  <PressableScale key={a.id} onPress={() => router.push(`/annonce/${a.id}` as any)}>
                    <Card style={styles.teaserCard}>
                      <View style={styles.iconCircle}>
                        <IconSymbol name={getSportIcon(a.sport)} size={22} color="#0D8A52" />
                      </View>
                      <Text style={styles.teaserTitle} numberOfLines={2}>{a.titre}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>{a.sport}</Text>
                        </View>
                        <View style={styles.inlineIconText}>
                          <IconSymbol name="mappin.and.ellipse" size={12} color="#5A7366" />
                          <Text style={styles.teaserSub}>{a.ville}</Text>
                        </View>
                      </View>
                    </Card>
                  </PressableScale>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Clubs populaires" subtitle="Les clubs qui recrutent près de chez vous" />
          {popularClubs.loading ? (
            <View style={{ gap: Spacing.sm }}><SkeletonRow /><SkeletonRow /></View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {popularClubs.data.map((club) => (
                <PressableScale key={club.id} onPress={() => router.push("/(tabs)/explore")}>
                  <Card style={styles.teaserCard}>
                    <View style={styles.iconCircle}>
                      <IconSymbol name={club.icon} size={22} color="#0D8A52" />
                    </View>
                    <Text style={styles.teaserTitle} numberOfLines={1}>{club.nom}</Text>
                    <View style={styles.inlineIconText}>
                      <IconSymbol name="mappin.and.ellipse" size={12} color="#5A7366" />
                      <Text style={styles.teaserSub}>{club.ville}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>{club.membres} membres</Text>
                      </View>
                    </View>
                  </Card>
                </PressableScale>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Événements à venir" subtitle="Compétitions et rencontres organisées" />
          {upcomingEvents.loading ? (
            <View style={{ gap: Spacing.sm }}><SkeletonRow /><SkeletonRow /></View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {upcomingEvents.data.map((event) => (
                <PressableScale key={event.id} onPress={() => router.push("/(tabs)/explore")}>
                  <Card style={styles.teaserCard}>
                    <View style={styles.iconCircle}>
                      <IconSymbol name={event.icon} size={22} color="#0D8A52" />
                    </View>
                    <Text style={styles.teaserTitle} numberOfLines={2}>{event.titre}</Text>
                    <View style={styles.inlineIconText}>
                      <IconSymbol name="mappin.and.ellipse" size={12} color="#5A7366" />
                      <Text style={styles.teaserSub}>{event.ville}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <View style={[styles.metaChip, styles.metaChipIconRow]}>
                        <IconSymbol name="calendar" size={11} color="#0D8A52" />
                        <Text style={styles.metaChipText}>{event.date}</Text>
                      </View>
                    </View>
                  </Card>
                </PressableScale>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Athlètes près de chez vous" subtitle="D'autres sportifs de votre région" />
          {nearbyAthletes.loading ? (
            <View style={{ gap: Spacing.sm }}><SkeletonRow /><SkeletonRow /></View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {nearbyAthletes.data.map((athlete) => (
                <Card key={athlete.id} style={styles.teaserCard}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarCircleText}>{athlete.prenom[0]}</Text>
                  </View>
                  <Text style={styles.teaserTitle}>{athlete.prenom}</Text>
                  <View style={styles.inlineIconText}>
                    <IconSymbol name="mappin.and.ellipse" size={12} color="#5A7366" />
                    <Text style={styles.teaserSub}>{athlete.ville}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{athlete.sport}</Text>
                    </View>
                    <View style={[styles.metaChip, styles.metaChipOutline]}>
                      <Text style={[styles.metaChipText, styles.metaChipTextOutline]}>{athlete.niveau}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Ils utilisent LeBonSport" />
          {testimonials.loading ? (
            <View style={{ gap: Spacing.sm }}><SkeletonRow /><SkeletonRow /></View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {testimonials.data.map((t) => (
                <Card key={t.id} style={[styles.teaserCard, styles.testimonialCard]}>
                  <View style={styles.stars}>
                    {Array.from({ length: t.note }).map((_, i) => (
                      <IconSymbol key={i} name="star.fill" size={13} color="#F39C12" />
                    ))}
                  </View>
                  <Text style={styles.testimonialText} numberOfLines={4}>"{t.texte}"</Text>
                  <View style={styles.testimonialFooter}>
                    <View style={styles.avatarCircleSm}>
                      <Text style={styles.avatarCircleSmText}>{t.nom[0]}</Text>
                    </View>
                    <Text style={styles.testimonialName}>{t.nom}</Text>
                  </View>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        <Animated.View style={[styles.section, { opacity: howOpacity }]}>
          <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
          <Text style={styles.sectionSubtitle}>
            LeBonSport facilite la mise en relation entre sportifs, équipes et
            clubs
          </Text>

          <View style={styles.howGrid}>
            {HOW_IT_WORKS.map((item, i) => (
              <HowCard key={i} item={item} index={i} />
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: ctaOpacity,
            transform: [{ translateY: ctaTranslate }],
          }}
        >
          <LinearGradient
            colors={["#0D8A52", "#16A06A", "#2ECC8F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBox}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaLeft}>
                <Text style={styles.ctaTitle}>
                  Prêt à trouver votre prochain partenaire ?
                </Text>
                <Text style={styles.ctaDesc}>
                  Rejoignez la communauté LeBonSport et connectez-vous avec des
                  sportifs qui partagent votre passion.
                </Text>
              </View>
              <View style={styles.ctaButtons}>
                <TouchableOpacity
                  style={styles.ctaBtnGreen}
                  onPress={() => router.push("/create-annonce")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaBtnGreenText}>Créer une annonce</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ctaBtnDark}
                  onPress={() => router.push("/(tabs)/explore")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaBtnDarkText}>
                    Explorer les annonces
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <View style={styles.footerLogoIcon}>
              <Text style={styles.footerLogoText}>S</Text>
            </View>
            <Text style={styles.footerBrand}>LeBonSport</Text>
          </View>
          <Text style={styles.footerCopy}>
            © 2025 LeBonSport. Tous droits réservés.
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function HowCard({
  item,
  index,
}: {
  item: (typeof HOW_IT_WORKS)[0];
  index: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.howCard, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Text style={styles.howTitle}>{item.title}</Text>
        <Text style={styles.howDesc}>{item.desc}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const isWeb = Platform.OS === "web";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  hero: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: "#fff",
    fontSize: isWeb ? 48 : 32,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: isWeb ? 58 : 40,
  },
  heroTitleAccent: {
    color: "rgba(255,255,255,0.7)",
    fontSize: isWeb ? 48 : 32,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: isWeb ? 58 : 40,
    marginBottom: 20,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 520,
    marginBottom: 36,
  },
  heroBtns: {
    flexDirection: isWeb ? "row" : "column",
    gap: 12,
    width: "100%",
    maxWidth: 520,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flex: isWeb ? 1 : undefined,
    width: isWeb ? undefined : "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  btnPrimaryText: {
    color: "#0D7A4F",
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flex: isWeb ? 1 : undefined,
    width: isWeb ? undefined : "100%",
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  wave: {
    position: "absolute",
    bottom: -2,
    left: -20,
    right: -20,
    height: 40,
    backgroundColor: "#F8FAF9",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },

  sportsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
    justifyContent: "center",
  },
  sportChip: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    flexDirection: "column",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8EDE9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sportLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2E22",
    textAlign: "center",
  },

  statsBanner: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EDE9",
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "800", color: "#0F1F17" },
  statLabel: { fontSize: 12, color: "#5A7366", marginTop: 2 },

  teaserCard: {
    width: 210,
    minHeight: 168,
    padding: 16,
  },
  teaserTitle: { fontSize: 15, fontWeight: "700", color: "#0F1F17", marginBottom: 4 },
  teaserSub: { fontSize: 12, color: "#5A7366", lineHeight: 17 },
  inlineIconText: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F5F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5F0",
    borderWidth: 1.5,
    borderColor: "#16A06A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarCircleText: { fontSize: 17, fontWeight: "700", color: "#0D8A52" },

  avatarCircleSm: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E8F5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircleSmText: { fontSize: 11, fontWeight: "700", color: "#0D8A52" },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: "auto" },
  metaChip: {
    backgroundColor: "#F0FBF5",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  metaChipText: { fontSize: 11, fontWeight: "600", color: "#0D8A52" },
  metaChipIconRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaChipOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#E8EDE9" },
  metaChipTextOutline: { color: "#5A7366" },

  testimonialCard: { minHeight: 160, justifyContent: "space-between" },
  stars: { flexDirection: "row", gap: 2, marginBottom: 8 },
  testimonialText: { fontSize: 13, color: "#3D5348", lineHeight: 19, fontStyle: "italic" },
  testimonialFooter: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  testimonialName: { fontSize: 12, fontWeight: "700", color: "#0F1F17" },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: isWeb ? 34 : 26,
    fontWeight: "800",
    color: "#0F1F17",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#5A7366",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  howGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
  },
  howCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    width: isWeb ? 200 : (width - 54) / 2,
    borderWidth: 1,
    borderColor: "#E8EDE9",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  howIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  howIcon: { fontSize: 26 },
  howTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F1F17",
    marginBottom: 6,
  },
  howDesc: { fontSize: 13, color: "#5A7366", lineHeight: 19 },

  ctaBox: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  ctaContent: {
    padding: 28,
    flexDirection: isWeb ? "row" : "column",
    alignItems: isWeb ? "center" : "flex-start",
    gap: 24,
  },
  ctaLeft: { flex: isWeb ? 1 : undefined },
  ctaTitle: {
    color: "#fff",
    fontSize: isWeb ? 26 : 22,
    fontWeight: "800",
    marginBottom: 10,
    lineHeight: 32,
  },
  ctaDesc: { color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 21 },
  ctaButtons: { gap: 10, width: isWeb ? undefined : "100%" },
  ctaBtnGreen: {
    backgroundColor: "#16A06A",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  ctaBtnGreenText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  ctaBtnDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  ctaBtnDarkText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E0E8E2",
    marginTop: 8,
  },
  footerLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerLogoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#16A06A",
    alignItems: "center",
    justifyContent: "center",
  },
  footerLogoText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  footerBrand: { fontWeight: "700", fontSize: 14, color: "#0F1F17" },
  footerCopy: { fontSize: 12, color: "#8FA898" },
});
