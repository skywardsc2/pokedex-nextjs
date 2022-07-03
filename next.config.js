/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['raw.githubusercontent.com']
  },
  env: {
    POKEAPI_ENDPOINT_URL: 'https://beta.pokeapi.co/graphql/v1beta',
    POKEAPI_POKEMONS_PER_PAGE: 24
  }
}

module.exports = nextConfig
