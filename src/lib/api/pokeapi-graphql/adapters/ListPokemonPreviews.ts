import { PokemonPreview } from '@/lib/domain/entities/PokemonPreview'
import { ResourcePage } from '@/lib/domain/entities/ResourcePage'
import { PokemonPreviewAdapter } from './PokemonPreview'

export class ListPokemonPreviewsAdapter {
  static map(
    data: any,
    { limit, offset = 0 }: { limit?: number; offset?: number }
  ): ResourcePage<PokemonPreview> {
    let count = data.pokemon_v2_pokemon_aggregate.aggregate.count
    let hasNextPage = false
    if (limit) {
      hasNextPage = !(data.pokemon_v2_pokemon.length < limit || offset + limit >= count)
    }

    const pokemonPreviewsPage = {
      count,
      hasNextPage,
      results: data.pokemon_v2_pokemon.map((pokemon: any) => PokemonPreviewAdapter.map(pokemon))
    }

    return pokemonPreviewsPage
  }
}
