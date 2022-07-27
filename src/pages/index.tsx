import * as React from 'react'

import { PokemonPreview } from '@/domain/entities/PokemonPreview'
import { ResourcePage } from '@/domain/entities/ResourcePage'
import { PokeApiGraphQLClient } from '@/lib/api/pokeapi-graphql/Client'

import { PokemonCard } from '@/ui/components/PokemonCard/PokemonCard'
import {
  AppBar,
  Badge,
  Box,
  Container,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  Toolbar
} from '@mui/material'
import Typography from '@mui/material/Typography'

import { PokemonAbility } from '@/domain/entities/PokemonAbility'
import { PokemonType } from '@/domain/entities/PokemonType'
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
  let types = queryKey[1] as string[]

  types = types.filter((type) => !!type)

  return PokeApiClient.listPokemonPreviews({
    limit: POKEAPI_POKEMONS_PER_PAGE,
    offset: pageParam * POKEAPI_POKEMONS_PER_PAGE,
    filters: {
      types: {
        firstSlot: types[0],
        secondSlot: types[1]
      }
    }
  })
}

type PageProps = {
  initialPokemonPreviews: ResourcePage<PokemonPreview>
  pokemonTypes: PokemonType[]
  pokemonAbilities: PokemonAbility[]
}

const Home: NextPage<PageProps> = ({ initialPokemonPreviews, pokemonTypes }) => {
  const [pokemonFirstTypeFilter, setPokemonFirstTypeFilter] = React.useState('any')
  const [pokemonSecondTypeFilter, setPokemonSecondTypeFilter] = React.useState('any')
  const {
    data: pokemonPreviewsQuery,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery(
    ['infinite-get-all-pokemons', [pokemonFirstTypeFilter, pokemonSecondTypeFilter]],
    fetchPokemonPreviews,
    {
      placeholderData: {
        pages: [initialPokemonPreviews],
        pageParams: [0]
      },
      getNextPageParam: (lastPage, pages) => lastPage.hasNextPage && pages.length
    }
  )

  const scrollableContainer = {
    ref: React.createRef<HTMLDivElement>(),
    id: 'scrollableContainer'
  }

  const handlePokemonFirstTypeSelectChange = (
    event: SelectChangeEvent<typeof pokemonFirstTypeFilter>
  ) => {
    const value = event.target.value
    setPokemonFirstTypeFilter(value)
    scrollDivToTop(scrollableContainer.ref)
  }

  const handlePokemonSecondTypeSelectChange = (
    event: SelectChangeEvent<typeof pokemonSecondTypeFilter>
  ) => {
    const value = event.target.value
    setPokemonSecondTypeFilter(value)
    scrollDivToTop(scrollableContainer.ref)
  }

  const [sidebarIsOpenMobile, setSidebarIsOpenMobile] = React.useState(false)
  const handleSidebarToggle = () => setSidebarIsOpenMobile((isOpen) => !isOpen)
  const drawer = (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant='h5' sx={{ my: 2 }}>
        Filters
      </Typography>
      <Divider variant='middle' />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <List sx={{ width: '100%', maxWidth: '500px' }}>
          <ListItem key={'types'}>
            <ListItemText primary='Type' primaryTypographyProps={{ variant: 'h6' }} />
            <FormControl sx={{ display: 'inline-grid', gap: 2, gridAutoFlow: 'column' }}>
              <Select
                id='type-select-1'
                value={pokemonFirstTypeFilter}
                onChange={handlePokemonFirstTypeSelectChange}
                renderValue={(selected) => selected}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: getMenuMaxHeight(6.5, 48, 8),
                      width: 250
                    }
                  }
                }}
                sx={{ width: 100 }}
              >
                {pokemonTypes.map(
                  (type) =>
                    type.name != 'none' && (
                      <MenuItem key={type.name} value={type.name}>
                        <ListItemText primary={type.name} />
                      </MenuItem>
                    )
                )}
              </Select>
              <Select
                id='type-select-2'
                value={pokemonSecondTypeFilter}
                onChange={handlePokemonSecondTypeSelectChange}
                renderValue={(selected) => selected}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: getMenuMaxHeight(6.5, 48, 8),
                      width: 250
                    }
                  }
                }}
                sx={{ width: 100 }}
              >
                {pokemonTypes.map((type) => (
                  <MenuItem key={type.name} value={type.name}>
                    <ListItemText primary={type.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </Box>
    </Box>
  )

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (isError) {
    return <Typography>{`Error: ${error}`}</Typography>
  }

  return (
    <Box sx={{ height: '100vh', display: 'grid' }}>
      <AppBar component={'header'} position='sticky'>
        <Toolbar>
          <Container>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { lg: 3 } }}>
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
          anchor='bottom'
          variant='temporary'
          open={sidebarIsOpenMobile}
          onClose={handleSidebarToggle}
          ModalProps={{
            keepMounted: true
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Container sx={{ py: 3 }}>
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

function getMenuMaxHeight(
  visibleItems: number,
  itemHeight: number,
  itemPaddingTop: number
): number {
  return itemHeight * visibleItems + itemPaddingTop
}

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

function scrollDivToTop(scrollableDivRef: React.RefObject<HTMLDivElement>) {
  scrollableDivRef.current?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
