import { PokemonPreview } from '@/lib/domain/entities/PokemonPreview'
import { Box, Card, Chip } from '@mui/material'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import * as React from 'react'

type PokemonCardProps = { pokemon?: PokemonPreview } & React.ComponentPropsWithRef<'div'>

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
                <Chip key={type.name} label={type.name} color='primary' />
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
