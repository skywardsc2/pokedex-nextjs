import { Box, Card, Chip } from '@mui/material'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import * as React from 'react'
import { PokemonShortData } from '../../lib/types/PokemonShortData'

type PokemonCardProps = { pokemon?: PokemonShortData } & React.ComponentPropsWithRef<'div'>

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, ...restProps }) => {
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
