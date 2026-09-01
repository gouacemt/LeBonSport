import { useMockAsyncData } from './useMockAsyncData'

const MOCK_NOTIFICATIONS = [
  { id: 'n1', icon: 'hand.wave.fill' as const, titre: 'Bienvenue sur LeBonSport', texte: 'Complétez votre profil pour de meilleures recommandations.', quand: 'Aujourd\'hui' },
  { id: 'n2', icon: 'sport.soccer' as const, titre: 'Nouvelle annonce dans votre sport', texte: 'Une partie de football vient d\'être publiée près de chez vous.', quand: 'Hier' },
  { id: 'n3', icon: 'star.fill' as const, titre: 'Rappel', texte: 'Vous avez une annonce en favoris qui approche de sa date.', quand: 'Il y a 2 jours' },
]

export function useNotificationsFeed() {
  return useMockAsyncData(MOCK_NOTIFICATIONS)
}
