import { PokemonAbility } from '@/domain/entities/PokemonAbility'
import { PokemonAbilityAdapter } from './PokemonAbility'

export class ListPokemonAbilitiesAdapter {
  static map(data: any): PokemonAbility[] {
    return data.pokemon_v2_ability.map((ability: { name: string }) =>
      PokemonAbilityAdapter.map(ability)
    )
  }
}
