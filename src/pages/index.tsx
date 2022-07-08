import * as React from 'react'

import { PokemonPreview } from '@/domain/entities/PokemonPreview'
import { ResourcePage } from '@/domain/entities/ResourcePage'
import { PokeApiGraphQLClient } from '@/lib/api/pokeapi-graphql/Client'

import { MultiSelectFilter } from '@/ui/components/MultiSelectFilter/MultiSelectFilter'
import { PokemonCard } from '@/ui/components/PokemonCard/PokemonCard'
import {
  Box,
  Checkbox,
  Grid,
  ListItemText,
  MenuItem,
  SelectChangeEvent,
  styled
} from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import type { GetStaticProps, NextPage } from 'next'
import InfiniteScroll from 'react-infinite-scroll-component'
import { InfiniteData, useInfiniteQuery } from 'react-query'

const StyledInfiniteScroll = styled(InfiniteScroll)``

const POKEAPI_POKEMONS_PER_PAGE = parseInt(process.env.POKEAPI_POKEMONS_PER_PAGE || '24')
const PokeApiClient = new PokeApiGraphQLClient()

async function fetchPokemonPreviews({
  pageParam = 0,
  queryKey
}: {
  pageParam?: any
  queryKey: (string | string[])[]
}) {
  let types = queryKey[1]

  if (!Array.isArray(types)) types = [types]

  return PokeApiClient.listPokemonPreviews({
    limit: POKEAPI_POKEMONS_PER_PAGE,
    offset: pageParam * POKEAPI_POKEMONS_PER_PAGE,
    filters: {
      types: types
    }
  })
}

type PageProps = {
  initialPokemonPreviews: ResourcePage<PokemonPreview>
  pokemonTypes: { name: string }[]
  pokemonAbilities: { name: string }[]
}

const Home: NextPage<PageProps> = ({ initialPokemonPreviews, pokemonTypes }) => {
  const scrollableDivRef = React.createRef<HTMLDivElement>()
  const [pokemonTypesFilter, setPokemonTypesFilter] = React.useState<string[]>([])

  const {
    data: pokemonPreviewsQuery,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery(['infinite-get-all-pokemons', pokemonTypesFilter], fetchPokemonPreviews, {
    placeholderData: {
      pages: [initialPokemonPreviews],
      pageParams: [0]
    },
    getNextPageParam: (lastPage, pages) => lastPage.hasNextPage && pages.length
  })

  const handlePokemonTypesSelectChange = (event: SelectChangeEvent<typeof pokemonTypesFilter>) => {
    const value = event.target.value
    setPokemonTypesFilter(getMultiSelectValueAsArray(value))

    scrollDivToTop(scrollableDivRef)
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (isError) {
    return <Typography>{`Error: ${error}`}</Typography>
  }

  return (
    <Container sx={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', paddingY: 2, position: 'sticky', top: '16px' }}>
        <MultiSelectFilter<typeof pokemonTypesFilter>
          label='Types'
          selectProps={{
            value: pokemonTypesFilter,
            onChange: handlePokemonTypesSelectChange,
            renderValue: (selected) => selected.join(', ')
          }}
        >
          {pokemonTypes.map((type) => (
            <MenuItem key={type.name} value={type.name}>
              <Checkbox checked={filterHasType(pokemonTypesFilter, type)} />
              <ListItemText primary={type.name} />
            </MenuItem>
          ))}
        </MultiSelectFilter>
      </Box>
      <Box
        ref={scrollableDivRef}
        id='scrollableContainer'
        sx={{ display: 'flex', width: '100%', height: '100%', overflowY: 'scroll' }}
      >
        <StyledInfiniteScroll
          scrollableTarget='scrollableContainer'
          dataLength={getCurrentPokemonCount(pokemonPreviewsQuery)}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<Typography variant='h4'>Loading...</Typography>}
          sx={{
            width: '100%',
            minHeight: '100vh',
            paddingX: 2
          }}
        >
          <Grid container py={4} columns={{ xs: 1, sm: 3 }} spacing={1}>
            {pokemonPreviewsQuery?.pages.map(MapPokemonDataList)}
          </Grid>
        </StyledInfiniteScroll>
      </Box>
    </Container>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const initialPokemonPreviews = await PokeApiClient.listPokemonPreviews({
    limit: POKEAPI_POKEMONS_PER_PAGE,
    offset: 0
  })
  const pokemonTypes = await PokeApiClient.listPokemonTypes()
  const pokemonAbilities = await PokeApiClient.listPokemonAbilities()

  return {
    props: {
      initialPokemonPreviews,
      pokemonTypes,
      pokemonAbilities
    }
  }
}

export default Home

function MapPokemonDataList(pokemonDataPage: ResourcePage<PokemonPreview>): JSX.Element[] {
  return pokemonDataPage.results.map(MapPokemonData)
}

function MapPokemonData(pokemonData: PokemonPreview): JSX.Element {
  return (
    <Grid item xs={1} sm={1} textAlign='center' key={pokemonData?.name}>
      <PokemonCard pokemon={pokemonData} />
    </Grid>
  )
}

function getCurrentPokemonCount(
  pokemonPreviewsQuery?: InfiniteData<ResourcePage<PokemonPreview>>
): number {
  return (pokemonPreviewsQuery?.pages.length || 0) * POKEAPI_POKEMONS_PER_PAGE
}

function filterHasType(pokemonTypesFilter: string[], type: { name: string }): boolean | undefined {
  return pokemonTypesFilter.indexOf(type.name) > -1
}

function getMultiSelectValueAsArray(value: string | string[]): string[] {
  return typeof value === 'string' ? value.split(',') : value
}

function scrollDivToTop(scrollableDivRef: React.RefObject<HTMLDivElement>) {
  scrollableDivRef.current?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
