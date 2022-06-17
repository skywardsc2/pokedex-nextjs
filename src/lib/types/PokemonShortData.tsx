import { Pokemon } from 'pokedex-promise-v2'

export type PokemonShortData = Pick<Pokemon, 'name' | 'id' | 'types'> & {
  sprite: string | null
}
