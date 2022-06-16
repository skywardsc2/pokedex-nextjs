import { Box, Card, Chip, Grid, styled } from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import * as React from 'react'

import type { GetStaticProps, NextPage } from 'next'
import Image from 'next/image'

import Pokedex, { NamedAPIResourceList, Pokemon } from 'pokedex-promise-v2'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useInfiniteQuery } from 'react-query'

const StyledInfiniteScroll = styled(InfiniteScroll)``

const pokedex = new Pokedex()
const POKEMONS_PER_PAGE = 20

type PokemonComponentProps = { pokemon?: PokemonShortData } & React.ComponentPropsWithRef<'div'>

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
        {pokemon.sprite && (
          <Image
            src={pokemon.sprite}
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

type PokemonShortData = Pick<Pokemon, 'name' | 'id' | 'types'> & {
  sprite: string | null
}

type PokemonShortDataPage = Omit<NamedAPIResourceList, 'results'> & {
  results: PokemonShortData[]
}

interface PageProps {
  initialPokemonShortDataPage: PokemonShortDataPage
  pokemonTypeList: { name: string }[]
  pokemonAbilityList: { name: string }[]
}

const MapPokemonData = (pokemonData: PokemonShortData): JSX.Element => {
  return (
    <Grid item xs={1} sm={1} textAlign='center' key={pokemonData?.name}>
      <PokemonCard pokemon={pokemonData} />
    </Grid>
  )
}

const MapPokemonDataPage = (pokemonDataPage: PokemonShortDataPage): JSX.Element[] => {
  return pokemonDataPage.results.map(MapPokemonData)
}

async function fetchPokemonShortDataPage({
  limit = POKEMONS_PER_PAGE,
  offset = 0
}): Promise<PokemonShortDataPage> {
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
  const pokemonShortDataPage: PokemonShortDataPage = {
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

const Home: NextPage<PageProps> = ({
  initialPokemonShortDataPage: initialPokemonDataPage,
  pokemonTypeList
  // pokemonAbilityList
}) => {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery(
    'infinite-get-all-pokemons',
    async ({ pageParam = 0 }) =>
      fetchPokemonShortDataPage({
        limit: POKEMONS_PER_PAGE,
        offset: pageParam * POKEMONS_PER_PAGE
      }),
    {
      initialData: {
        pages: [initialPokemonDataPage],
        pageParams: [0]
      },
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.next) {
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
    <Container sx={{ paddingTop: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', padding: '1 0' }}>
        {pokemonTypeList.map((type) => (
          <Chip label={type.name} clickable key={type.name} />
        ))}
      </Box>
      <StyledInfiniteScroll
        dataLength={(data?.pages.length || 0) * POKEMONS_PER_PAGE}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<Typography variant='h4'>Loading...</Typography>}
        height={800}
        sx={{
          width: '100%',
          height: '100vh',
          padding: 2
        }}
      >
        <Grid container py={4} columns={{ xs: 1, sm: 3 }} spacing={1}>
          {data?.pages.map(MapPokemonDataPage)}
        </Grid>
      </StyledInfiniteScroll>
    </Container>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const initialPokemonShortDataPage: PokemonShortDataPage = await fetchPokemonShortDataPage({
    limit: POKEMONS_PER_PAGE
  })

  const pokemonTypeList = (await pokedex.getTypesList()).results.map((resource) => ({
    name: resource.name
  }))

  const pokemonAbilityList = (await pokedex.getAbilitiesList()).results.map((resource) => ({
    name: resource.name
  }))

  return {
    props: {
      initialPokemonShortDataPage: initialPokemonShortDataPage,
      pokemonTypeList: pokemonTypeList,
      pokemonAbilityList: pokemonAbilityList
    }
  }
}

export default Home
