import axios from 'axios'
import { PokemonPreview } from 'src/lib/domain/entities/PokemonPreview'
import { ResourcePage } from 'src/lib/domain/entities/ResourcePage'
import { ListPokemonPreviews } from 'src/lib/domain/use-cases/ListPokemonPreviews'
import { ListPokemonPreviewsAdapter } from './adapters/ListPokemonPreviews'
import { BuildListPokemonPreviewsQuery } from './queries/ListPokemonPreviews'

export class PokeApiGraphQLClient implements ListPokemonPreviews {
  constructor(private readonly url: string) {
    this.url = 'https://beta.pokeapi.co/graphql/v1beta'
  }

  async listPokemonPreviews({
    limit,
    offset,
    filters
  }: {
    limit?: number
    offset?: number
    filters?: { types?: string[] }
  }): Promise<ResourcePage<PokemonPreview>> {
    const variables: { limit?: number; offset?: number; types?: string[] } = {}
    if (limit) variables.limit = limit
    if (offset) variables.offset = offset
    if (filters && filters.types && filters.types.length > 0) variables.types = filters.types

    const query = BuildListPokemonPreviewsQuery({ limit, offset, filters })

    const { data } = await axios.post(this.url, {
      query,
      variables
    })

    return ListPokemonPreviewsAdapter.map(data.data, { limit, offset })
  }
}