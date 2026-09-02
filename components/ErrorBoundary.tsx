import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Filet de sécurité global : capture toute exception de rendu React et
 * affiche un écran de repli lisible au lieu d'un crash blanc. Les couleurs
 * sont codées en dur car le boundary doit fonctionner même si le thème casse.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Point de branchement pour Sentry / un logger distant.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.emoji}>😕</Text>
          <Text style={styles.title}>Une erreur est survenue</Text>
          <Text style={styles.subtitle}>
            L&apos;application a rencontré un problème inattendu. Vous pouvez réessayer.
          </Text>

          <Pressable style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </Pressable>

          {__DEV__ && (
            <View style={styles.devBox}>
              <Text style={styles.devTitle}>{error.name}: {error.message}</Text>
              {!!error.stack && <Text style={styles.devStack}>{error.stack}</Text>}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF9" },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  emoji: { fontSize: 44, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: "800", color: "#0F1F17", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 340,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#16A06A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  devBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    maxWidth: 640,
    width: "100%",
  },
  devTitle: { fontWeight: "700", color: "#991B1B", marginBottom: 6 },
  devStack: {
    fontSize: 11,
    color: "#991B1B",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
});
