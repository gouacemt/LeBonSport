import { getSportIcon } from '@/constants/sportIcons'
import { useMockAsyncData } from './useMockAsyncData'

const MOCK_EVENTS = [
  { id: 'e1', titre: 'Tournoi de padel amateur', date: 'Sam. 26 juillet', ville: 'Lyon', sport: 'Padel', icon: getSportIcon('Padel') },
  { id: 'e2', titre: '10km nocturne des Berges', date: 'Ven. 1 août', ville: 'Lyon', sport: 'Running', icon: getSportIcon('Running') },
  { id: 'e3', titre: 'Coupe inter-clubs de foot à 5', date: 'Dim. 3 août', ville: 'Villeurbanne', sport: 'Football', icon: getSportIcon('Football') },
]

export function useUpcomingEvents() {
  return useMockAsyncData(MOCK_EVENTS)
}
