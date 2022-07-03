export type ResourcePage<T> = {
  count: number
  hasNextPage: boolean
  results: T[]
}
