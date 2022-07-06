import { PokemonType } from '../entities/PokemonType'

export interface ListPokemonTypes {
  listPokemonTypes(): Promise<PokemonType[]>
}
