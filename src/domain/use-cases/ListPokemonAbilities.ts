import { PokemonAbility } from '../entities/PokemonAbility'

export interface ListPokemonAbilities {
  listPokemonTypes(): Promise<PokemonAbility[]>
}
