export function BuildListPokemonTypesQuery(): string {
  const query = `#graphql
    query {
      pokemon_v2_pokemontype(distinct_on: type_id) {
        pokemon_v2_type {
          name
        }
      }
    }`

  return query
}
