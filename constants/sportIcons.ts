import type { IconSymbolName } from '@/components/ui/icon-symbol'

const SPORT_ICONS: Record<string, IconSymbolName> = {
  Football: 'sport.soccer',
  Basketball: 'sport.basketball',
  Tennis: 'sport.tennis',
  Padel: 'sport.tennis',
  Badminton: 'sport.tennis',
  Squash: 'sport.tennis',
  Running: 'sport.running',
  Volleyball: 'sport.volleyball',
  Natation: 'sport.swimming',
  Cyclisme: 'sport.cycling',
  Rugby: 'sport.rugby',
  Handball: 'sport.handball',
  Boxe: 'sport.boxing',
  Judo: 'sport.martialarts',
  'Arts martiaux': 'sport.martialarts',
  Fitness: 'sport.fitness',
  Randonnée: 'sport.hiking',
  Ski: 'sport.skiing',
  Surf: 'sport.surfing',
  Yoga: 'sport.yoga',
}

export function getSportIcon(nom: string | null | undefined): IconSymbolName {
  if (!nom) return 'sport.generic'
  return SPORT_ICONS[nom] ?? 'sport.generic'
}
