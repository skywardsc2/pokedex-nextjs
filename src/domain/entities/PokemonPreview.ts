import { PokemonType } from './PokemonType'

export type PokemonPreview = {
  id: number
  name: string
  types: PokemonType[]
  sprite: string
}
