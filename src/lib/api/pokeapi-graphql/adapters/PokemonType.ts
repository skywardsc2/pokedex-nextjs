import { PokemonType } from 'src/lib/domain/entities/PokemonType'

export class PokemonTypeAdapter {
  static map(type: any): PokemonType {
    return { name: type.pokemon_v2_type.name, slot: type.slot || null }
  }
}
