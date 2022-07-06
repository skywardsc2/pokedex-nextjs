import { PokemonAbility } from '@/domain/entities/PokemonAbility'

export class PokemonAbilityAdapter {
  static map(ability: any): PokemonAbility {
    return { name: ability.name }
  }
}
