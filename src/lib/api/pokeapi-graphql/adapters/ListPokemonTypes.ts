import { PokemonType } from '@/domain/entities/PokemonType'
import { PokemonTypeAdapter } from './PokemonType'

export class ListPokemonTypesAdapter {
  static map(data: any): PokemonType[] {
    const apiTypes = data.pokemon_v2_pokemontype.map((type: { name: string }) =>
      PokemonTypeAdapter.map(type)
    )

    apiTypes.push({ name: 'any', slot: 1 })
    apiTypes.push({ name: 'none', slot: 1 })

    return apiTypes
  }
}
