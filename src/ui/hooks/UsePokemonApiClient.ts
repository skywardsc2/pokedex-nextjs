import { PokeApiGraphQLClient } from '@/lib/api/pokeapi-graphql/Client'
import { ListPokemonPreviews } from '@/lib/domain/use-cases/ListPokemonPreviews'
import { useState } from 'react'

export function UsePokemonApiClient(): ListPokemonPreviews {
  const [client, setClient] = useState(new PokeApiGraphQLClient())

  return client
}
