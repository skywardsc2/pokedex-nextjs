import { NamedAPIResourceList } from 'pokedex-promise-v2'
import { PokemonShortData } from './PokemonShortData'

export type PokemonShortDataList = Omit<NamedAPIResourceList, 'results'> & {
  results: PokemonShortData[]
}
