import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MapPreview } from "@/components/ui/MapPreview";
import { getSportIcon } from "@/constants/sportIcons";
import { Radius, Spacing } from "@/constants/theme";
import { useAnnonceConversation } from "@/hooks/useAnnonceConversation";
import { useAnnonceCandidatures } from "@/hooks/useAnnonceCandidatures";
import { AnnonceAuthor, useAnnonceDetail } from "@/hooks/useAnnonceDetail";
import { useAuth } from "@/hooks/useAuth";
import { useCandidature } from "@/hooks/useCandidature";
import { useFavoris } from "@/hooks/useFavoris";
import { useModeration } from "@/hooks/useModeration";
import { ReportSheet } from "@/components/ReportSheet";
import { useTheme } from "@/hooks/useTheme";
import { ANNONCE_TYPE_LABELS, timeAgo } from "@/utils/format";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function authorName(a: AnnonceAuthor | null): string {
  if (!a) return "Un membre";
  const full = [a.prenom, a.nom].filter(Boolean).join(" ").trim();
  return full || "Un membre";
}

function authorRole(a: AnnonceAuthor | null): string | null {
  if (!a) return null;
  if (a.is_club) return "Club";
  if (a.is_coach) return "Coach";
  if (a.is_sportif) return "Sportif";
  return null;
}

