import { PokemonAbility } from '@/domain/entities/PokemonAbility'
import { PokemonPreview } from '@/domain/entities/PokemonPreview'
import { PokemonType } from '@/domain/entities/PokemonType'
import { ResourcePage } from '@/domain/entities/ResourcePage'
import { ListPokemonAbilities } from '@/domain/use-cases/ListPokemonAbilities'
import { ListPokemonPreviews } from '@/domain/use-cases/ListPokemonPreviews'
import { ListPokemonTypes } from '@/domain/use-cases/ListPokemonTypes'
import axios from 'axios'
import { ListPokemonAbilitiesAdapter } from './adapters/ListPokemonAbilities'
import { ListPokemonPreviewsAdapter } from './adapters/ListPokemonPreviews'
import { ListPokemonTypesAdapter } from './adapters/ListPokemonTypes'
import { BuildListPokemonAbilitiesQuery } from './queries/ListPokemonAbilities'
import { BuildListPokemonPreviewsQuery } from './queries/ListPokemonPreviews'
import { BuildListPokemonTypesQuery } from './queries/ListPokemonTypes'

export class PokeApiGraphQLClient
  implements ListPokemonPreviews, ListPokemonAbilities, ListPokemonTypes
{
  constructor(private readonly url: string = 'https://beta.pokeapi.co/graphql/v1beta') {}

  async listPokemonAbilities(): Promise<PokemonAbility[]> {
    const query = BuildListPokemonAbilitiesQuery()
    const { data } = await axios.post(this.url, {
      query
    })
    return ListPokemonAbilitiesAdapter.map(data.data)
  }

  async listPokemonTypes(): Promise<PokemonType[]> {
    const query = BuildListPokemonTypesQuery()
    const { data } = await axios.post(this.url, {
      query
    })
    return ListPokemonTypesAdapter.map(data.data)
  }

  async listPokemonPreviews({
    limit,
    offset,
    filters
  }: {
    limit?: number
    offset?: number
    filters?: { types?: { firstSlot: string; secondSlot?: string } }
  }): Promise<ResourcePage<PokemonPreview>> {
    const variables: { limit?: number; offset?: number; firstType?: string; secondType?: string } =
      {}
    if (limit) variables.limit = limit
    if (offset) variables.offset = offset
    if (filters && filters.types) {
      if (filters.types.firstSlot && filters.types.firstSlot != 'any')
        variables.firstType = filters.types.firstSlot
      if (
        filters.types.secondSlot &&
        filters.types.secondSlot != 'any' &&
        filters.types.secondSlot != 'none'
      )
        variables.secondType = filters.types.secondSlot
    }

    const query = BuildListPokemonPreviewsQuery({ limit, offset, filters })

    const { data } = await axios.post(this.url, {
      query,
      variables
    })

    return ListPokemonPreviewsAdapter.map(data.data, { limit, offset })
  }
}
