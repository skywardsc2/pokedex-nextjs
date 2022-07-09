import * as React from 'react'

import { PokemonPreview } from '@/domain/entities/PokemonPreview'
import { ResourcePage } from '@/domain/entities/ResourcePage'
import { PokeApiGraphQLClient } from '@/lib/api/pokeapi-graphql/Client'

import { PokemonCard } from '@/ui/components/PokemonCard/PokemonCard'
import {
  AppBar,
  Badge,
  Box,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  SelectChangeEvent,
  styled,
  Toolbar
} from '@mui/material'
import Typography from '@mui/material/Typography'

import { FilterAltRounded } from '@mui/icons-material'
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

const Home: NextPage<PageProps> = ({ initialPokemonPreviews }) => {
  const [pokemonTypesFilter, setPokemonTypesFilter] = React.useState<string[]>(['normal'])
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

  const scrollableContainer = {
    ref: React.createRef<HTMLDivElement>(),
    id: 'scrollableContainer'
  }

  const [sidebarIsOpenMobile, setSidebarIsOpenMobile] = React.useState(false)
  const handleSidebarToggle = () => setSidebarIsOpenMobile((isOpen) => !isOpen)
  const drawer = (
    <Box onClick={handleSidebarToggle} sx={{ textAlign: 'center' }}>
      <Typography variant='h6' sx={{ my: 2 }}>
        MUI
      </Typography>
      <Divider />
      <List>
        <ListItem key={'types'} disablePadding>
          <ListItemButton sx={{ textAlign: 'center' }}>
            <ListItemText primary={'Item'} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  const handlePokemonTypesSelectChange = (event: SelectChangeEvent<typeof pokemonTypesFilter>) => {
    const value = event.target.value
    setPokemonTypesFilter(getMultiSelectValueAsArray(value))

    scrollDivToTop(scrollableContainer.ref)
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (isError) {
    return <Typography>{`Error: ${error}`}</Typography>
  }

  return (
    <Box sx={{ height: '100vh', display: 'grid' }}>
      {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', paddingY: 2, position: 'sticky', top: '16px' }}>
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
        <IconButton />
      </Box> */}
      <AppBar component={'header'} position='sticky'>
        <Toolbar>
          <Container>
            <Box sx={{ display: 'flex', px: { lg: 3 } }}>
              <IconButton size='large' color='inherit' edge='start' onClick={handleSidebarToggle}>
                <Badge badgeContent={1} color='secondary'>
                  <FilterAltRounded />
                </Badge>
              </IconButton>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
      <Box component='nav'>
        <Drawer
          variant='temporary'
          open={sidebarIsOpenMobile}
          onClose={handleSidebarToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block' },
            '& .MuiDrawer-paper': { width: '240px' }
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Container sx={{ py: 3 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          {pokemonTypesFilter && 'Filtering by:'}
          {pokemonTypesFilter && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Type:{' '}
              {pokemonTypesFilter.map((type) => (
                <Chip label={type} sx={{ mx: 1 }} key={type}></Chip>
              ))}
            </Box>
          )}
        </Box>
        <StyledInfiniteScroll
          dataLength={getCurrentPokemonCount(pokemonPreviewsQuery)}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<Typography variant='h4'>Loading...</Typography>}
          style={{
            overflow: 'visible'
          }}
        >
          <Grid container py={4} columns={{ xs: 1, sm: 3 }} spacing={1}>
            {pokemonPreviewsQuery?.pages.map(MapPokemonDataList)}
          </Grid>
        </StyledInfiniteScroll>
      </Container>
    </Box>
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
