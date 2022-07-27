import { PokemonPreview } from '../entities/PokemonPreview'
import { ResourcePage } from '../entities/ResourcePage'

export interface ListPokemonPreviews {
  listPokemonPreviews({
    limit,
    offset,
    filters
  }: {
    limit?: number
    offset?: number
    filters?: { types?: { firstSlot: string; secondSlot?: string } }
  }): Promise<ResourcePage<PokemonPreview>>
}
