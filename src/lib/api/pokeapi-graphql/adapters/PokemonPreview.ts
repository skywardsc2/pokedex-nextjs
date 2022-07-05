import { PokemonPreview } from '@/domain/entities/PokemonPreview'
import { PokemonTypeAdapter } from './PokemonType'

export class PokemonPreviewAdapter {
  static map(pokemon: any): PokemonPreview {
    const sprites = JSON.parse(pokemon.pokemon_v2_pokemonsprites[0].sprites)

    const defaultSprite = sprites?.front_default || null

    return {
      name: pokemon.name,
      id: pokemon.id,
      types: pokemon.pokemon_v2_pokemontypes.map((type: any) => PokemonTypeAdapter.map(type)),
      sprite: defaultSprite
    }
  }
}
