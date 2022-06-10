import { Card, Grid } from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'
import Pokedex, { Pokemon } from 'pokedex-promise-v2'
import * as React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useInfiniteQuery } from 'react-query'

const pokedex = new Pokedex()
const POKEMONS_PER_PAGE = 20

type PokemonComponentProps = { pokemon?: Pokemon } & React.ComponentPropsWithRef<'div'>

const PokemonCard: React.FC<PokemonComponentProps> = ({ pokemon, ...restProps }) => {
  if (!pokemon) {
    return (
      <Card
        sx={{ display: 'flex', justifyContent: 'space-between', padding: 4 }}
        elevation={2}
        {...restProps}
      >
        <Typography variant='h3' fontWeight={'500'}>
          Loading...
        </Typography>
      </Card>
    )
  }

  return (
    <Card
      sx={{ display: 'flex', justifyContent: 'space-between', padding: 4 }}
      elevation={2}
      {...restProps}
    >
      <Typography variant='h3' fontWeight={'500'}>
        {pokemon.name}
      </Typography>
      {pokemon.id}
    </Card>
  )
}

const Home: NextPage = () => {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery(
    'infinite-get-all-pokemons',
    async ({ pageParam = 0 }) => {
      const pokemonsPage = await pokedex.getPokemonsList({
        limit: POKEMONS_PER_PAGE,
        offset: pageParam * POKEMONS_PER_PAGE
      })
      const pokemonsList = pokemonsPage.results

      async function getPokemonDataList(
        pokemonsList: Pokedex.NamedAPIResource[],
        pokemonsPage: Pokedex.NamedAPIResourceList
      ) {
        const pokemonDataList = await Promise.all(
          pokemonsList.map(async ({ name }) => pokedex.getPokemonByName(name))
        )
        return { pokemonDataList, pokemonsPage }
      }
      return await getPokemonDataList(pokemonsList, pokemonsPage)
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.pokemonsPage.next) {
          return pages.length + 1
        }
      }
    }
  )

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (isError) {
    return <Typography>{`Error: ${error}`}</Typography>
  }

  return (
    <Container>
      <InfiniteScroll
        dataLength={(data?.pages.length || 0) * POKEMONS_PER_PAGE}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<Typography variant='h4'>Loading...</Typography>}
        height={800}
        style={{
          width: '100%'
        }}
      >
        <Grid container py={4} columns={{ xs: 1, sm: 3 }} spacing={1}>
          {data?.pages.map(({ pokemonDataList }) => {
            return pokemonDataList.map((pokemonData) => {
              let pokemon

              if (Array.isArray(pokemonData)) pokemon = pokemonData[0]
              else pokemon = pokemonData

              return (
                <Grid item xs={1} sm={1} textAlign='center' key={pokemon?.name}>
                  <PokemonCard pokemon={pokemon} />
                </Grid>
              )
            })
          })}
        </Grid>
      </InfiniteScroll>
    </Container>
  )
}

export default Home
