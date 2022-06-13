import { Box, Card, Chip, Grid } from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'
import Image from 'next/image'
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
    <Card sx={{ padding: 2 }} elevation={2} {...restProps}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center' }}>
        <Box sx={{ display: 'grid', gap: 1, justifyItems: 'flex-start' }}>
          <Typography variant='h5' fontWeight={'500'}>
            {pokemon.name}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridAutoFlow: 'column',
              justifyItems: 'flex-start',
              justifyContent: 'flex-start'
            }}
          >
            {pokemon.types &&
              pokemon.types.map((type) => (
                <Chip key={type.type.name} label={type.type.name} color='primary' />
              ))}
          </Box>
        </Box>
        {pokemon.sprites?.front_default && (
          <Image
            src={pokemon.sprites.front_default}
            width={100}
            height={'100%'}
            layout='fixed'
            alt="Pokemon's sprite"
          />
        )}
      </Box>
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

      const pokemonDataList = await Promise.all(
        pokemonsList.map(async ({ name }) => pokedex.getPokemonByName(name))
      )

      return { pokemonDataList, pokemonsPage }
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
          width: '100%',
          height: '100vh'
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
