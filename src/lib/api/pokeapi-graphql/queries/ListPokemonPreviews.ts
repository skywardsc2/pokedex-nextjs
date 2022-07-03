export function BuildListPokemonPreviewsQuery({
  limit,
  offset,
  filters
}: {
  limit?: number
  offset?: number
  filters?: { types?: string[] }
}): string {
  let variables = []
  let filterParams = []
  let aggregateFilterParams = []

  if (limit) {
    variables.push('$limit: Int!')
    filterParams.push('limit: $limit')
  }

  if (offset) {
    variables.push('$offset: Int!')
    filterParams.push('offset: $offset')
  }

  if (filters) {
    if (filters.types && filters.types.length > 0) {
      const paramStr =
        'where: { pokemon_v2_pokemontypes: { pokemon_v2_type: { name: { _in: $types }}}}'
      variables.push('$types: [String!]!')
      filterParams.push(paramStr)
      aggregateFilterParams.push(paramStr)
    }
  }

  filterParams.push('order_by: {id: asc}')

  let variablesString = ''
  let filterParamsString = ''
  let aggregateFilterParamsString = ''

  filterParamsString = '(' + filterParams.join(', ') + ')'

  if (variables.length > 0) {
    variablesString = '(' + variables.join(', ') + ')'
  }

  if (aggregateFilterParams.length > 0) {
    aggregateFilterParamsString = '(' + aggregateFilterParams.join(', ') + ')'
  }

  const query = `#graphql
    query ${variablesString} {
      pokemon_v2_pokemon ${filterParamsString} {
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
      pokemon_v2_pokemon_aggregate ${aggregateFilterParamsString} {
        aggregate {
          count
        }
      }
    }`

  return query
}
