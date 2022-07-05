import { MultiSelectFilter } from '@/components/MultiSelectFilter/MultiSelectFilter'
import { PokeApiGraphQLClient } from '@/lib/api/pokeapi-graphql/Client'
import { PokemonPreview } from '@/lib/domain/entities/PokemonPreview'
import { ResourcePage } from '@/lib/domain/entities/ResourcePage'
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
import Pokedex from 'pokedex-promise-v2'
import * as React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useInfiniteQuery } from 'react-query'
import { PokemonCard } from '../components/PokemonCard/PokemonCard'

const StyledInfiniteScroll = styled(InfiniteScroll)``

export const pokedex = new Pokedex()
const PokeApiClient = new PokeApiGraphQLClient(
  process.env.POKEAPI_ENDPOINT_URL || 'https://beta.pokeapi.co/graphql/v1beta'
)
const POKEAPI_POKEMONS_PER_PAGE = parseInt(process.env.POKEAPI_POKEMONS_PER_PAGE || '24')

const MapPokemonData = (pokemonData: PokemonPreview): JSX.Element => {
  return (
    <Grid item xs={1} sm={1} textAlign='center' key={pokemonData?.name}>
      <PokemonCard pokemon={pokemonData} />
    </Grid>
  )
}

const MapPokemonDataList = (pokemonDataPage: ResourcePage<PokemonPreview>): JSX.Element[] => {
  return pokemonDataPage.results.map(MapPokemonData)
}

async function fetchPokemonPreviews({
  pageParam = 0,
  queryKey
}: {
  pageParam?: any
  queryKey: (string | string[])[]
}) {
  return PokeApiClient.listPokemonPreviews({
    limit: POKEAPI_POKEMONS_PER_PAGE,
    offset: pageParam * POKEAPI_POKEMONS_PER_PAGE,
    filters: {
      types: queryKey[1] as string[]
    }
  })
}

interface PageProps {
  initialPokemonPreviewsList: ResourcePage<PokemonPreview>
  pokemonTypeList: { name: string }[]
  pokemonAbilityList: { name: string }[]
}

const Home: NextPage<PageProps> = ({
  initialPokemonPreviewsList,
  pokemonTypeList
  // pokemonAbilityList
}) => {
  const scrollableDivRef = React.createRef<HTMLDivElement>()
  const [typesFilter, setTypesFilter] = React.useState<string[]>([])
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['infinite-get-all-pokemons', typesFilter],
    fetchPokemonPreviews,
    {
      placeholderData: {
        pages: [initialPokemonPreviewsList],
        pageParams: [0]
      },
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasNextPage) {
          return pages.length
        }
      }
    }
  )

  const handleTypesSelectChange = (event: SelectChangeEvent<typeof typesFilter>) => {
    const value = event.target.value
    setTypesFilter(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    )

    scrollableDivRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
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
        <MultiSelectFilter<typeof typesFilter>
          label='Types'
          selectProps={{
            value: typesFilter,
            onChange: handleTypesSelectChange,
            renderValue: (selected) => selected.join(', ')
          }}
        >
          {pokemonTypeList.map((type) => (
            <MenuItem key={type.name} value={type.name}>
              {/* Checked if type is in array of type filters */}
              <Checkbox checked={typesFilter.indexOf(type.name) > -1} />
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
          dataLength={(data?.pages.length || 0) * POKEAPI_POKEMONS_PER_PAGE}
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
            {data?.pages.map(MapPokemonDataList)}
          </Grid>
        </StyledInfiniteScroll>
      </Box>
    </Container>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const initialPokemonPreviewsList = await PokeApiClient.listPokemonPreviews({
    limit: POKEAPI_POKEMONS_PER_PAGE,
    offset: 0
  })

  const pokemonTypeList = (await pokedex.getTypesList()).results.map((resource) => ({
    name: resource.name
  }))

  const pokemonAbilityList = (await pokedex.getAbilitiesList()).results.map((resource) => ({
    name: resource.name
  }))

  return {
    props: {
      initialPokemonPreviewsList: initialPokemonPreviewsList,
      pokemonTypeList: pokemonTypeList,
      pokemonAbilityList: pokemonAbilityList
    }
  }
}

export default Home
