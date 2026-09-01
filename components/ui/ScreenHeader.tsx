import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { Platform, StyleSheet, Text, View } from "react-native";
import { IconSymbol, IconSymbolName } from "./icon-symbol";

const isWeb = Platform.OS === "web";

type Props = {
  title: string;
  subtitle?: string;
  /** Optional small icon shown in a soft square to the left of the title. */
  icon?: IconSymbolName;
  /** Rendered on the right of the title row (e.g. a Button). */
  right?: React.ReactNode;
};

/**
 * The title block that sits at the top of a screen, just under the app bar.
 * One shared component so every page opens the same way.
 */
export function ScreenHeader({ title, subtitle, icon, right }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {icon && (
          <View style={[styles.icon, { backgroundColor: colors.primaryLight }]}>
            <IconSymbol name={icon} size={20} color={colors.primaryDark} />
          </View>
        )}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: isWeb ? 28 : 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  right: { marginLeft: "auto" },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 560 },
});
