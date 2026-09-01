import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function useThemeColor(
  props: { light?: string },
  colorName: keyof typeof Colors.light
) {
  const { theme } = useTheme();
  return props.light ?? Colors[theme][colorName];
}
