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
import { MultiSelectFilter } from 'src/components/MultiSelectFilter/MultiSelectFilter'
import { PokemonCard } from '../components/PokemonCard/PokemonCard'
import { Constants } from '../lib/constants'
import { fetchPokemonShortDataList } from '../lib/fetchPokemonShortDataList'
import { PokemonShortData } from '../lib/types/PokemonShortData'
import { PokemonShortDataList } from '../lib/types/PokemonShortDataList'

const StyledInfiniteScroll = styled(InfiniteScroll)``

export const pokedex = new Pokedex()

interface PageProps {
  initialPokemonShortDataPage: PokemonShortDataList
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

const MapPokemonDataList = (pokemonDataPage: PokemonShortDataList): JSX.Element[] => {
  return pokemonDataPage.results.map(MapPokemonData)
}

const Home: NextPage<PageProps> = ({
  initialPokemonShortDataPage: initialPokemonDataPage,
  pokemonTypeList
  // pokemonAbilityList
}) => {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery(
    'infinite-get-all-pokemons',
    async ({ pageParam = 0 }) =>
      fetchPokemonShortDataList({
        limit: Constants.POKEMONS_PER_PAGE,
        offset: pageParam * Constants.POKEMONS_PER_PAGE
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

  const [typesFilter, setTypesFilter] = React.useState<string[]>([])

  const handleTypesSelectChange = (event: SelectChangeEvent<typeof typesFilter>) => {
    const value = event.target.value
    setTypesFilter(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    )
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (isError) {
    return <Typography>{`Error: ${error}`}</Typography>
  }

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', paddingTop: 4 }}>
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
      <StyledInfiniteScroll
        dataLength={(data?.pages.length || 0) * Constants.POKEMONS_PER_PAGE}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<Typography variant='h4'>Loading...</Typography>}
        sx={{
          width: '100%',
          paddingX: 2
        }}
      >
        <Grid container py={4} columns={{ xs: 1, sm: 3 }} spacing={1}>
          {data?.pages.map(MapPokemonDataList)}
        </Grid>
      </StyledInfiniteScroll>
    </Container>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const initialPokemonShortDataPage: PokemonShortDataList = await fetchPokemonShortDataList({
    limit: Constants.POKEMONS_PER_PAGE
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
