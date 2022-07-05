import { ListPokemonPreviews } from '@/domain/use-cases/ListPokemonPreviews'
import { PokeApiGraphQLClient } from '@/lib/api/pokeapi-graphql/Client'
import { useState } from 'react'

export function UsePokemonApiClient(): ListPokemonPreviews {
  const [client, setClient] = useState(new PokeApiGraphQLClient())

  return client
}
