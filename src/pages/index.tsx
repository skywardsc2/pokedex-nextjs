import { Grid } from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'
import Pokedex, { NamedAPIResource } from 'pokedex-promise-v2'
import * as React from 'react'

const pokedex = new Pokedex()

const Home: NextPage = () => {
  const [pokemons, setPokemons] = React.useState<NamedAPIResource[]>()
  const [status, setStatus] = React.useState<'loading' | 'success' | 'failed'>()
  const [errorMsg, setErrorMsg] = React.useState<unknown>()

  React.useEffect(() => {
    async function fetchPokemonList() {
      setStatus('loading')
      try {
        const result = await (await pokedex.getPokemonsList({ limit: 8 })).results
        setPokemons(result)
        setStatus('success')
      } catch (e: any) {
        setStatus('failed')
        setErrorMsg(e.msg)
      }
    }

    fetchPokemonList()
  }, [])

  if (status === 'loading') {
    return <Typography>Loading...</Typography>
  }

  if (status === 'failed') {
    return <Typography>{`Error: ${errorMsg}`}</Typography>
  }

  return (
    <Container>
      <Grid container columns={{ xs: 1, sm: 2 }}>
        {pokemons &&
          pokemons.map((pokemon) => (
            <Grid item xs={1} sm={1} textAlign='center' key={pokemon.name}>
              {pokemon.name}
            </Grid>
          ))}
      </Grid>
    </Container>
  )
}

export default Home
