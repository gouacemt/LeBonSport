import Header from "@/components/Header";
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

  // ← NOUVEAU : scrollY pour le Header
  const scrollY = useRef(new Animated.Value(0)).current;

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
    // ← NOUVEAU : View racine pour superposer Header + ScrollView
    <View style={styles.root}>
      {/* Header flottant qui se grise au scroll */}
      <Header scrollY={scrollY} />

      {/* ← ScrollView → Animated.ScrollView pour tracker le scroll */}
      <Animated.ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/*Hero*/}
        <LinearGradient
          colors={["#2ECC8F", "#1AAD6E", "#0D8A52"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/*Badge*/}
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

          {/*Headline*/}
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

          {/*Cta buttons*/}
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

          {/* Wave */}
          <View style={styles.wave} />
        </LinearGradient>

        {/*Sports Catégories*/}
        <Animated.View style={{ opacity: sportsOpacity }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsScroll}
          >
          </ScrollView>
        </Animated.View>

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

        {/*Cta bottom*/}
        <Animated.View
          style={{
            opacity: ctaOpacity,
            transform: [{ translateY: ctaTranslate }],
          }}
        >
          <LinearGradient
            colors={["#0F2027", "#1A3A4A", "#203A43"]}
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

        {/*Footer*/}
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
  // ← NOUVEAU
  root: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  // ─── HERO (paddingTop augmenté pour laisser place au header flottant)
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

  // ─── SPORTS
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
  sportEmoji: {
    fontSize: 28,
  },
  sportLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2E22",
    textAlign: "center",
  },

  // ─── HOW
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

  // ─── CTA BOTTOM
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

  // ─── FOOTER
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
