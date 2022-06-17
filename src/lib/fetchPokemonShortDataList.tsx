import Pokedex from 'pokedex-promise-v2'
import { Constants } from './constants'
import { PokemonShortDataList } from './types/PokemonShortDataList'

export async function fetchPokemonShortDataList({
  limit = Constants.POKEMONS_PER_PAGE,
  offset = 0
}): Promise<PokemonShortDataList> {
  const pokedex = new Pokedex()

  const pokemonList = await pokedex.getPokemonsList({
    limit,
    offset
  })

  const pokemonDataList = await Promise.all(
    pokemonList.results.map(async ({ name }) => {
      const pokemonOrList = await pokedex.getPokemonByName(name)
      if (Array.isArray(pokemonOrList)) return pokemonOrList[0]
      return pokemonOrList
    })
  )

  // Filter pokemon data for the preview cards
  const pokemonShortDataPage: PokemonShortDataList = {
    ...pokemonList,
    results: pokemonDataList.map(({ name, id, types, sprites }) => ({
      name,
      id,
      types,
      sprite: sprites?.front_default
    }))
  }

  return pokemonShortDataPage
}
