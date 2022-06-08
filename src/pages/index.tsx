import { Card, Grid } from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'
import Pokedex, { Pokemon } from 'pokedex-promise-v2'
import * as React from 'react'
import { useQuery } from 'react-query'

const pokedex = new Pokedex()

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

type WithPokemonDataProps = {
  pokemonIdOrName: string | number | undefined
  Component: React.FC<PokemonComponentProps>
  props?: PokemonComponentProps
}

const WithPokemonData: React.FC<WithPokemonDataProps> = ({ pokemonIdOrName, Component, props }) => {
  let {
    data: pokemon,
    isLoading,
    isIdle,
    isError,
    error
  } = useQuery(
    ['get-pokemon-by-name', pokemonIdOrName],
    async () => {
      return pokedex.getPokemonByName(pokemonIdOrName!)
    },
    {
      enabled: !!pokemonIdOrName
    }
  )

  if (Array.isArray(pokemon)) {
    pokemon = pokemon[0]
  }

  if (isLoading || isIdle) {
    return <Typography>Loading...</Typography>
  }

  if (isError) {
    return <Typography>{`Error: ${error}`}</Typography>
  }

  return <Component pokemon={pokemon} {...props} />
}

const Home: NextPage = () => {
  const {
    data: pokemons,
    isLoading,
    isError,
    error
  } = useQuery('get-all-pokemons', async () => {
    return pokedex.getPokemonsList({ limit: 8 })
  })

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (isError) {
    return <Typography>{`Error: ${error}`}</Typography>
  }

  return (
    <Container>
      <Grid container py={4} columns={{ xs: 1, sm: 3 }} spacing={1}>
        {pokemons &&
          pokemons.results.map((pokemon) => (
            <Grid item xs={1} sm={1} textAlign='center' key={pokemon.name}>
              <WithPokemonData pokemonIdOrName={pokemon.name} Component={PokemonCard} />
            </Grid>
          ))}
      </Grid>
    </Container>
  )
}

export default Home