export default function AnnonceDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { annonce, author, loading, error } = useAnnonceDetail(id);
  const { isFavori, toggleFavori } = useFavoris();
  const { session } = useAuth();
  const [draft, setDraft] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const isOwner = !!annonce && !!annonce.user_id && annonce.user_id === session?.user.id;
  const canContact = !!annonce && !!annonce.user_id && !isOwner && !!session;

  const { sending, sendMessage } = useAnnonceConversation(
    annonce?.id,
    canContact ? annonce?.user_id : null,
  );

  const candidature = useCandidature(annonce?.id, canContact);
  const received = useAnnonceCandidatures(isOwner ? annonce?.id : undefined);
  const moderation = useModeration();
  const [reportOpen, setReportOpen] = useState(false);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !annonce) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <IconSymbol name="magnifyingglass" size={28} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, marginTop: Spacing.sm }}>Cette annonce est introuvable</Text>
        <Button label="Retour" onPress={() => router.back()} variant="outline" style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  const favori = isFavori(annonce.id);
  const showNiveau = annonce.niveau && annonce.niveau !== "Tous niveaux acceptés";
  const eventDate = annonce.date_evenement
    ? new Date(annonce.date_evenement).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;
  const photos = annonce.photos?.filter(Boolean) ?? [];
  const contactFirstName = author?.prenom || authorName(author);

  const onSend = async () => {
    const content = draft;
    setDraft("");
    const ok = await sendMessage(content);
    if (!ok) setDraft(content);
  };

  const facts: { label: string; value: string }[] = [
    { label: "Sport", value: annonce.sport },
    ...(showNiveau ? [{ label: "Niveau", value: annonce.niveau }] : []),
    { label: "Ville", value: annonce.ville },
    ...(annonce.club ? [{ label: "Club", value: annonce.club }] : []),
    ...(annonce.places != null
      ? [{ label: "Places", value: `${annonce.places} place${annonce.places > 1 ? "s" : ""}` }]
      : []),
    ...(eventDate ? [{ label: "Date", value: eventDate }] : []),
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 15 }}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleFavori(annonce.id)} hitSlop={8}>
          <IconSymbol
            name={favori ? "heart.fill" : "heart"}
            size={22}
            color={favori ? colors.error : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {photos.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoStrip}
          >
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.photo} contentFit="cover" />
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          <View style={styles.headRow}>
            <Badge label={ANNONCE_TYPE_LABELS[annonce.type] ?? annonce.type} variant="success" />
            <Text style={[styles.date, { color: colors.textSubtle }]}>Publié {timeAgo(annonce.created_at)}</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{annonce.titre}</Text>

          <View style={styles.sportLine}>
            <View style={[styles.sportIcon, { backgroundColor: colors.primaryLight }]}>
              <IconSymbol name={getSportIcon(annonce.sport)} size={16} color={colors.primaryDark} />
            </View>
            <Text style={[styles.sportText, { color: colors.textMuted }]}>
              {annonce.sport} · {annonce.ville}
            </Text>
          </View>

          {/* Faits */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {facts.map((f, i) => (
              <View
                key={f.label}
                style={[
                  styles.factRow,
                  i < facts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.factLabel, { color: colors.textMuted }]}>{f.label}</Text>
                <Text style={[styles.factValue, { color: colors.text }]}>{f.value}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{annonce.description}</Text>

          {/* Lieu */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Lieu</Text>
          <MapPreview ville={annonce.ville} club={annonce.club} />

          {/* Auteur */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Publié par</Text>
          <TouchableOpacity
            style={[styles.authorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={author?.id ? 0.7 : 1}
            disabled={!author?.id}
            onPress={() => author?.id && router.push(`/user/${author.id}` as any)}
          >
            <Avatar uri={author?.avatar_url} name={authorName(author)} size={48} />
            <View style={{ flex: 1 }}>
              <View style={styles.authorNameRow}>
                <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                  {authorName(author)}
                </Text>
                {authorRole(author) && (
                  <View style={[styles.rolePill, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.rolePillText, { color: colors.primaryDark }]}>{authorRole(author)}</Text>
                  </View>
                )}
              </View>
              {author?.bio ? (
                <Text style={[styles.authorBio, { color: colors.textMuted }]} numberOfLines={2}>
                  {author.bio}
                </Text>
              ) : (
                <Text style={[styles.authorBio, { color: colors.textSubtle }]}>Membre de LeBonSport</Text>
              )}
            </View>
            {author?.id && <IconSymbol name="chevron.right" size={18} color={colors.textSubtle} />}
          </TouchableOpacity>

          {!isOwner && !!session && !!annonce.user_id && (
            <View style={styles.modRow}>
              <TouchableOpacity onPress={() => setReportOpen(true)} hitSlop={6}>
                <Text style={[styles.modLink, { color: colors.textMuted }]}>Signaler l&apos;annonce</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.textSubtle }}>·</Text>
              <TouchableOpacity
                onPress={async () => {
                  if (moderation.isBlocked(annonce.user_id)) {
                    await moderation.unblock(annonce.user_id!);
                  } else {
                    const ok = await moderation.block(annonce.user_id!);
                    if (ok) router.back();
                  }
                }}
                hitSlop={6}
              >
                <Text style={[styles.modLink, { color: colors.error }]}>
                  {moderation.isBlocked(annonce.user_id) ? "Débloquer ce membre" : "Bloquer ce membre"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Zone de contact */}
          {isOwner ? (
            <>
              <View style={[styles.ownerBox, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.ownerText, { color: colors.primaryDark }]}>
                  {"C'est votre annonce."}
                </Text>
                <Button
                  label="Gérer mes annonces"
                  variant="outline"
                  size="sm"
                  onPress={() => router.push("/(tabs)/mes-annonces")}
                  style={{ marginTop: Spacing.sm }}
                />
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Candidatures{received.candidatures.length > 0 ? ` (${received.candidatures.length})` : ""}
              </Text>
              {received.loading ? (
                <ActivityIndicator color={colors.primary} style={{ alignSelf: "flex-start" }} />
              ) : received.candidatures.length === 0 ? (
                <Text style={[styles.chatHint, { color: colors.textSubtle }]}>
                  Personne n&apos;a encore répondu à cette annonce.
                </Text>
              ) : (
                received.candidatures.map((c) => (
                  <View
                    key={c.id}
                    style={[styles.candCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.candHead}>
                      <Avatar
                        uri={c.candidat?.avatar_url}
                        name={[c.candidat?.prenom, c.candidat?.nom].filter(Boolean).join(" ") || "Membre"}
                        size={36}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.candName, { color: colors.text }]} numberOfLines={1}>
                          {[c.candidat?.prenom, c.candidat?.nom].filter(Boolean).join(" ") || "Membre"}
                        </Text>
                        {!!c.candidat?.niveau && (
                          <Text style={[styles.candMeta, { color: colors.textMuted }]}>{c.candidat.niveau}</Text>
                        )}
                      </View>
                      {c.statut !== "en_attente" && (
                        <View
                          style={[
                            styles.statutPill,
                            {
                              backgroundColor:
                                c.statut === "acceptee" ? colors.primaryLight : colors.surfaceAlt,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statutPillText,
                              { color: c.statut === "acceptee" ? colors.primaryDark : colors.textMuted },
                            ]}
                          >
                            {c.statut === "acceptee" ? "Acceptée" : "Refusée"}
                          </Text>
                        </View>
                      )}
                    </View>

                    {!!c.message && (
                      <Text style={[styles.candMessage, { color: colors.textMuted }]}>{c.message}</Text>
                    )}

                    {c.statut === "en_attente" && (
                      <View style={styles.candActions}>
                        <Button
                          label="Accepter"
                          size="sm"
                          onPress={() => received.accepter(c.id)}
                          loading={received.actingId === c.id}
                          style={{ flex: 1 }}
                        />
                        <Button
                          label="Refuser"
                          size="sm"
                          variant="outline"
                          onPress={() => received.refuser(c.id)}
                          disabled={received.actingId === c.id}
                          style={{ flex: 1 }}
                        />
                      </View>
                    )}
                  </View>
                ))
              )}
            </>
          ) : !session ? (
            <View style={[styles.ownerBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.ownerText, { color: colors.textMuted }]}>
                Connectez-vous pour contacter {contactFirstName}.
              </Text>
              <Button
                label="Se connecter"
                size="sm"
                onPress={() => router.push("/(auth)/login")}
                style={{ marginTop: Spacing.sm }}
              />
            </View>
          ) : canContact ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Candidater</Text>
              {candidature.loading ? null : candidature.mine && candidature.mine.statut === "en_attente" ? (
                <View style={[styles.candStatusBox, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.ownerText, { color: colors.primaryDark }]}>
                    Candidature envoyée — en attente de réponse.
                  </Text>
                  <Button
                    label="Retirer ma candidature"
                    variant="outline"
                    size="sm"
                    onPress={candidature.retirer}
                    loading={candidature.submitting}
                    style={{ marginTop: Spacing.sm }}
                  />
                </View>
              ) : candidature.mine && candidature.mine.statut === "acceptee" ? (
                <View style={[styles.candStatusBox, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.ownerText, { color: colors.primaryDark }]}>
                    🎉 Votre candidature a été acceptée. Écrivez à {contactFirstName} pour la suite.
                  </Text>
                </View>
              ) : candidature.mine && candidature.mine.statut === "refusee" ? (
                <View style={[styles.candStatusBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.ownerText, { color: colors.textMuted }]}>
                    Votre candidature n&apos;a pas été retenue cette fois.
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    value={coverLetter}
                    onChangeText={setCoverLetter}
                    placeholder="Un mot pour vous présenter (optionnel)…"
                    placeholderTextColor={colors.textSubtle}
                    style={[
                      styles.chatInput,
                      { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, marginBottom: Spacing.sm },
                    ]}
                    multiline
                  />
                  <Button
                    label="Envoyer ma candidature"
                    onPress={async () => {
                      const ok = await candidature.postuler(coverLetter);
                      if (ok) setCoverLetter("");
                    }}
                    loading={candidature.submitting}
                  />
                  {!!candidature.error && (
                    <Text style={[styles.chatHint, { color: colors.error }]}>{candidature.error}</Text>
                  )}
                </>
              )}

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contacter {contactFirstName}</Text>

              {annonce.telephone && (
                <TouchableOpacity
                  style={[styles.phoneBtn, { borderColor: colors.border }]}
                  onPress={() => Linking.openURL(`tel:${annonce.telephone}`)}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="bubble.left.fill" size={16} color={colors.primary} />
                  <Text style={[styles.phoneText, { color: colors.text }]}>{annonce.telephone}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.chatRow}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={`Écrivez un message à ${contactFirstName}…`}
                  placeholderTextColor={colors.textSubtle}
                  style={[
                    styles.chatInput,
                    { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  multiline
                />
                <TouchableOpacity
                  onPress={onSend}
                  disabled={sending || !draft.trim()}
                  style={[styles.chatSend, { backgroundColor: colors.primary, opacity: sending || !draft.trim() ? 0.5 : 1 }]}
                >
                  <Text style={styles.chatSendLabel}>{sending ? "…" : "Envoyer"}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.chatHint, { color: colors.textSubtle }]}>
                Votre message ouvre une conversation privée dans Messages.
              </Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      {!!annonce.id && (
        <ReportSheet
          visible={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="annonce"
          targetId={annonce.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  topBarBtn: { flexDirection: "row", alignItems: "center", gap: 2 },

  scroll: { paddingBottom: 48 },

  photoStrip: { maxHeight: 240 },
  photo: { width: 360, height: 240 },

  content: { padding: Spacing.lg },

  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  date: { fontSize: 12 },
  title: { fontSize: 23, fontWeight: "800", lineHeight: 29, letterSpacing: -0.4 },

  sportLine: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: Spacing.sm, marginBottom: Spacing.lg },
  sportIcon: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  sportText: { fontSize: 14, fontWeight: "500" },

  card: { borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: Spacing.md },
  factRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, gap: Spacing.md },
  factLabel: { fontSize: 13 },
  factValue: { fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right" },

  sectionTitle: { fontSize: 15, fontWeight: "700", marginTop: Spacing.lg, marginBottom: Spacing.sm },
  description: { fontSize: 15, lineHeight: 22 },

  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  authorNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  authorName: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill },
  rolePillText: { fontSize: 11, fontWeight: "700" },
  authorBio: { fontSize: 13, lineHeight: 18, marginTop: 2 },

  ownerBox: { marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.lg },
  ownerText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },

  candStatusBox: { padding: Spacing.md, borderRadius: Radius.lg },
  candCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  candHead: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  candName: { fontSize: 14, fontWeight: "700" },
  candMeta: { fontSize: 12, marginTop: 1 },
  candMessage: { fontSize: 13, lineHeight: 19 },
  candActions: { flexDirection: "row", gap: Spacing.sm },
  statutPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  statutPillText: { fontSize: 11, fontWeight: "700" },

  phoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
  },
  phoneText: { fontSize: 15, fontWeight: "600" },

  chatRow: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.sm },
  chatInput: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    maxHeight: 120,
  },
  chatSend: { borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 15 },
  chatSendLabel: { color: "#fff", fontWeight: "700", fontSize: 15 },
  chatHint: { fontSize: 12, marginTop: 6 },

  modRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: Spacing.lg },
  modLink: { fontSize: 13, fontWeight: "600" },
});
