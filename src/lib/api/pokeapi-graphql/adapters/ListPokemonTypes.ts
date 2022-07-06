import { PokemonType } from '@/domain/entities/PokemonType'
import { PokemonTypeAdapter } from './PokemonType'

export class ListPokemonTypesAdapter {
  static map(data: any): PokemonType[] {
    return data.pokemon_v2_pokemontype.map((type: { name: string }) => PokemonTypeAdapter.map(type))
  }
}
