import { getSportIcon } from '@/constants/sportIcons'
import { useMockAsyncData } from './useMockAsyncData'

const MOCK_CLUBS = [
  { id: 'c1', nom: 'AS Frontenex Football', sport: 'Football', ville: 'Lyon', membres: 84, icon: getSportIcon('Football') },
  { id: 'c2', nom: 'Padel Club Confluence', sport: 'Padel', ville: 'Lyon', membres: 42, icon: getSportIcon('Padel') },
  { id: 'c3', nom: 'Running Team Rhône', sport: 'Running', ville: 'Villeurbanne', membres: 130, icon: getSportIcon('Running') },
  { id: 'c4', nom: 'Basket Club Part-Dieu', sport: 'Basketball', ville: 'Lyon', membres: 61, icon: getSportIcon('Basketball') },
]

export function usePopularClubs() {
  return useMockAsyncData(MOCK_CLUBS)
}
