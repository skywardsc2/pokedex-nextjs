export function BuildListPokemonAbilitiesQuery(): string {
  const query = `#graphql
    query {
      pokemon_v2_ability {
        name
      }
    }`

  return query
}
