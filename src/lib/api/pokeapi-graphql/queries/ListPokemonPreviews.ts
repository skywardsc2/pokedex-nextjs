export function BuildListPokemonPreviewsQuery({
  limit,
  offset,
  filters
}: {
  limit?: number
  offset?: number
  filters?: { types?: { firstSlot: string; secondSlot?: string } }
}): string {
  let variables = []
  let pokemonQueryParameters = []
  let aggregateQueryParameters = []

  if (limit) {
    variables.push('$limit: Int!')
    pokemonQueryParameters.push('limit: $limit')
  }

  if (offset) {
    variables.push('$offset: Int!')
    pokemonQueryParameters.push('offset: $offset')
  }

  if (filters) {
    if (filters.types && filters.types.firstSlot != 'any') {
      let filterParameters =
        'where: { pokemon_v2_pokemontypes: { pokemon_v2_type: { name: { _eq: $firstType } }, slot: { _eq: 1 } } }'
      variables.push('$firstType: String')

      if (filters.types.secondSlot && filters.types.secondSlot != 'any') {
        if (filters.types.secondSlot == 'none') {
          filterParameters =
            'where: { _and: [{ pokemon_v2_pokemontypes: { pokemon_v2_type: { name: { _eq: $firstType }}, slot: { _eq: 1 }}}, { _not: { pokemon_v2_pokemontypes: { slot: { _eq: 2 }}}}]}'
        } else {
          filterParameters =
            'where: { _and: [{ pokemon_v2_pokemontypes: { pokemon_v2_type: { name: { _eq: $firstType }}, slot: { _eq: 1 }}}, { pokemon_v2_pokemontypes: { pokemon_v2_type: { name: {_eq: $secondType }}, slot: { _eq: 2 }}}]}'
          variables.push('$secondType: String')
        }
      }

      pokemonQueryParameters.push(filterParameters)
      aggregateQueryParameters.push(filterParameters)
    }
  }

  pokemonQueryParameters.push('order_by: {id: asc}')

  return BuildQuery(variables, pokemonQueryParameters, aggregateQueryParameters)
}

function BuildQuery(
  variables: any[],
  pokemonQueryParameters: string[],
  aggregateQueryParams: any[]
) {
  const query = `#graphql
    query ${formatQueryParameters(variables)} {
      pokemon_v2_pokemon ${formatQueryParameters(pokemonQueryParameters)} {
        name
        id
        pokemon_v2_pokemontypes {
          pokemon_v2_type {
            name
          }
        }
        pokemon_v2_pokemonsprites {
          sprites
        }
      }
      pokemon_v2_pokemon_aggregate ${formatQueryParameters(aggregateQueryParams)} {
        aggregate {
          count
        }
      }
    }`

  return query
}

function formatQueryParameters(parameters: any[]) {
  if (parameters.length > 0) {
    return '(' + parameters.join(', ') + ')'
  }
  return ''
}
