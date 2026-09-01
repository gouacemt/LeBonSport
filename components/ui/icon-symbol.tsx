import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'plus.circle.fill': 'add-circle',
  'person.fill': 'person',
  'person.crop.circle': 'account-circle',
  'star.fill': 'star',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'bell.fill': 'notifications',
  'gearshape.fill': 'settings',
  'magnifyingglass': 'search',
  'slider.horizontal.3': 'tune',
  'mappin.and.ellipse': 'place',
  'camera.fill': 'photo-camera',
  'xmark': 'close',
  'checkmark.circle.fill': 'check-circle',
  'trash.fill': 'delete',
  'calendar': 'event',
  'lock.fill': 'lock',
  'questionmark.circle.fill': 'help',
  'bubble.left.fill': 'chat-bubble',
  'pencil': 'edit',
  'rectangle.portrait.and.arrow.right': 'logout',
  'chart.bar.fill': 'bar-chart',
  'clipboard.fill': 'assignment',
  'trophy.fill': 'emoji-events',
  'flame.fill': 'local-fire-department',
  'tshirt.fill': 'fitness-center',
  'hand.wave.fill': 'celebration',
  'sport.soccer': 'sports-soccer',
  'sport.basketball': 'sports-basketball',
  'sport.tennis': 'sports-tennis',
  'sport.running': 'directions-run',
  'sport.volleyball': 'sports-volleyball',
  'sport.swimming': 'pool',
  'sport.cycling': 'directions-bike',
  'sport.rugby': 'sports-rugby',
  'sport.handball': 'sports-handball',
  'sport.boxing': 'sports-mma',
  'sport.martialarts': 'sports-martial-arts',
  'sport.fitness': 'fitness-center',
  'sport.hiking': 'hiking',
  'sport.skiing': 'downhill-skiing',
  'sport.surfing': 'surfing',
  'sport.yoga': 'self-improvement',
  'sport.generic': 'sports',
} satisfies IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
